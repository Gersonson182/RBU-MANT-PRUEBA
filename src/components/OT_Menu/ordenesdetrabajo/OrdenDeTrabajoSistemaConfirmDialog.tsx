import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cambios: string[];
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  cambios,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar actualización</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <p>¿Quieres aplicar los siguientes cambios?</p>
          <ul className='list-disc pl-5 text-sm text-slate-600'>
            {cambios.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className='bg-fuchsia-950 text-white hover:bg-fuchsia-900'
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
