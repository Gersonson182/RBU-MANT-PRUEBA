import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOrdenDeTrabajoStore } from '@/store/OT/useOTStore';
import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import { useQueryClient } from '@tanstack/react-query';

type OTDeleteDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  idOrden?: number;
};

export default function OTDeleteDialog({
  open,
  setOpen,
  idOrden,
}: OTDeleteDialogProps) {
  const deleteFromStore = useOrdenDeTrabajoStore((state) => state.deleteOrden);
  const { deleteOrdenTrabajo } = useOTMenu();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteOrdenAsync, isPending } = useMutation({
    mutationKey: ['delete-orden-trabajo'],
    mutationFn: (id_orden: number) => deleteOrdenTrabajo(id_orden),
  });

  const handleDelete = async () => {
    if (!idOrden) return;

    const result = await deleteOrdenAsync(idOrden);

    if (result?.success) {
      deleteFromStore(idOrden);
      toast.success(result.mensaje ?? 'Orden eliminada correctamente');

      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      setOpen(false);
    } else {
      toast.error(result?.mensaje ?? 'Ocurrió un error al eliminar la orden');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Eliminar Orden de Trabajo</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar la orden con número de OT:{' '}
          <b>{idOrden}</b>?
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
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
