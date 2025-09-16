import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { HtmlHTMLAttributes } from 'react';

type LoadingProps = HtmlHTMLAttributes<HTMLDivElement>;

export default function Loading({ className, ...props }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 text-center',
        className,
      )}
      {...props}
    >
      <Loader2 className='animate-spin' />
      <p className='text-2xl font-bold'>Cargando...</p>
    </div>
  );
}
