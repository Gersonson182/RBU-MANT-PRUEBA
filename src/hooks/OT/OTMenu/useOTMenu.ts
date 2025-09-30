import type {
  DataFiltrosMant,
  OrdenDeTrabajo,
  GetOrdenesTrabajoInput,
} from '../../../types/OT/OTMenu';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useOTMenu = () => {
  /**
   * Obtiene todos los filtros en un solo request
   */
  const getAllFiltros = async (): Promise<DataFiltrosMant | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/filtros`,
      );

      if (!response.ok) {
        toast.error('Error al obtener filtros de órdenes de trabajo');
        return null;
      }

      const data: DataFiltrosMant = await response.json();
      return data ?? null;
    } catch {
      toast.error('Error de conexión al obtener filtros');
      return null;
    }
  };

  /* Obtiene un filtro específico según el tipo de filtro */
  const getFiltroByTipo = async <K extends keyof DataFiltrosMant>(
    tipo: K,
  ): Promise<DataFiltrosMant[K]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/filtros?tipo=${tipo}`,
      );

      if (!response.ok) {
        toast.error(`Error al obtener filtro de tipo: ${tipo}`);
        return [] as DataFiltrosMant[K];
      }

      const data: DataFiltrosMant[K] = await response.json();
      return data ?? ([] as DataFiltrosMant[K]);
    } catch {
      toast.error(`Error de conexión al obtener filtro de tipo: ${tipo}`);
      return [] as DataFiltrosMant[K];
    }
  };

  const getOrdenes = async (
    filtros: GetOrdenesTrabajoInput,
  ): Promise<{ data: OrdenDeTrabajo[]; total: number }> => {
    try {
      // Convertir el objeto filtros en query params

      const params = new URLSearchParams(
        Object.entries(filtros).reduce(
          (acc, [key, val]) => {
            if (val !== undefined && val !== null) {
              if (key === 'fechaIngreso' || key === 'fechaSalida') {
                // Forzar a YYYY-MM-DD
                if (val instanceof Date) {
                  acc[key] = format(val, 'yyyy-MM-dd');
                } else {
                  // Si viene como string, intentar parsear y reformatear
                  const d = new Date(val);
                  if (!isNaN(d.getTime())) {
                    acc[key] = format(d, 'yyyy-MM-dd');
                  } else {
                    acc[key] = String(val); // fallback
                  }
                }
              } else {
                acc[key] = String(val);
              }
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/ot?${params.toString()}`,
      );

      if (!response.ok) {
        toast.error('Error al obtener órdenes de trabajo');
        return { data: [], total: 0 };
      }

      const { data, total } = await response.json();

      // Tipar los datos con OrdenDeTrabajo
      return {
        data: (data ?? []) as OrdenDeTrabajo[],
        total: total ?? 0,
      };
    } catch {
      toast.error('Error de conexión al obtener órdenes de trabajo');
      return { data: [], total: 0 };
    }
  };

  return {
    getAllFiltros,
    getFiltroByTipo,
    getOrdenes,
  };
};
