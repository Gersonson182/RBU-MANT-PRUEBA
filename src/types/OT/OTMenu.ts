export interface OrdenDeTrabajo {
  numeroOrden: number;
  idPersonalIngreso: number;
  tipoOrden: string;
  estadoOrden: string;
  numeroBus: number;
  patente: string;
  fechaIngreso: string;
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
  numeroOrden: number;
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
  nombre_manager?: string;
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

// Types de sistemas y subsistemas por ejemplo : || carroceria - choque propio, amortiguacion, etc ||

export interface SistemaFiltro {
  id_falla_principal: number;
  detalle_falla_principal: string;
}

export interface SubsistemaFiltro {
  id_falla_secundaria: number;
  id_falla_principal: number;
  detalle_falla_secundaria: string;
}

// Types para crear una nueva Orden de Trabajo

export interface CreateFallaInput {
  id_falla_principal: number;
  id_falla_secundaria?: number | null;
  id_personal_falla_principal?: number | null;
  id_personal_falla_secundaria?: number | null;
  id_perfil_principal?: number | null;
  id_perfil_secundaria?: number | null;
}

export interface CreateOrdenTrabajoInput {
  id_personal_ingreso: number; // viene del usuario logeado
  id_tipo_orden: number;
  codigo_flota: number;
  detalle_ingreso: string;
  fecha_programada?: string | null;
  codigo_taller: number;
  servicio?: string | null;
  fallas: CreateFallaInput[];
}

export interface OrdenTrabajoCreada {
  idSolicitudIngresada: number;
  bus: string;
  ppu: string;
  ingreso: string;
}

export interface CreateOrdenTrabajoResponse {
  message: string;
  data: OrdenTrabajoCreada;
}

// Traer datos para editar alguna orden de trabajo

export type OrdenTrabajoBasic = {
  numeroOrden: string;
  numeroBus: number;
  patente: string;
  fechaIngreso: string;
  fechaCierre: string | null;
  detalleCierre: string | null;
  detalleIngreso: string | null;
  tecnicoResponsable: string | null;
  conductor: string | null;
  tipoOrden: string;
  estadoCodigo: number;
  estadoDescripcion: string;
  kilometraje: number | null;
  fechaUltimaMantencion: string | null;
  codigoFlota: number;
  comentario_entrada: string | null;
  ot_manager: number | null;
  nombre_taller: string | null;
  HoraIngreso: string | null;
  HoraCierre: string | null;
  ot_intranet: number | null;
  codigoTaller: string | null;
};

export type OrdenTrabajoSistema = {
  tipo: string;
  idRelacionFalla: number;
  detalleFallaPrincipal: string;
  detalleFallaSecundaria: string;
  mecanicoAsignado: string | null;
  idMecanicoAsignado: number | null;
};

export type OrdenTrabajoDetalle = {
  basic: OrdenTrabajoBasic;
  sistemas: OrdenTrabajoSistema[];
  insumos: any[]; // luego tipamos bien
  personal: any[]; // luego tipamos bien
};

// Payload de entrada para crear/editar una falla
export interface UpdateFallaInput {
  idOrden: number;
  idRelacionFalla?: number | null; // si viene null => inserta, si trae valor => update
  idFallaPrincipal: number;
  idFallaSecundaria?: number | null;
  idPersonalPrincipal?: number | null;
  idPersonalSecundaria?: number | null;
  idPerfilPrincipal?: number | null;
  idPerfilSecundaria?: number | null;
}

// Respuesta del SP sp_updOrderFailuresNew
export interface UpdateFallaResponse {
  success: number; // 1 = ok, 0 = error
  action: 'INSERT' | 'UPDATE' | 'NO_CHANGE' | 'ERROR';
  affected_rows: number;
  message: string;
  idRelacionFalla?: number;
}

// eliminar OT
export interface DeleteOrdenTrabajoResponse {
  success: boolean; // mapeado en el controller
  respuesta: number; // 1 = OK, 0 = no existe, -1 = error
  mensaje: string;
}

export type DeleteFallaInput = {
  item?: number;
  idRelacionFalla: number;
};

export type DeleteFallaResponse = {
  success: boolean;
  message: string;
  supplies_deleted: number;
  staff_deleted: number;
  failures_deleted: number;
};

// obtener mantenciones de preventiva por id ppu codigo_bus

export interface MantencionPreventiva {
  codigoFlota: number;
  ppu: string;
  numeroBus: number;
  numInternoPPU: string;
  codigoTerminal: number;
  estadoRegistro: string | null;
  nombreTerminal: string;
  terminalAbreviado: string | null;
  direccionTerminal: string | null;
  codigoZona: number | null;
  codigoTaller: number | null;
  detalle_modelo_chasis: string | null;
  marcaBus: string | null;
  kilometrajeProgramado: number | null;
  fechaUltimaMantencion: string | null;
  kilometrajeProximaMantencion: number | null;
  estadoMantencion: string | null;
  kilometrajeActual: number | null;
  siglaProxMant: string | null;
  idSigla: number | null;
}

export interface MantencionPreventivaResponse {
  message: string;
  data: MantencionPreventiva[];
}

export interface SiglaPreventiva {
  id_man_prev: number;
  siglas_preventivo: string;
}

// crear una falla de mantencion preventiva sin asignar mecanico

export interface MantencionPreventivaCrear {
  id_orden_trabajo: number;
  id_mantencion_preventiva: number;
  id_personal_mantencion_preventiva: number;
  personal_reporto: string;
  id_perfil_personal_mantencion_preventiva: number;
  id_estado_mantencion: number; // 1 = En Ejeccion, 2 = Rechazada, 3 = Ejecutada, 4 = Aprobada y 5 = Tecnico Eliminado
  ppu: string;
  siglas_mantenimiento: string;
}

export interface MantencionPreventivaResponse {
  success: boolean;
  message: string;
}

// Orden de trabajo preventivo - Mostrar el dato que ya esta registrado en el selector

export interface SiglaPreventivaFlota {
  id_man_prev: number;
  siglas_preventivo: string;
  id_rel_man_prev: number | null;
  id_orden_trabajo: number | null;
  siglas_mantenimiento: string | null;
  id_mantencion_preventiva: number | null;
  ya_registrada: number; // 1 si ya está en RELACION_MANTENCION_PREVENTIVA, 0 si no
}

export interface GetSiglasPreventivasFlotaInput {
  codigo_flota: number;
  id_orden_trabajo: number;
}

// ELiminar una falla preventiva

export interface DeleteMantencionPreventivaInput {
  id_rel_man_prev: number;
}

//  Respuesta del procedimiento sp_delManPrev
export interface DeleteMantencionPreventivaResponse {
  success: boolean;
  message: string;
}

export type FilaPreventiva = {
  tempId: number; // ID temporal en frontend
  id_rel_man_prev?: number | null; // ID real del registro (en DB)
  id_falla_principal?: number | null; // Sigla seleccionada
  isNew?: boolean; // Modo edición
};
