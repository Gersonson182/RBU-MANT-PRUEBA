import { create } from 'zustand';
import type { DataFiltrosMant } from '@/types/OT/OTMenu';

type FiltrosState = {
  filtros: DataFiltrosMant;
  setFiltros: (partial: Partial<DataFiltrosMant>) => void;
  clearFiltros: () => void;
};

// Inicialización segura (arrays vacíos)
const initialState: DataFiltrosMant = {
  OTs: [],
  talleres: [],
  buses: [],
  estadosOt: [],
  tiposOt: [],
  nrosManager: [],
  fallaPrincipal: [],
  fallaSecundaria: [],
  mecanicos: [],
  servicios: [],
};

export const useFiltroStore = create<FiltrosState>((set, get) => ({
  filtros: initialState,
  setFiltros: (partial) => {
    const current = get().filtros;
    set({ filtros: { ...current, ...partial } });
  },
  clearFiltros: () => set({ filtros: initialState }),
}));
