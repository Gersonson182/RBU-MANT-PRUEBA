export type CookieUser = {
  idUsuario: number;
  usuario: string;
  rol: string;
  token: string;
};

export type LegacyUser = {
  codigoUsuario: number;
  primernombre: string;
  apellido: string;
  rut: string;
  codigoPerfil: number;
  nombrePerfil: string;
  codigoTerminal?: number;
  codigoTaller?: number;
  codigoUnidad?: number;
  fechaUltimoAcceso: string;
  cencosUsuario?: number;
  correoUsuario: string;
  arrobaCorreo: string;
};

export type Permission = {
  nombreModulo: string;
  nombreAcceso: string;
};
