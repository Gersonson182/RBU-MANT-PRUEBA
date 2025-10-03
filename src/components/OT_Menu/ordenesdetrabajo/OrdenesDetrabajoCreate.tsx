import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth/useAuthStore';
import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VirtualizedSearchSelect } from '@/components/ui/VirtualizedSelect';
import { Plus, Trash2 } from 'lucide-react';
import type { SistemaFiltro, SubsistemaFiltro } from '@/types/OT/OTMenu';
import { useFiltroStore } from '@/store/OT/useFilterStore';
import type { CreateOrdenTrabajoInput } from '@/types/OT/OTMenu';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { z } from 'zod';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type FilaSistemaSubsistema = {
  id: number;
  sistema?: number;
  subsistema?: number;
};

export const createOrdenTrabajoSchema = z.object({
  id_personal_ingreso: z.number().positive(),
  id_tipo_orden: z.number().positive(),
  codigo_flota: z.number().positive(),
  detalle_ingreso: z.string().min(3, 'El detalle es obligatorio'),
  fecha_programada: z.string().nullable().optional(),
  codigo_taller: z.number().positive(),
  servicio: z.string().nullable().optional(),
  fallas: z
    .array(
      z.object({
        id_falla_principal: z.number().positive(),
        id_falla_secundaria: z.number().nullable().optional(),
        id_personal_falla_principal: z.number().nullable().optional(),
        id_personal_falla_secundaria: z.number().nullable().optional(),
        id_perfil_principal: z.number().nullable().optional(),
        id_perfil_secundaria: z.number().nullable().optional(),
      }),
    )
    .min(1, 'Debe agregar al menos una falla'),
});

