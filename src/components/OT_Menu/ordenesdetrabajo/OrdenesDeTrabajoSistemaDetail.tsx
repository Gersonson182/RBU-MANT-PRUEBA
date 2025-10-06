import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from './OrdenDeTrabajoSistemaConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import FallaDeleteDialog from './OrdenDeTrabajoFallasDeleteDialog';
import type { SiglaPreventiva } from '@/types/OT/OTMenu';

type FilaPreventiva = {
  codigoFlota: number;
  marcaBus: string;
};

type Props = { idOrden: number };

type FilaSistema = {
  tempId: number;
  idRelacionFalla: number | null;
  id_falla_principal?: number;
  id_falla_secundaria?: number;
  detalleFallaPrincipal?: string;
  detalleFallaSecundaria?: string;
  isNew?: boolean;
};

export default function OTDetalle({ idOrden }: Props) {
  const {
    getOrdenDetalle,
    getSistemas,
    getSubSistemas,
    updateFalla,
    getMantencionPreventiva,
    getSiglasPreventivasByFlota,
  } = useOTMenu();

  const { data, isLoading } = useQuery({
    queryKey: ['orden-detalle', idOrden],
    queryFn: () => getOrdenDetalle(idOrden),
  });

  const { data: sistemasPrincipales } = useQuery({
    queryKey: ['sistemas-principales'],
    queryFn: getSistemas,
  });

  const queryClient = useQueryClient();

  // --- ESTADOS --- //
  const [editando, setEditando] = useState<number | null>(null);
  const [subSistemasMap, setSubSistemasMap] = useState<Record<number, any[]>>(
    {},
  );

  const [preventivaData, setPreventivaData] = useState<FilaPreventiva | null>(
    null,
  );

  const [codigoFlota, setCodigoFlota] = useState<number | null>(null);
  const [selectedSigla, setSelectedSigla] = useState<string>('');

  // eliminar fallas
  const [openDelete, setOpenDelete] = useState(false);
  const [idFallaSeleccionada, setIdFallaSeleccionada] = useState<number | null>(
    null,
  );

  // snapshot inicial (para comparar cambios)
  const [filasOriginales, setFilasOriginales] = useState<FilaSistema[]>([]);
  // estado editable en UI
  const [filas, setFilas] = useState<FilaSistema[]>([]);

  // NUEVOS ESTADOS PARA UPDATE + MODAL
  const [filaSeleccionada, setFilaSeleccionada] = useState<FilaSistema | null>(
    null,
  );
  const [cambiosPendientes, setCambiosPendientes] = useState<string[]>([]);
  const [modalConfirmar, setModalConfirmar] = useState(false);

  const [siglas, setSiglas] = useState<SiglaPreventiva[]>([]);

  useEffect(() => {
    if (codigoFlota) {
      getSiglasPreventivasByFlota(codigoFlota).then(setSiglas);
    }
  }, [codigoFlota]);

  // --- EFECTO INICIAL PARA CARGAR DATA --- //
  useEffect(() => {
    if (data?.sistemas && sistemasPrincipales) {
      const filasIniciales: FilaSistema[] = data.sistemas.map((s) => {
        const principal = sistemasPrincipales.find(
          (p) => p.detalle_falla_principal === s.detalleFallaPrincipal,
        );
        return {
          tempId: s.idRelacionFalla,
          idRelacionFalla: s.idRelacionFalla,
          id_falla_principal: principal
            ? Number(principal.id_falla_principal)
            : undefined,
          id_falla_secundaria: undefined, // se cargará abajo
          detalleFallaPrincipal: s.detalleFallaPrincipal,
          detalleFallaSecundaria: s.detalleFallaSecundaria,
        };
      });

      setFilas(filasIniciales);
      setFilasOriginales(filasIniciales);

      // precargar subsistemas
      filasIniciales.forEach(async (f) => {
        if (f.id_falla_principal) {
          const subs = await getSubSistemas(f.id_falla_principal);
          setSubSistemasMap((prev) => ({
            ...prev,
            [f.id_falla_principal!]: subs,
          }));
          const match = subs.find(
            (sub) => sub.detalle_falla_secundaria === f.detalleFallaSecundaria,
          );
          if (match) {
            setFilas((prev) =>
              prev.map((fila) =>
                fila.idRelacionFalla === f.idRelacionFalla
                  ? {
                      ...fila,
                      id_falla_secundaria: Number(match.id_falla_secundaria),
                    }
                  : fila,
              ),
            );
          }
        }
      });
    }
  }, [data?.sistemas, sistemasPrincipales]);

  // --- SI ES PREVENTIVA CARGA INFO --- //
  useEffect(() => {
    const cargarPreventiva = async () => {
      if (data?.basic?.tipoOrden === 'Preventiva' && data.basic.numeroBus) {
        const result = await getMantencionPreventiva(data.basic.numeroBus);
        if (result && result.length > 0) {
          const mant = result[0];
          setPreventivaData({
            codigoFlota: mant.codigoFlota,
            marcaBus: mant.marcaBus ?? '',
          });
          setCodigoFlota(mant.codigoFlota);
        }
      }
    };
    cargarPreventiva();
  }, [data?.basic?.tipoOrden, data?.basic?.numeroBus]);

  // --- HANDLERS --- //
  const handleChangePrincipal = async (idPrincipal: number, tempId: number) => {
    const subs = await getSubSistemas(idPrincipal);
    setSubSistemasMap((prev) => ({ ...prev, [idPrincipal]: subs }));
    setFilas((prev) =>
      prev.map((f) =>
        f.tempId === tempId
          ? {
              ...f,
              id_falla_principal: idPrincipal,
              id_falla_secundaria: undefined,
            }
          : f,
      ),
    );
  };

  const handleChangeSecundario = (idSecundario: number, tempId: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f.tempId === tempId ? { ...f, id_falla_secundaria: idSecundario } : f,
      ),
    );
  };

  const handleAgregarFila = () => {
    const tempId = Date.now();
    setFilas((prev) => [
      ...prev,
      {
        tempId,
        idRelacionFalla: null,
        isNew: true,
      },
    ]);
    setEditando(tempId);
  };

  const handleEliminarFila = (fila: FilaSistema) => {
    // Si la fila nunca fue guardada en DB (no tiene idRelacionFalla)
    if (!fila.idRelacionFalla) {
      setFilas((prev) => prev.filter((f) => f.tempId !== fila.tempId));
      toast.info('Subsistema eliminado antes de guardarse.');
      return;
    }

    // Si sí tiene idRelacionFalla → es una falla existente en DB
    setIdFallaSeleccionada(fila.idRelacionFalla);
    setOpenDelete(true);
  };

  // Detectar cambios y abrir modal
  const handleGuardarFila = (fila: FilaSistema) => {
    const original = filasOriginales.find(
      (f) => f.idRelacionFalla === fila.idRelacionFalla,
    );

    const cambios: string[] = [];
    if (original?.id_falla_principal !== fila.id_falla_principal) {
      cambios.push(
        `Falla principal: ${original?.detalleFallaPrincipal} → ${fila.id_falla_principal}`,
      );
    }
    if (original?.id_falla_secundaria !== fila.id_falla_secundaria) {
      cambios.push(
        `Falla secundaria: ${original?.detalleFallaSecundaria} → ${fila.id_falla_secundaria}`,
      );
    }

    if (cambios.length === 0) {
      return toast.info('No hay cambios para actualizar');
    }

    setFilaSeleccionada(fila);
    setCambiosPendientes(cambios);
    setModalConfirmar(true);
  };

  // Confirmar update o create real
  const confirmarUpdate = async () => {
    if (!filaSeleccionada) return;

    try {
      const result = await updateFalla({
        idOrden,
        idRelacionFalla: filaSeleccionada.idRelacionFalla, // puede ser null
        idFallaPrincipal: filaSeleccionada.id_falla_principal!,
        idFallaSecundaria: filaSeleccionada.id_falla_secundaria ?? null,
        idPersonalPrincipal: 33681,
        idPersonalSecundaria: 33681,
        idPerfilPrincipal: 1,
        idPerfilSecundaria: 1,
      });

      if (!result?.success) return;

      // Invalida y refresca el query
      await queryClient.invalidateQueries({
        queryKey: ['orden-detalle', idOrden],
      });

      toast.success(`Cambios guardados: \n${cambiosPendientes.join('\n')}`);

      setEditando(null);
    } catch (err) {
      toast.error('Error al guardar la falla');
    } finally {
      setModalConfirmar(false);
    }
  };

  if (isLoading) return <p>Cargando detalle...</p>;
  if (!data) return <p>No se encontró detalle</p>;

  return (
    <div className='space-y-6'>
      {/* Datos básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Básicos</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4'>
          {/* Número de Orden */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Número de Orden
            </label>
            <Input value={data.basic.numeroOrden ?? ''} disabled />
          </div>

          {/* Patente */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Patente
            </label>
            <Input value={data.basic.patente ?? ''} disabled />
          </div>

          {/* Número de Bus */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Número de Bus
            </label>
            <Input value={data.basic.numeroBus ?? ''} disabled />
          </div>

          {/* Fecha de Ingreso */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Fecha de Ingreso
            </label>
            <Input value={data.basic.fechaIngreso ?? ''} disabled />
          </div>

          {/* Estado */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Estado
            </label>
            <Input value={data.basic.estadoDescripcion ?? ''} disabled />
          </div>

          {/* Taller */}
          <div className='flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Taller
            </label>
            <Input value={data.basic.nombre_taller ?? ''} disabled />
          </div>

          {/* Detalle de Ingreso */}
          <div className='col-span-2 flex flex-col'>
            <label className='mb-1 text-sm font-semibold text-slate-600'>
              Detalle de Ingreso
            </label>
            <textarea
              value={data.basic.detalleIngreso ?? ''}
              disabled
              rows={3}
              className='w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-fuchsia-950'
            />
          </div>
        </CardContent>
      </Card>

      {/*  SOLO SI ES PREVENTIVA */}
      {data.basic.tipoOrden === 'Preventiva' && preventivaData && (
        <Card>
          <CardHeader>
            <CardTitle>Mantención Preventiva</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm font-medium text-slate-600'>
                Marca del Bus
              </label>
              <Input
                value={preventivaData.marcaBus}
                disabled
                className='bg-slate-50 text-slate-700'
              />
            </div>
            <div>
              <label className='text-sm font-medium text-slate-600'>
                Próxima Sigla (Selector)
              </label>
              <Select>
                <SelectTrigger className='w-[220px]'>
                  <SelectValue placeholder='Seleccione sigla próxima' />
                </SelectTrigger>
                <SelectContent>
                  {siglas.length > 0 ? (
                    siglas.map((s) => (
                      <SelectItem
                        key={s.id_man_prev}
                        value={String(s.id_man_prev)}
                      >
                        {s.siglas_preventivo}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value='no-data'>
                      Sin datos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistemas */}
      <Card>
        <CardHeader>
          <CardTitle>Sistemas</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {filas.map((f) => {
            const secundarios = f.id_falla_principal
              ? (subSistemasMap[f.id_falla_principal] ?? [])
              : [];
            const isEditing = editando === f.tempId;

            return (
              <div
                key={f.idRelacionFalla ?? f.tempId}
                className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${
                  f.isNew
                    ? 'border-dashed border-fuchsia-400 bg-fuchsia-50/40'
                    : 'border-slate-200'
                }`}
              >
                <span className='text-sm font-medium text-slate-500'>
                  #{f.idRelacionFalla}
                </span>

                {/* Principal */}
                <Select
                  value={f.id_falla_principal?.toString()}
                  disabled={!isEditing}
                  onValueChange={(val) =>
                    handleChangePrincipal(Number(val), f.tempId)
                  }
                >
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Seleccione principal' />
                  </SelectTrigger>
                  <SelectContent>
                    {sistemasPrincipales?.map((p) => (
                      <SelectItem
                        key={p.id_falla_principal}
                        value={String(p.id_falla_principal)}
                      >
                        {p.detalle_falla_principal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Secundaria */}
                <Select
                  value={f.id_falla_secundaria?.toString()}
                  disabled={!isEditing}
                  onValueChange={(val) =>
                    handleChangeSecundario(Number(val), f.tempId)
                  }
                >
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Seleccione secundaria' />
                  </SelectTrigger>
                  <SelectContent>
                    {secundarios.map((sub) => (
                      <SelectItem
                        key={sub.id_falla_secundaria}
                        value={String(sub.id_falla_secundaria)}
                      >
                        {sub.detalle_falla_secundaria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Acciones */}
                <div className='ml-auto flex gap-2'>
                  <Button
                    size='icon'
                    variant='outline'
                    onClick={() =>
                      isEditing
                        ? handleGuardarFila(f)
                        : setEditando(f.idRelacionFalla)
                    }
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='destructive'
                    onClick={() => handleEliminarFila(f)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Agregar */}
          <div className='mt-2'>
            <Button
              className='bg-fuchsia-950 text-white hover:bg-fuchsia-900'
              onClick={handleAgregarFila}
            >
              <Plus className='mr-2 h-4 w-4' /> Agregar sistema/subsistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmación */}
      {modalConfirmar && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40'>
          <div className='rounded-md bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-bold'>Confirmar cambios</h2>
            <ul className='mb-4 list-disc pl-6 text-sm'>
              {cambiosPendientes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setModalConfirmar(false)}
              >
                Cancelar
              </Button>
              <Button
                className='bg-fuchsia-950 text-white hover:bg-fuchsia-900'
                onClick={confirmarUpdate}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalConfirmar}
        onClose={() => setModalConfirmar(false)}
        onConfirm={confirmarUpdate}
        cambios={cambiosPendientes}
      />

      <FallaDeleteDialog
        open={openDelete}
        setOpen={setOpenDelete}
        idRelacionFalla={idFallaSeleccionada ?? undefined}
        idOrden={idOrden}
      />
    </div>
  );
}
