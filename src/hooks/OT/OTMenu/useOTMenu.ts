import type {
  DataFiltrosMant,
  OrdenDeTrabajo,
  GetOrdenesTrabajoInput,
  SistemaFiltro,
  SubsistemaFiltro,
  CreateOrdenTrabajoInput,
  CreateOrdenTrabajoResponse,
  DeleteOrdenTrabajoResponse,
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

      const data = await response.json();

      // Aseguramos que siempre devolvemos un array
      return (data?.[tipo] ?? []) as DataFiltrosMant[K];
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
      console.log(' URL getOrdenes:', url); // DEBUG

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

  const getSistemas = async (): Promise<SistemaFiltro[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/sistemas`,
      );

      if (!response.ok) {
        toast.error('Error al obtener sistemas');
        return [];
      }

      const data: SistemaFiltro[] = await response.json();
      return data ?? [];
    } catch {
      toast.error('Error de conexión al obtener sistemas');
      return [];
    }
  };

  /**
   * Obtiene todos los subsistemas de un sistema específico (por id_falla_principal)
   */
  const getSubSistemas = async (
    idFallaPrincipal: number,
  ): Promise<SubsistemaFiltro[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/sistemas/${idFallaPrincipal}`,
      );

      if (!response.ok) {
        toast.error('Error al obtener subsistemas');
        return [];
      }

      const data: SubsistemaFiltro[] = await response.json();
      return data ?? [];
    } catch {
      toast.error('Error de conexión al obtener subsistemas');
      return [];
    }
  };

  /**
   * Obtiene todos los subsistemas de forma general (sin filtrar por id_falla_principal)
   */
  const getAllSubSistemas = async (): Promise<SubsistemaFiltro[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/sub-sistemas`,
      );

      if (!response.ok) {
        toast.error('Error al obtener todos los subsistemas');
        return [];
      }

      const data: SubsistemaFiltro[] = await response.json();
      return data ?? [];
    } catch {
      toast.error('Error de conexión al obtener todos los subsistemas');
      return [];
    }
  };

  const createOrdenTrabajo = async (
    input: CreateOrdenTrabajoInput,
  ): Promise<CreateOrdenTrabajoResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/orden-trabajo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al crear orden: ${errorText}`);
        return null;
      }

      const result: CreateOrdenTrabajoResponse = await response.json();

      // Mostrar mensaje con datos del backend
      toast.success(
        `${result.message} (OT #${result.data.idSolicitudIngresada})`,
      );

      return result;
    } catch (err) {
      toast.error('Error de conexión al crear orden');
      return null;
    }
  };

  const deleteOrdenTrabajo = async (
    idOrden: number,
  ): Promise<DeleteOrdenTrabajoResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/orden-trabajo/${idOrden}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al eliminar OT: ${errorText}`);
        return null;
      }

      const result: DeleteOrdenTrabajoResponse = await response.json();

      if (result.success) {
        toast.success(result.mensaje);
      } else {
        toast.error(result.mensaje);
      }

      return result;
    } catch (err) {
      toast.error('Error de conexión al eliminar OT');
      return null;
    }
  };

  return {
    getAllFiltros,
    getFiltroByTipo,
    getOrdenes,
    getSistemas,
    getSubSistemas,
    getAllSubSistemas,
    createOrdenTrabajo,
    deleteOrdenTrabajo,
  };
};
