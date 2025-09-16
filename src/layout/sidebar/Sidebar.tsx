import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { transformModulesToSidebarLinks } from '@/lib/transforModulestoSidebar';
import SidebarLink from './SidebarLink';
import SidebarAvatar from './SidebarAvatar';
import { cn } from '@/lib/utils';

export default function SidebarComponent({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const SIDEBAR_LINKS = transformModulesToSidebarLinks();
  return (
    <Sidebar {...props}>
      {/* Logo en el header */}
      <SidebarHeader className='bg-blue-800 text-white'>
        <SidebarMenu className='text-white'>
          <SidebarMenuItem className='text-white hover:bg-blue-700'>
            <SidebarMenuButton
              size='lg'
              className='hover:bg-transparent'
              asChild
            >
              <Link
                to='/'
                className='flex items-center justify-center'
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
              >
                <img
                  src='/assets/logos/logo-white.svg'
                  alt='Intranet Logo'
                  className={cn(
                    'w-1/2 transition-all duration-500 ease-in-out',
                    !open && 'translate-x-10 scale-90 opacity-80',
                  )}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Contenido navegable y avatar al final */}
      <SidebarContent className='flex-1'>
        <SidebarGroup className='h-full justify-between gap-4'>
          <SidebarMenu>
            {SIDEBAR_LINKS.map((item) => (
              <SidebarLink key={item.title} item={item} />
            ))}
          </SidebarMenu>

          <SidebarAvatar />
        </SidebarGroup>
      </SidebarContent>

      {/* Línea colapsable al costado */}
      <SidebarRail />
    </Sidebar>
  );
}
