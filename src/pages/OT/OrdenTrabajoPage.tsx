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

import OrdenesDeTrabajoTable from '../../components/OT_Menu/ordenesdetrabajo/OrdenesDeTrabajoTable';

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

  console.log(registroData);

  if (isLoadingRegistros) return <Loading />;

  return (
    <FadeInContainer className='min-h-[90vh] py-8 md:px-6'>
      <div className='mb-4 flex items-center justify-between'>
        {/* Línea horizontal */}
        <div className='flex-1 border-t border-primary/80' />

        {/* Botones de acción */}
        <div className='ml-4 flex items-center gap-4'>
          <Button
            className='group'
            size='icon'
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className='transition-transform duration-500 ease-in-out group-hover:rotate-180' />
          </Button>
        </div>
      </div>
      <OrdenesDeTrabajoTable />
    </FadeInContainer>
  );
}
