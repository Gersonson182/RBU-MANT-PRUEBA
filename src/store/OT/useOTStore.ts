import { create } from 'zustand';
import type { OrdenDeTrabajo } from '../../types/OT/OTMenu';

type OrdenDeTrabajoStore = {
  registros: OrdenDeTrabajo[];
  filteredRegistros: OrdenDeTrabajo[];
  setRegistros: (registros: OrdenDeTrabajo[]) => void;
  setFilteredRegistros: (filtros: {
    estadoOT?: string;
    codigoTaller?: number;
    patente?: string;
  }) => void;
  deleteOrden: (numeroOrden: number) => void;
};

export const useOrdenDeTrabajoStore = create<OrdenDeTrabajoStore>(
  (set, get) => ({
    registros: [],
    filteredRegistros: [],

    setRegistros: (registros) => {
      set({
        registros,
        filteredRegistros: registros, // al inicio, sin filtros
      });
    },

    setFilteredRegistros: ({ estadoOT, codigoTaller, patente }) => {
      let registros = get().registros;

      if (estadoOT) {
        registros = registros.filter((ot) => ot.estadoOrden === estadoOT);
      }

      if (codigoTaller) {
        registros = registros.filter((ot) => ot.codigoTaller === codigoTaller);
      }

      if (patente) {
        registros = registros.filter((ot) =>
          ot.patente.toLowerCase().includes(patente.toLowerCase()),
        );
      }

      set({ filteredRegistros: registros });
    },

    deleteOrden: (numeroOrden) => {
      set((state) => {
        const registrosActualizados = state.registros.filter(
          (ot) => ot.numeroOrden !== numeroOrden,
        );
        const filteredRegistrosActualizados = state.filteredRegistros.filter(
          (ot) => ot.numeroOrden !== numeroOrden,
        );

        return {
          registros: registrosActualizados,
          filteredRegistros: filteredRegistrosActualizados,
        };
      });
    },
  }),
);
