// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { ApiError } from './errorHttp';
import { manejarNoAutorizado } from './noAutorizado';

export interface PerfilMensajesError {
  error4xx: string;
  error5xxFijo: boolean;
  error5xxFallback: string;
  timeout: string;
  red: string;
  distinguirFetch: boolean;
}

export const PERFIL_ERROR_JSON: PerfilMensajesError = {
  error4xx: 'Solicitud inválida. Verifique los datos ingresados.',
  error5xxFijo: true,
  error5xxFallback: 'Ocurrió un error en el servidor. Intente nuevamente más tarde.',
  timeout: 'No se pudo conectar con el servidor. Verifique su conexión.',
  red: 'No se pudo conectar con el servidor. Verifique su conexión.',
  distinguirFetch: true,
};

export const PERFIL_ERROR_BINARIO: PerfilMensajesError = {
  error4xx: 'No se pudo descargar el documento solicitado.',
  error5xxFijo: false,
  error5xxFallback: 'Ocurrió un error al generar el archivo en el servidor.',
  timeout: 'La descarga tardó demasiado. Verifique su conexión.',
  red: 'No se pudo conectar con el servidor para descargar el archivo.',
  distinguirFetch: false,
};

interface DatosErrorHttp {
  backendMsg?: string;
  codigo?: string;
  fieldErrors?: Record<string, string | string[]>;
  errorDetail?: string;
}

function extraerFieldErrors(val: unknown): Record<string, string | string[]> | undefined {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return undefined;
  const resultado: Record<string, string | string[]> = {};
  let hayCampos = false;
  for (const [clave, item] of Object.entries(val)) {
    if (typeof item === 'string' || (Array.isArray(item) && item.every((el) => typeof el === 'string'))) {
      resultado[clave] = item;
      hayCampos = true;
    }
  }
  return hayCampos ? resultado : undefined;
}

function extraerCamposTexto(raw: object): Map<string, string> {
  const textos = new Map<string, string>();
  for (const [clave, valor] of Object.entries(raw)) {
    if (typeof valor === 'string' && valor) textos.set(clave, valor);
  }
  return textos;
}

async function leerDatosError(response: Response): Promise<DatosErrorHttp> {
  try {
    const raw: unknown = await response.json();
    if (typeof raw !== 'object' || raw === null) return {};
    const textos = extraerCamposTexto(raw);
    const detail = textos.get('detail') ?? textos.get('title');
    return {
      backendMsg: textos.get('mensaje') ?? textos.get('message') ?? detail,
      codigo: textos.get('codigo'),
      fieldErrors: 'errors' in raw ? extraerFieldErrors(raw.errors) : undefined,
      errorDetail: detail,
    };
  } catch {
    return {};
  }
}

function resolverPlantillaHttp(status: number, backendMsg: string | undefined, perfil: PerfilMensajesError) {
  if (status === 401) {
    return { mensaje: 'Sesión expirada. Inicie sesión nuevamente.', codigoDefecto: 'UNAUTHORIZED' };
  }
  if (status === 403) {
    return { mensaje: 'No tiene permiso para realizar esta acción.', codigoDefecto: 'FORBIDDEN' };
  }
  if (status >= 500) {
    const msg500 = perfil.error5xxFijo ? perfil.error5xxFallback : backendMsg ?? perfil.error5xxFallback;
    return { mensaje: msg500, codigoDefecto: 'SERVER_ERROR' };
  }
  return { mensaje: backendMsg ?? perfil.error4xx, codigoDefecto: 'BAD_REQUEST' };
}

export async function lanzarErrorHttp(
  response: Response,
  host: string,
  perfil: PerfilMensajesError
): Promise<never> {
  const datos = await leerDatosError(response);
  if (response.status === 401) manejarNoAutorizado();
  const { mensaje, codigoDefecto } = resolverPlantillaHttp(response.status, datos.backendMsg, perfil);
  throw new ApiError({
    status: response.status,
    mensaje,
    codigo: datos.codigo ?? codigoDefecto,
    errors: datos.fieldErrors,
    detail: datos.errorDetail,
    tipo: 'http',
    host,
  });
}

function esErrorFetch(err: unknown): boolean {
  return err instanceof Error && (err.name === 'TypeError' || err.message.toLowerCase().includes('fetch'));
}

export function normalizarErrorCatch(
  err: unknown,
  abortado: boolean,
  host: string,
  perfil: PerfilMensajesError
): never {
  if (err instanceof ApiError) throw err;
  if ((err instanceof Error && err.name === 'AbortError') || abortado) {
    throw new ApiError({ status: 0, mensaje: perfil.timeout, codigo: 'ERR_TIMEOUT', tipo: 'timeout', host });
  }
  const codigo = !perfil.distinguirFetch || esErrorFetch(err) ? 'ERR_CONEXION' : 'ERR_DESCONOCIDO';
  throw new ApiError({ status: 0, mensaje: perfil.red, codigo, tipo: 'sin-respuesta', host });
}
