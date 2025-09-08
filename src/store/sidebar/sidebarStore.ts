import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SidebarStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  expandedModules: Record<string, boolean>;
  setExpandedModule: (module: string, isOpen: boolean) => void;
};

export type Breadcrumb = {
  title: string;
  url: string;
};

const getInitialOpen = () => {
  const stored = localStorage.getItem('sidebar-open');
  return stored === null ? true : stored === 'true';
};

export const useSidebarStore = create<SidebarStore>()(
  devtools((set) => ({
    open: getInitialOpen(),
    setOpen: (open) => {
      localStorage.setItem('sidebar-open', String(open));
      set({ open });
    },
    activeModule: null,
    setActiveModule: (module) => set({ activeModule: module }),
    breadcrumbs: [],
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    expandedModules: {},
    setExpandedModule: (module, isOpen) =>
      set((state) => ({
        expandedModules: {
          ...state.expandedModules,
          [module]: isOpen,
        },
      })),
  })),
);
