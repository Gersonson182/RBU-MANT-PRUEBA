export interface OrdenDeTrabajo {
  numeroOrden: number;
  idPersonalIngreso: number;
  tipoOrden: string;
  estadoOrden: string;
  numeroBus: number;
  patente: string;
  fechaIngreso: Date;
  fechaProgramada: Date | null;
  fechaEnEjecucion: Date | null;
  fechaEjecutada: Date | null;
  fechaRechazo: Date | null;
  fechaCierre: Date | null;
  kilometraje: number | null;
  codigoFlota: string;
  alerta: number | null;
  nuevo: number | null;
  codigoTaller: number | null;
  nombreTerminal: string | null;
  ultMantencion: Date | null;
  total_filas_afectadas: number;
}

export interface GetOrdenesTrabajoInput {
  nroOT?: number;
  codTaller?: number;
  nroBus?: number;
  estadoOT?: number;
  tipoOT?: number;
  fechaIngreso?: string;
  fechaSalida?: string;
  nroManager?: number;
  pagina?: number;
}

// item = 0 || Órdenes de trabajo
export interface OrdenTrabajoFiltro {
  id_orden_trabajo: number;
}

// item = 1 || Buses (flota)
export interface BusFiltro {
  numero_interno: number;
  placa_patente: string;
  codigo_flota: number;
}

// item = 3 || Talleres
export interface TallerFiltro {
  codigo_taller: number;
  nombre_taller: string;
}

// item = 11 || Estados de OT
export interface EstadoOTFiltro {
  id_estado_solicitud: number;
  detalle_estado_solicitud: string;
}

// item = 12 || Tipos de OT
export interface TipoOTFiltro {
  id_tipo_orden: number;
  detalle_tipo_orden: string;
}

// item = 13 || Nros Manager
export interface ManagerFiltro {
  ot_manager: number;
}

// item = 14 || Falla Principal
export interface FallaPrincipalFiltro {
  id_falla_principal: number;
  detalle_falla_principal: string;
}

// item = 15 || Falla Secundaria
export interface FallaSecundariaFiltro {
  id_falla_secundaria: number;
  id_falla_principal: number;
  detalle_falla_secundaria: string;
}

// item = 16 || Mecánicos
export interface MecanicoFiltro {
  idPersonal: number;
  nombrePersonal: string;
  descripcionCargo: string;
  rut: string;
}

// item = 17 || Servicios
export interface ServicioFiltro {
  codigoServicio: number;
  nombreServicio: string;
}

// ---- Respuesta agrupada de los types creados mas el services ----
export interface DataFiltrosMant {
  OTs: OrdenTrabajoFiltro[];
  talleres: TallerFiltro[];
  buses: BusFiltro[];
  estadosOt: EstadoOTFiltro[];
  tiposOt: TipoOTFiltro[];
  nrosManager: ManagerFiltro[];
  fallaPrincipal: FallaPrincipalFiltro[];
  fallaSecundaria: FallaSecundariaFiltro[];
  mecanicos: MecanicoFiltro[];
  servicios: ServicioFiltro[];
}
