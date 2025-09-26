import type { Permission } from '../types/auth';

export type MenuItem = {
  name: string;
  url: string;
  permission?: Permission;
  imageUrl?: string;
  imageUrlActive?: string;
  children?: MenuItem[];
};

export type ModuleItem = {
  name: string;
  imageUrl: string;
  imageUrlActive?: string;
  url: string;
  items: MenuItem[]; // unificar menu + submenu
};

export const MODULES: ModuleItem[] = [
  {
    name: 'OT - Menu Principal',
    url: '/OTMenu',
    imageUrl: '/assets/modules/OT.png',
    imageUrlActive: '/assets/modules/OT.png',
    items: [
      {
        name: 'Órdenes de Trabajo',
        url: '/OTMenu/OrdenDeTrabajo',
        permission: {
          nombreModulo: 'Ordenes de Trabajo - OT',
          nombreAcceso: 'Acceso',
        },
      },
      {
        name: 'Control de Calidad',
        url: '/control-calidad',
        permission: {
          nombreModulo: 'Órdenes de Trabajo - Control de Calidad',
          nombreAcceso: 'Acceso',
        },
      },
    ],
  },
];
