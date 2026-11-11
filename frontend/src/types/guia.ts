import type { NavigationItem } from '../config/navigationConfig';
import type { RolUsuario } from './auth';

/**
 * Ícono de un ítem de la guía. Reutiliza el tipo del menú lateral porque algunos
 * módulos usan íconos propios (por ejemplo SolesIcon) además de los de lucide-react.
 */
export type GuiaIcono = NavigationItem['icon'];

export interface GuiaItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: GuiaIcono;
}

export interface GuiaSeccion {
  id: string;
  titulo: string;
  items: GuiaItem[];
}

export interface GuiaRol {
  rol: RolUsuario;
  resumen: string;
  secciones: GuiaSeccion[];
  flujoHabitual: string[];
}
