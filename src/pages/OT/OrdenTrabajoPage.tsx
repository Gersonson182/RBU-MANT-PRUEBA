import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import { useOrdenDeTrabajoStore } from '@/store/OT/useOTStore';
import { useAuthStore } from '@/store/auth/useAuthStore';
import FadeInContainer from '@/components/ui/FadeInContainer';
import Loading from '@/components/Loading';

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { GetOrdenesTrabajoInput } from '@/types/OT/OTMenu';

export default function OTMenuPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { getOrdenes } = useOTMenu();

  const setRegistros = useOrdenDeTrabajoStore((state) => state.setRegistros);
  const permissions = useAuthStore((state) => state.permissions);

  const { data: registroData, isLoading: isLoadingRegistros } = useQuery({
    queryKey: ['ordenes-de-trabajo'],
    queryFn: () => getOrdenes({ pagina: 0 }),
  });

  useEffect(() => {
    if (registroData) {
      setRegistros(registroData.data);
    }
  }, [registroData, setRegistros]);

  useEffect(() => {
    const hasAccess = permissions.find(
      (p) =>
        p.nombreModulo === 'Ordenes de Trabajo - OT' &&
        p.nombreAcceso === 'Acceso',
    );

    if (!hasAccess) {
      navigate('/sin-permisos');
    }
  }, [navigate, permissions]);

  if (isLoadingRegistros) return <Loading />;

  return (
    <FadeInContainer className='min-h-[90vh] py-8 md:px-6'>
      <div className='mb-4 flex items-center justify-between gap-4 max-md:flex-col'>
        <div className='h-0.5 flex-1 bg-primary/80 max-md:hidden'>
          <div className='flex items-center justify-end gap-4 max-md:flex-col'>
            <div className='flex items-center justify-center gap-4'>
              <Button
                className='group'
                size='icon'
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className='transition-transform duration-500 ease-in-out group-hover:rotate-180' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FadeInContainer>
  );
}
