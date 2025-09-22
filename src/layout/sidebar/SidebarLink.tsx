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

type Props = {
  item: SidebarLinkType;
};

export default function SidebarLink({ item }: Props) {
  const { pathname } = useLocation();

  const isActive = !item.items
    ? pathname === item.url
    : pathname.startsWith(item.url);

  return (
    <>
      {!item.items ? (
        // Item sin submenú
        <SidebarMenuButton isActive={isActive} asChild>
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
        // Item con submenús
        <Collapsible defaultOpen={pathname.startsWith(item.url)}>
          <SidebarMenuItem className='flex items-center justify-between'>
            <SidebarMenuButton
              isActive={isActive}
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

            {/* Botón expandir/colapsar */}
            <CollapsibleTrigger asChild>
              <button className='p-1'>
                {pathname.startsWith(item.url) ? (
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

                return (
                  <SidebarMenuSubItem key={sub.title}>
                    <SidebarMenuSubButton isActive={isSubActive} asChild>
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
