import type {
  DataFiltrosMant,
  OrdenDeTrabajo,
  GetOrdenesTrabajoInput,
  SistemaFiltro,
  SubsistemaFiltro,
  CreateOrdenTrabajoInput,
  CreateOrdenTrabajoResponse,
  DeleteOrdenTrabajoResponse,
  OrdenTrabajoDetalle,
  UpdateFallaInput,
  UpdateFallaResponse,
  DeleteFallaResponse,
  MantencionPreventiva,
  SiglaPreventiva,
  MantencionPreventivaCrear,
  MantencionPreventivaResponse,
  SiglaPreventivaFlota,
  GetSiglasPreventivasFlotaInput,
  DeleteMantencionPreventivaResponse,
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

  // ESTO SERVIRA PARA EL APARTADO DE SISTEMAS //

  const getOrdenDetalle = async (
    idOrden: number,
  ): Promise<OrdenTrabajoDetalle | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/ordenes/${idOrden}/details`,
      );

      if (!response.ok) {
        toast.error(`Error al obtener detalle de la OT #${idOrden}`);
        return null;
      }

      const data: OrdenTrabajoDetalle = await response.json();
      return data ?? null;
    } catch {
      toast.error(`Error de conexión al obtener detalle de la OT #${idOrden}`);
      return null;
    }
  };

  const updateFalla = async (
    input: UpdateFallaInput,
  ): Promise<UpdateFallaResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/falla`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al actualizar falla: ${errorText}`);
        return null;
      }

      const result: UpdateFallaResponse = await response.json();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      return result;
    } catch (err) {
      toast.error('Error de conexión al actualizar falla');
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

  const deleteFalla = async (
    idRelacionFalla: number,
  ): Promise<DeleteFallaResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/falla/${idRelacionFalla}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al eliminar falla: ${errorText}`);
        return null;
      }

      const result: DeleteFallaResponse = await response.json();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      return result;
    } catch (err) {
      toast.error('Error de conexión al eliminar falla');
      return null;
    }
  };

  const getFallaPreview = async (
    idRelacionFalla: number,
  ): Promise<DeleteFallaResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/falla/${idRelacionFalla}/preview`,
      );

      if (!response.ok) return null;

      const result: DeleteFallaResponse = await response.json();
      return result;
    } catch {
      return null;
    }
  };

  const getMantencionPreventiva = async (
    numeroBus?: number,
    placaPatente?: string,
  ): Promise<MantencionPreventiva[] | []> => {
    try {
      if (!numeroBus && !placaPatente) {
        toast.error('Debe ingresar número de bus o placa patente');
        return [];
      }

      const params = new URLSearchParams();
      if (numeroBus) params.append('numeroBus', String(numeroBus));
      if (placaPatente) params.append('placaPatente', placaPatente);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/mantencion-preventiva?${params.toString()}`,
      );

      if (!response.ok) {
        toast.error('Error al obtener datos de mantención preventiva');
        return [];
      }

      const data = await response.json();
      return data?.data ?? [];
    } catch {
      toast.error('Error de conexión al obtener mantención preventiva');
      return [];
    }
  };

  const getSiglasPreventivasByFlota = async (
    codigoFlota: number,
  ): Promise<SiglaPreventiva[]> => {
    try {
      if (!codigoFlota) {
        toast.error('Debe proporcionar un código de flota');
        return [];
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/siglas-preventivas?codigoFlota=${codigoFlota}`,
      );

      if (!response.ok) {
        toast.error('Error al obtener siglas preventivas');
        return [];
      }

      const result = await response.json();
      return result?.data ?? [];
    } catch {
      toast.error('Error de conexión al obtener siglas preventivas');
      return [];
    }
  };

  // Crea una falla de mantencion preventiva sin asignar mecanico
  const createMantencionPreventiva = async (
    input: MantencionPreventivaCrear,
  ): Promise<MantencionPreventivaResponse | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/ot_preventivo/POST`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al registrar mantención preventiva: ${errorText}`);
        return null;
      }

      const result: MantencionPreventivaResponse = await response.json();

      if (result.success) {
        toast.success(
          result.message || 'Mantención preventiva registrada correctamente',
        );
      } else {
        toast.error(
          result.message || 'Error al registrar mantención preventiva',
        );
      }

      return result;
    } catch (error) {
      console.error('Error en createMantencionPreventiva:', error);
      toast.error('Error de conexión al registrar mantención preventiva');
      return null;
    }
  };

  const getSiglasPreventivasByFlotaYOrden = async (
    input: GetSiglasPreventivasFlotaInput,
  ): Promise<SiglaPreventivaFlota[]> => {
    try {
      const { codigo_flota, id_orden_trabajo } = input;

      if (!codigo_flota || !id_orden_trabajo) {
        toast.error('Faltan parámetros: código de flota o id de OT');
        return [];
      }

      const params = new URLSearchParams({
        codigo_flota: String(codigo_flota),
        id_orden_trabajo: String(id_orden_trabajo),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/ot_preventivo/siglas-preventivas?${params.toString()}`,
      );

      if (!response.ok) {
        toast.error('Error al obtener siglas preventivas de flota');
        return [];
      }

      const data = await response.json();

      if (!data?.success) {
        toast.error(data?.message || 'No se encontraron resultados');
        return [];
      }

      return data.data ?? [];
    } catch (error) {
      console.error('Error en getSiglasPreventivasByFlotaYOrden:', error);
      toast.error('Error de conexión al obtener siglas preventivas');
      return [];
    }
  };

  const deleteMantencionPreventiva = async (
    id_rel_man_prev: number,
  ): Promise<DeleteMantencionPreventivaResponse | null> => {
    try {
      if (!id_rel_man_prev) {
        toast.error('Debe proporcionar el ID de la mantención preventiva');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ordenDeTrabajo/mantencion-preventiva/${id_rel_man_prev}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Error al eliminar mantención preventiva: ${errorText}`);
        return null;
      }

      const result: DeleteMantencionPreventivaResponse = await response.json();

      if (result.success) {
        toast.success(
          result.message || 'Mantención preventiva eliminada correctamente ✅',
        );
      } else {
        toast.error(
          result.message || 'No se encontró la mantención preventiva',
        );
      }

      return result;
    } catch (error) {
      console.error('Error en deleteMantencionPreventiva:', error);
      toast.error('Error de conexión al eliminar mantención preventiva');
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
    getOrdenDetalle,
    updateFalla,
    deleteFalla,
    getFallaPreview,
    getMantencionPreventiva,
    getSiglasPreventivasByFlota,
    createMantencionPreventiva,
    getSiglasPreventivasByFlotaYOrden,
    deleteMantencionPreventiva,
  };
};
