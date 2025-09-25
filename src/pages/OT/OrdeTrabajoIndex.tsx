import { MODULES } from '@/constants';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import FadeInContainer from '@/components/ui/FadeInContainer';
import clsx from 'clsx';

export default function OrdenTrabajoIndex() {
  const navigate = useNavigate();

  // busca el módulo raíz
  const moduloOT = MODULES.find((mod) => mod.url === '/OTMenu');
  if (!moduloOT) return null;

  return (
    <FadeInContainer className='min-h-[90vh] py-8 md:px-6'>
      <Card className='rounded-md border bg-white p-4 shadow-md'>
        <div className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
          {moduloOT.items.map((item) => (
            <Card
              key={item.name}
              onClick={() => navigate(item.url)}
              className={clsx(
                'group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border p-6 shadow transition duration-200 ease-in-out hover:scale-105 hover:shadow-md',
              )}
            >
              <p className='text-center text-sm font-bold text-gray-800'>
                {item.name}
              </p>
            </Card>
          ))}
        </div>
      </Card>
    </FadeInContainer>
  );
}
