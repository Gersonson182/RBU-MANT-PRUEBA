import type { Permission } from '../types/auth';

export type MenuItem = {
  name: string;
  url: string;
  permission?: Permission;
  imageUrl?: string;
  imageUrlActive?: string;
  submenu?: MenuItem[];
};

export type ModuleItem = {
  name: string;
  url: string;
  imageUrl: string;
  imageUrlActive?: string;
  menu: MenuItem[];
  submenu?: MenuItem[];
};

export const MODULES: ModuleItem[] = [
  {
    name: 'Órdenes de trabajo',
    url: '/ordenes-de-trabajo-menus',
    imageUrl: '/images/icons/ordenes-de-trabajo.svg',
    imageUrlActive: '/images/icons/ordenes-de-trabajo-active.svg',
    menu: [
      {
        name: 'Órdenes de Trabajo - Menu',
        url: '/ordenes-de-trabajo',
        permission: {
          nombreModulo: 'Ordenes de Trabajo - Menu',
          nombreAcceso: 'Acceso',
        },
      },
    ],
  },
];
