import { MODULES } from '@/constants';
import type { SidebarLink } from '../types/sidebar';
import type { MenuItem } from '@/constants';

function transformMenuItem(item: MenuItem): SidebarLink {
  return {
    title: item.name,
    url: item.url,
    permission: item.permission,
    disabled: false,
    items: item.children?.map(transformMenuItem),
  };
}

export function transformModulesToSidebarLinks(): SidebarLink[] {
  return MODULES.map((module) => ({
    title: module.name,
    url: module.url,
    permission: undefined,
    disabled: false,
    items: module.items.map(transformMenuItem),
  }));
}
