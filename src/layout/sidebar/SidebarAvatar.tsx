import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth/useAuthStore';
import { UserCircleIcon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SidebarAvatar() {
  const legacyUser = useAuthStore((state) => state.legacyUser);
  const cookieUser = useAuthStore((state) => state.cookieUser);

  return (
    <SidebarMenuItem className='h-max list-none'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuSubButton className='cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
            <Avatar className='h-8 w-8 rounded-lg'>
              <AvatarFallback className='rounded-lg'>
                {legacyUser?.nombreCompleto?.split(' ')[0]?.slice(0, 2) ?? '00'}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>
                {legacyUser?.nombreCompleto}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {cookieUser?.rol}
              </span>
            </div>
            <span className='relative pr-1'>
              <UserCircleIcon className='ml-auto size-4' />
            </span>
          </SidebarMenuSubButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-[--radix-dropdown-menu-trigger-width] min-w-72 max-w-56 rounded-lg'
          side='right'
          align='end'
          sideOffset={4}
        >
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={`https://intranet.rbu.cl/fotos/${cookieUser?.usuario}.jpg`}
                  alt={cookieUser?.usuario}
                />
                <AvatarFallback className='rounded-lg'>
                  {legacyUser?.nombreCompleto?.split(' ')[0]?.slice(0, 2) ??
                    '00'}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {legacyUser?.nombreCompleto}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {cookieUser?.rol}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to='/perfil' className='flex items-center gap-2'>
              <UserCircleIcon className='size-4' /> Perfil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              to='/perfil/notificaciones'
              className='flex items-center gap-2'
            >
              <Bell className='size-4' /> Notificaciones
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className='p-0 text-destructive'>
            {/* <LogoutButton className='flex w-full items-center gap-2 px-2 py-1.5 text-sm' /> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
