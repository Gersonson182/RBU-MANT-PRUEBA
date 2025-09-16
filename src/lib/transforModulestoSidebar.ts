import { MODULES } from '@/constants';
import type { SidebarLink } from '../types/sidebar';

export function transformModulesToSidebarLinks(): SidebarLink[] {
  return MODULES.map((module) => ({
    title: module.name,
    url: module.url,
    permission: undefined, // El módulo raíz no tiene permiso directo
    items: module.menu.map((menuItem) => ({
      title: menuItem.name,
      url: menuItem.url,
      permission: menuItem.permission,
      disabled: false,
      items: menuItem.submenu?.map((sub) => ({
        title: sub.name,
        url: sub.url,
        permission: sub.permission,
        disabled: false,
      })),
    })),
  }));
}
