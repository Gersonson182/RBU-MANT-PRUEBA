import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { HtmlHTMLAttributes } from 'react';

type LoadingProps = HtmlHTMLAttributes<HTMLDivElement>;

export default function Loading({ className, ...props }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex h-screen w-full flex-col items-center justify-center gap-2 text-center',
        className,
      )}
      {...props}
    >
      <Loader2 className='h-10 w-10 animate-spin text-primary' />
      <p className='text-2xl font-bold text-primary'>Cargando...</p>
    </div>
  );
}
