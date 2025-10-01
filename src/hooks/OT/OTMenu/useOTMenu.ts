import type {
  DataFiltrosMant,
  OrdenDeTrabajo,
  GetOrdenesTrabajoInput,
} from '../../../types/OT/OTMenu';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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

  dayjs.extend(utc);

  const getOrdenes = async (
    filtros: GetOrdenesTrabajoInput,
  ): Promise<{ data: OrdenDeTrabajo[]; total: number }> => {
    try {
      const params = new URLSearchParams(
        Object.entries(filtros).reduce(
          (acc, [key, val]) => {
            if (val !== undefined && val !== null) {
              if (key === 'fechaIngreso' || key === 'fechaSalida') {
                acc[key] = dayjs(val).format('YYYY-MM-DD');
              } else {
                acc[key] = String(val);
              }
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
      );

      const url = `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/ot?${params.toString()}`;
      console.log('🔍 URL getOrdenes:', url); // 👈 DEBUG

      const response = await fetch(url);

      if (!response.ok) {
        toast.error('Error al obtener órdenes de trabajo');
        return { data: [], total: 0 };
      }

      const { data, total } = await response.json();

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
