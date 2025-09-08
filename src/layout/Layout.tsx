import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarComponent from './sidebar/Sidebar';
import Breadcrumbs from './breacrumbs/Breadcrumbs';
import { Separator } from '@/components/ui/separator';
import Logos from '@/components/Logos';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthStore } from '@/store/auth/useAuthStore';
import Loading from '@/components/Loading';
import { useSidebarStore } from '@/store/sidebar/sidebarStore';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';

type Props = PropsWithChildren;

export default function Layout({ children }: Props) {
  const setCookieUser = useAuthStore((state) => state.setCookieUser);
  const legacyUser = useAuthStore((state) => state.legacyUser);
  const setLegacyUser = useAuthStore((state) => state.setLegacyUser);
  const logout = useAuthStore((state) => state.logout);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const open = useSidebarStore((state) => state.open);
  const setOpen = useSidebarStore((state) => state.setOpen);

  const { loginUser, getPermissions } = useAuth();

  const { mutateAsync: loginUserAsync, isPending: isPendingLogin } =
    useMutation({
      mutationKey: ['legacyUser'],
      mutationFn: loginUser,
    });

  const {
    data: permissionsData,
    mutateAsync: getPermissionsAsync,
    isPending: isPendingPermissions,
  } = useMutation({
    mutationKey: ['permissionsUser'],
    mutationFn: getPermissions,
  });

  const cookieUser = useAuthStore((state) => state.cookieUser);

  useEffect(() => {
    if (cookieUser) {
      console.log('ID Usuario desde store:', cookieUser.idUsuario);
    }
  }, [cookieUser]);

  useEffect(() => {
    if (legacyUser) return;

    const fetchCookies = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_RBUPASS_BACK_URL}/api/auth/token`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const userPayload = await response.json();
      if (!userPayload) return logout();

      setCookieUser(userPayload);

      const userData = await loginUserAsync(userPayload.usuario);
      if (!userData) return logout();

      setLegacyUser(userData);
      await getPermissionsAsync(userPayload.idUsuario);
    };

    fetchCookies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (permissionsData) setPermissions(permissionsData);
  }, [permissionsData]);

  if (isPendingLogin || isPendingPermissions) return <Loading />;

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      className='flex min-h-screen bg-neutral-50'
    >
      {/* Sidebar lateral */}
      <SidebarComponent />

      {/* Contenedor principal */}
      <SidebarInset className='flex w-full max-w-full flex-1 flex-col overflow-x-hidden'>
        {/* Header fijo */}
        <header className='relative flex h-[64px] items-center border-b bg-blue-800 px-4 py-2 text-white shadow-sm'>
          {/* Botón Sidebar y Breadcrumbs */}
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='text-white' />

            {/* Texto "Intranet" visible solo cuando el sidebar está cerrado */}
            {!open && (
              <Link
                to='/'
                className='flex items-center gap-1 text-lg font-semibold text-white transition-opacity duration-300'
              >
                <img
                  src='/assets/logos/logo-white.svg'
                  className='h-10'
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/';
                  }}
                />
              </Link>
            )}

            <Separator orientation='vertical' className='h-4 bg-white/50' />
            <Breadcrumbs />
          </div>

          {/* Logos centrados pero dentro del flujo */}
          <div className='flex flex-1 items-center justify-center px-4'>
            <Logos className='hidden scale-[0.8] sm:flex md:scale-[0.95] lg:scale-100 xl:scale-[1.1]' />
          </div>
        </header>

        {/* Contenido principal */}
        <main className='flex-1 overflow-auto p-4'>{children}</main>
        <Toaster duration={3500} pauseWhenPageIsHidden richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}
