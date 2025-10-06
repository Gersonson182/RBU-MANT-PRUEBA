import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';

type MantencionPreventivaDeleteDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  id_rel_man_prev?: number;
  idOrden: number;
};

export default function MantencionPreventivaDeleteDialog({
  open,
  setOpen,
  id_rel_man_prev,
  idOrden,
}: MantencionPreventivaDeleteDialogProps) {
  const { deleteMantencionPreventiva } = useOTMenu();
  const queryClient = useQueryClient();

  const { mutateAsync: deletePreventivaAsync, isPending } = useMutation({
    mutationKey: ['delete-mantencion-preventiva'],
    mutationFn: (id: number) => deleteMantencionPreventiva(id),
  });

  const handleDelete = async () => {
    if (!id_rel_man_prev) return;

    const result = await deletePreventivaAsync(id_rel_man_prev);

    if (result?.success) {
      toast.success(
        result.message ?? 'Mantención preventiva eliminada correctamente ',
      );
      await queryClient.invalidateQueries({
        queryKey: ['orden-detalle', idOrden],
      });
      setOpen(false);
    } else {
      toast.error(
        result?.message ??
          'Ocurrió un error al eliminar la mantención preventiva ',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Eliminar Mantención Preventiva</DialogTitle>

        <DialogDescription className='space-y-4'>
          <p>
            ¿Estás seguro de que deseas eliminar esta mantención preventiva?{' '}
            <span className='font-medium text-red-600'>
              Esta acción no se puede deshacer.
            </span>
          </p>

          <div className='space-y-2 rounded-md bg-slate-100 p-3 text-sm text-slate-700'>
            <p className='flex items-center gap-2'>
              <Wrench className='h-4 w-4 text-fuchsia-950' />
              <span>
                ID de relación preventiva: <b>{id_rel_man_prev}</b>
              </span>
            </p>

            <p className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-amber-600' />
              <span>
                Se eliminará este registro permanentemente del sistema.
              </span>
            </p>
          </div>
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
            Eliminar Mantención
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
