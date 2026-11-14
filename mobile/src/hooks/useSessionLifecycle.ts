import {
  useSesionInactividad,
  type UseSesionInactividadOptions,
  type UseSesionInactividadReturn,
} from './useSesionInactividad';
import { AVISO_SEG, INACTIVIDAD_POR_ROL } from '../config/sesion';

export const INACTIVIDAD_LIMITE_MS = INACTIVIDAD_POR_ROL.Mozo * 60 * 1000; // 10 minutos
export const CUENTA_REGRESIVA_SEGUNDOS = AVISO_SEG; // 60 segundos

export type UseSessionLifecycleOptions = UseSesionInactividadOptions;
export type UseSessionLifecycleReturn = UseSesionInactividadReturn;

export const useSessionLifecycle = useSesionInactividad;
export { useSesionInactividad };
