import { Link, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { SidebarLink as SidebarLinkType } from '../../types/sidebar';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar/sidebarStore';
import { useEffect } from 'react';

type Props = {
  item: SidebarLinkType;
};

export default function SidebarLink({ item }: Props) {
  const { pathname } = useLocation();

  const activeModule = useSidebarStore((state) => state.activeModule);
  const expandedModules = useSidebarStore((state) => state.expandedModules);
  const setExpandedModules = useSidebarStore(
    (state) => state.setExpandedModule,
  );

  const isManuallyActive = item.title === activeModule;

  const open =
    expandedModules[item.url] ||
    pathname === item.url ||
    pathname.startsWith(item.url + '/');

  const handleOpenChange = (isOpen: boolean) => {
    setExpandedModules(item.url, isOpen);
  };

  useEffect(() => {
    if (pathname.startsWith(item.url)) {
      setExpandedModules(item.url, true);
    }
  }, [pathname, item.url, setExpandedModules]);

  const isActive =
    isManuallyActive ||
    (!item.items ? item.url === pathname : pathname.startsWith(item.url));

  return (
    <>
      {!item.items ? (
        // Ítem sin submenús
        <SidebarMenuButton
          key={item.title}
          isActive={isActive}
          disabled={item.disabled}
          asChild
        >
          <Link
            to={item.url}
            className={cn(
              'block rounded px-2 py-1 transition-all',
              isActive && 'bg-blue-700 !font-bold',
            )}
          >
            {item.title}
          </Link>
        </SidebarMenuButton>
      ) : (
        // Ítem con submenús
        <Collapsible
          key={item.title}
          className='group/collapsible'
          open={open}
          onOpenChange={handleOpenChange}
        >
          <SidebarMenuItem className='flex items-center justify-between'>
            {/* Título que navega */}
            <SidebarMenuButton
              isActive={isActive}
              disabled={item.disabled}
              asChild
              className='flex-1 text-left'
            >
              <Link
                to={item.url}
                className={cn(
                  'w-full px-2 py-1',
                  isActive && 'bg-blue-700 !font-bold',
                )}
              >
                {item.title}
              </Link>
            </SidebarMenuButton>

            {/* Ícono que colapsa/expande */}
            <CollapsibleTrigger asChild>
              <button className='p-1'>
                {open ? (
                  <Minus className='h-4 w-4' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </button>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((sub) => {
                const isSubActive = pathname.startsWith(
                  `${item.url}${sub.url}`,
                );

                // Submenú con hijos
                if (sub.items?.length) {
                  return (
                    <Collapsible
                      key={sub.title}
                      className='group/collapsible2'
                      defaultOpen={isSubActive}
                    >
                      <SidebarMenuItem className='flex items-center justify-between'>
                        {/* Título que navega */}
                        <SidebarMenuButton
                          isActive={isSubActive}
                          disabled={sub.disabled}
                          asChild
                          className='flex-1 text-left'
                        >
                          <Link
                            to={`${item.url}${sub.url}`}
                            className='w-full px-2 py-1'
                          >
                            {sub.title}
                          </Link>
                        </SidebarMenuButton>

                        {/* Ícono de colapsado */}
                        <CollapsibleTrigger asChild>
                          <button className='p-1'>
                            {isSubActive ? (
                              <Minus className='h-4 w-4' />
                            ) : (
                              <Plus className='h-4 w-4' />
                            )}
                          </button>
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {sub.items.map((child) => {
                            const isChildActive =
                              pathname === `${item.url}${sub.url}${child.url}`;
                            return (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  isActive={isChildActive}
                                  asChild
                                >
                                  <Link
                                    to={`${item.url}${sub.url}${child.url}`}
                                    className='block h-auto py-1'
                                  >
                                    {child.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                // Submenú simple
                return (
                  <SidebarMenuSubItem key={sub.title}>
                    <SidebarMenuSubButton
                      isActive={`${item.url}${sub.url}` === pathname}
                      asChild
                    >
                      <Link to={`${item.url}${sub.url}`}>{sub.title}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
}
