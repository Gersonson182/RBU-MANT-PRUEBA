import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wrench, Package, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import type { DeleteFallaResponse } from '@/types/OT/OTMenu';

type FallaDeleteDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  idRelacionFalla?: number;
  idOrden: number;
};

export default function FallaDeleteDialog({
  open,
  setOpen,
  idRelacionFalla,
  idOrden,
}: FallaDeleteDialogProps) {
  const { deleteFalla, getFallaPreview } = useOTMenu();
  const queryClient = useQueryClient();

  const [preview, setPreview] = useState<DeleteFallaResponse | null>(null);

  // 🔁 Mutación de eliminación
  const { mutateAsync: deleteFallaAsync, isPending } = useMutation({
    mutationKey: ['delete-falla'],
    mutationFn: (id: number) => deleteFalla(id),
  });

  // 🔍 Al abrir el modal, obtener vista previa (staff / insumos asociados)
  useEffect(() => {
    const fetchPreview = async () => {
      if (open && idRelacionFalla) {
        const result = await getFallaPreview(idRelacionFalla);
        setPreview(result);
      }
    };
    fetchPreview();
  }, [open, idRelacionFalla]);

  // 🗑️ Confirmar eliminación
  const handleDelete = async () => {
    if (!idRelacionFalla) return;

    const result = await deleteFallaAsync(idRelacionFalla);

    if (result?.success) {
      toast.success(result.message ?? 'Falla eliminada correctamente.');

      await queryClient.invalidateQueries({
        queryKey: ['orden-detalle', idOrden],
      });

      setOpen(false);
    } else {
      toast.error(result?.message ?? 'Ocurrió un error al eliminar la falla.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Eliminar Falla</DialogTitle>

        <DialogDescription className='space-y-4'>
          <p>
            ¿Estás seguro de que deseas eliminar esta falla?{' '}
            <span className='font-medium text-red-600'>
              Esta acción no se puede deshacer.
            </span>
          </p>

          {/* 🔧 Resumen de elementos asociados */}
          <div className='space-y-2 rounded-md bg-slate-100 p-3 text-sm text-slate-700'>
            <p className='flex items-center gap-2'>
              <Wrench className='h-4 w-4 text-fuchsia-950' />
              <span>
                Mecánicos asociados:{' '}
                <b>{preview ? preview.staff_deleted : '...'}</b>
              </span>
            </p>

            <p className='flex items-center gap-2'>
              <Package className='h-4 w-4 text-fuchsia-950' />
              <span>
                Insumos asociados:{' '}
                <b>{preview ? preview.supplies_deleted : '...'}</b>
              </span>
            </p>

            <p className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-amber-600' />
              <span>
                Registro de falla: <b>{idRelacionFalla}</b>
              </span>
            </p>
          </div>

          <p className='text-sm text-slate-600'>
            Al confirmar, se eliminará la falla junto con los técnicos e insumos
            asociados.
          </p>
        </DialogDescription>

        <DialogFooter>
          <Button
            variant='secondary'
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            Eliminar Falla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