export default function MantencionCreateForm({ open, setOpen }: Props) {
  const legacyUser = useAuthStore((state) => state.legacyUser);
  console.log(
    'legacyUser:',
    legacyUser?.idpersonalcontrolgestion,
    legacyUser?.idperfilusuario,
  );
  console.log(
    'Tipo de dato de idpersonalcontrolgestion:',
    typeof legacyUser?.idpersonalcontrolgestion,
  );

  const { getSistemas, getSubSistemas, getFiltroByTipo, createOrdenTrabajo } =
    useOTMenu();
  const { filtros: filtrosCache } = useFiltroStore();
  const queryClient = useQueryClient();

  // Estados cabecera
  const [selectedBus, setSelectedBus] = useState<number | undefined>();
  const [busOpen, setBusOpen] = useState(false);
  const [tallerSeleccionado, setTallerSeleccionado] = useState<number | null>(
    null,
  );
  const [tipoOTSeleccionado, setTipoOTSeleccionado] = useState<number | null>(
    null,
  );
  const [detalle, setDetalle] = useState<string>('');

  // Opciones
  const [sistemas, setSistemas] = useState<SistemaFiltro[]>([]);
  const [subsistemasPorSistema, setSubsistemasPorSistema] = useState<
    Record<number, SubsistemaFiltro[]>
  >({});
  const [talleres, setTalleres] = useState<any[]>([]);
  const [tiposOt, setTiposOt] = useState<any[]>([]);

  // Filas dinámicas de sistema/subsistema
  const [filas, setFilas] = useState<FilaSistemaSubsistema[]>([
    { id: Date.now() },
  ]);

  // cargar opciones iniciales
  useEffect(() => {
    getSistemas().then(setSistemas);
    getFiltroByTipo('talleres').then(setTalleres);
    getFiltroByTipo('tiposOt').then(setTiposOt);
  }, []);

  const handleSistemaChange = async (filaId: number, idSistema: number) => {
    const subs = await getSubSistemas(idSistema);
    setSubsistemasPorSistema((prev) => ({ ...prev, [idSistema]: subs }));
    setFilas((prev) =>
      prev.map((f) =>
        f.id === filaId
          ? { ...f, sistema: idSistema, subsistema: undefined }
          : f,
      ),
    );
  };

  const handleSubsistemaChange = (filaId: number, idSubsistema: number) => {
    setFilas((prev) =>
      prev.map((f) =>
        f.id === filaId ? { ...f, subsistema: idSubsistema } : f,
      ),
    );
  };

  const handleAgregarFila = () => {
    setFilas((prev) => [...prev, { id: Date.now() }]);
  };

  const handleEliminarFila = (filaId: number) => {
    setFilas((prev) => prev.filter((f) => f.id !== filaId));
  };

  // DEBUG
  const handleGuardar = async () => {
    //  Validación de legacuyUser
    if (!legacyUser?.idpersonalcontrolgestion) {
      toast.error('Error: No se detectó usuario logeado');
      return;
    }
    const input: CreateOrdenTrabajoInput = {
      id_personal_ingreso: Number(legacyUser?.idpersonalcontrolgestion) ?? 0,
      id_tipo_orden: tipoOTSeleccionado ?? 0,
      codigo_flota: selectedBus ?? 0,
      detalle_ingreso: detalle,
      codigo_taller: tallerSeleccionado ?? 0,
      servicio: tipoOTSeleccionado === 6 ? null : null,
      fallas: filas
        .filter((fila) => fila.sistema) // evitamos undefined
        .map((fila) => ({
          id_falla_principal: fila.sistema as number,
          id_falla_secundaria: fila.subsistema ?? null,
          id_personal_falla_principal: legacyUser?.codigoUsuario ?? null,
          id_perfil_principal: legacyUser?.idperfilusuario ?? null,
        })),
    };

    // DEBUG: ver el payload que se enviará
    console.log('Payload OT a enviar:', input);

    const parsed = createOrdenTrabajoSchema.safeParse(input);

    if (!parsed.success) {
      const mensajes = parsed.error.issues.map((e) => e.message).join(', ');
      toast.error(mensajes);
      return;
    }

    // DEBUG: ver los datos ya validados por Zod
    console.log('Payload validado:', parsed.data);

    const result = await createOrdenTrabajo(parsed.data);

    // DEBUG: respuesta desde el backend
    console.log('Respuesta backend:', result);

    if (result) {
      toast.custom(
        (t: any) => (
          <div
            className={`mx-auto flex max-w-md items-center gap-3 rounded-lg bg-green-600 p-4 text-white shadow-lg transition-all ${t.visible ? 'animate-in fade-in slide-in-from-top-10' : 'animate-out fade-out slide-out-to-top-10'} `}
          >
            <CheckCircle2 className='h-6 w-6 text-white' />
            <p className='font-semibold'>
              Orden creada correctamente (OT #{result.data.idSolicitudIngresada}
              )
            </p>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-center', // bien centrado horizontal y con margen top
        },
      );

      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Crear Mantención</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Bus */}
          <div>
            <label className='font-bold'>Número de bus - PPU</label>
            <Select
              open={busOpen}
              onOpenChange={setBusOpen}
              value={selectedBus?.toString()}
              onValueChange={(val) => setSelectedBus(Number(val))} // ahora será codigo_flota
            >
              <SelectTrigger className='h-9'>
                <SelectValue placeholder='Seleccione bus'>
                  {selectedBus
                    ? `${filtrosCache?.buses.find((b) => b.codigo_flota === selectedBus)?.placa_patente} - ${
                        filtrosCache?.buses.find(
                          (b) => b.codigo_flota === selectedBus,
                        )?.numero_interno
                      }`
                    : 'Seleccione bus'}
                </SelectValue>
              </SelectTrigger>

              <VirtualizedSearchSelect
                items={filtrosCache?.buses ?? []}
                getKey={(b) => b.codigo_flota}
                getLabel={(b) => `${b.placa_patente} - ${b.numero_interno}`}
                getValue={(b) => b.codigo_flota}
                open={busOpen}
              />
            </Select>
          </div>

          {/* Taller */}
          <div>
            <label className='font-bold'>Taller</label>
            <Select onValueChange={(val) => setTallerSeleccionado(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar taller' />
              </SelectTrigger>
              <SelectContent>
                {talleres.map((t) => (
                  <SelectItem
                    key={t.codigo_taller}
                    value={String(t.codigo_taller)}
                  >
                    {t.nombre_taller}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo OT */}
          <div>
            <label className='font-bold'>Tipo OT</label>
            <Select onValueChange={(val) => setTipoOTSeleccionado(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar tipo de OT' />
              </SelectTrigger>
              <SelectContent>
                {tiposOt.map((t) => (
                  <SelectItem
                    key={t.id_tipo_orden}
                    value={String(t.id_tipo_orden)}
                  >
                    {t.detalle_tipo_orden}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalle */}
          <div>
            <label className='font-bold'>Detalle ingreso</label>
            <Input
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder='Detalle de la falla encontrada'
            />
          </div>

          {/* Tabla sistema/subsistema */}
          <div>
            <div className='grid grid-cols-12 rounded-t bg-fuchsia-950 p-2 text-sm font-bold text-white'>
              <div className='col-span-5'>Sistema</div>
              <div className='col-span-5'>Sub sistema</div>
              <div className='col-span-2 text-center'>Eliminar</div>
            </div>

            {filas.map((fila) => (
              <div
                key={fila.id}
                className='grid grid-cols-12 items-center gap-2 border p-2'
              >
                {/* Sistema */}
                <div className='col-span-5'>
                  <Select
                    value={fila.sistema?.toString()}
                    onValueChange={(val) =>
                      handleSistemaChange(fila.id, Number(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccione' />
                    </SelectTrigger>
                    <SelectContent>
                      {sistemas.map((s) => (
                        <SelectItem
                          key={s.id_falla_principal}
                          value={String(s.id_falla_principal)}
                        >
                          {s.detalle_falla_principal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subsistema */}
                <div className='col-span-5'>
                  <Select
                    value={fila.subsistema?.toString()}
                    onValueChange={(val) =>
                      handleSubsistemaChange(fila.id, Number(val))
                    }
                    disabled={!fila.sistema}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccione' />
                    </SelectTrigger>
                    <SelectContent>
                      {(fila.sistema
                        ? subsistemasPorSistema[fila.sistema] || []
                        : []
                      ).map((sub) => (
                        <SelectItem
                          key={sub.id_falla_secundaria}
                          value={String(sub.id_falla_secundaria)}
                        >
                          {sub.detalle_falla_secundaria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Eliminar */}
                <div className='col-span-2 flex justify-center'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleEliminarFila(fila.id)}
                  >
                    <Trash2 className='h-5 w-5 text-red-600' />
                  </Button>
                </div>
              </div>
            ))}

            {/* Botón agregar */}
            <div className='mt-2'>
              <Button
                className='bg-fuchsia-950 text-white hover:bg-fuchsia-900'
                onClick={handleAgregarFila}
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar subsistema
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleGuardar}>Guardar</Button>
            <Button variant='ghost' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
