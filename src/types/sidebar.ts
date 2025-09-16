import type { Permission } from './auth';

export type Breadcrumb = {
  title: string;
  url: string;
};

export type SidebarLink = {
  title: string;
  url: string;
  permission?: Permission;
  items?: SidebarLink[];
  disabled?: boolean;
};

export type SidebarStore = {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;

  // Agregados para manejar el estado del sidebar
  open: boolean;
  setOpen: (open: boolean) => void;

  activeModule: string | null;
  setActiveModule: (name: string | null) => void;
};
