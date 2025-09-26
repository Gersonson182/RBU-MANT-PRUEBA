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
import { useSidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth/useAuthStore';
import type { SidebarLink as SidebarLinkType } from '@/types/sidebar';
import type { Permission } from '@/types/auth';

function filterByPermissions(
  links: SidebarLinkType[],
  userPermissions: Permission[],
): SidebarLinkType[] {
  return links
    .map((link) => {
      const filteredItems = link.items
        ? filterByPermissions(link.items, userPermissions)
        : undefined;

      const hasPermission =
        !link.permission ||
        userPermissions.some(
          (p) =>
            p.nombreModulo === link.permission?.nombreModulo &&
            p.nombreAcceso === link.permission?.nombreAcceso,
        );

      if (!hasPermission && (!filteredItems || filteredItems.length === 0)) {
        return null;
      }

      return { ...link, items: filteredItems };
    })
    .filter(Boolean) as SidebarLinkType[];
}

export default function SidebarComponent(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const { state } = useSidebar();
  const userPermissions = useAuthStore((s) => s.permissions);

  const SIDEBAR_LINKS = transformModulesToSidebarLinks();
  const filteredLinks = filterByPermissions(SIDEBAR_LINKS, userPermissions);

  return (
    <Sidebar
      {...props}
      className='bg-sidebar-background border-r border-sidebar-border text-sidebar-foreground'
    >
      {/* Logo en el header */}
      <SidebarHeader className='border-b border-sidebar-border bg-fuchsia-950 text-sidebar-foreground'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link
                to='/'
                className='flex items-center justify-center'
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
              >
                <img
                  src='/assets/modules/MANT-RBU.svg'
                  alt='Mant. Logo'
                  className={cn(
                    'w-1/2 transition-all duration-500 ease-in-out',
                    state === 'collapsed' &&
                      'translate-x-10 scale-90 opacity-80',
                  )}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Contenido navegable y avatar */}
      <SidebarContent className='bg-sidebar-background flex-1 text-sidebar-foreground'>
        <SidebarGroup className='h-full justify-between gap-4'>
          <SidebarMenu>
            {filteredLinks.map((item) => (
              <SidebarLink key={item.title} item={item} />
            ))}
          </SidebarMenu>
          <SidebarAvatar />
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail className='bg-sidebar-background border-l border-sidebar-border' />
    </Sidebar>
  );
}
