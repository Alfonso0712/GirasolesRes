import React, { lazy } from 'react';
import {
  LayoutDashboard,
  Utensils,
  Clock,
  ChefHat,
  CalendarCheck,
  Lock,
  Receipt,
  ShoppingBag,
  BarChart3,
  User,
  Menu,
} from 'lucide-react';
import type { RolUsuario } from '../types/auth';

const SalonPage = lazy(() => import('../pages/SalonPage'));
const PedidosPage = lazy(() => import('../pages/PedidosPage'));
const CocinaPage = lazy(() => import('../pages/CocinaPage'));
const PlatosPage = lazy(() => import('../pages/PlatosPage'));
const CajaPage = lazy(() => import('../pages/CajaPage'));
const CobrosPage = lazy(() => import('../pages/CobrosPage'));
const LlevarPage = lazy(() => import('../pages/LlevarPage'));
const ReportesPage = lazy(() => import('../pages/ReportesPage'));
const InicioPage = lazy(() => import('../pages/InicioPage'));
const PerfilPage = lazy(() => import('../pages/PerfilPage'));
const MasPage = lazy(() => import('../pages/MasPage'));

export interface NavTabConfig {
  id: string;
  etiqueta: string; // Máximo 9 caracteres según glosario web
  label?: string; // Compatibilidad con BottomNav
  icono: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Componente polimórfico de vista diferida con props heterogéneas por rol
  vista: React.LazyExoticComponent<React.ComponentType<any>>;
}

/**
 * Catálogo canónico de pestañas permitidas por rol para la navegación móvil y tablet.
 * Cada pestaña incluye su vista orquestadora cargada de forma diferida (React.lazy).
 * Todas las etiquetas cumplen el límite estricto de 9 caracteres y el glosario de la web.
 */
export const PESTANAS_POR_ROL: Record<RolUsuario, NavTabConfig[]> = {
  Mozo: [
    { id: 'salon', etiqueta: 'Salón', label: 'Salón', icono: Utensils, icon: Utensils, vista: SalonPage },
    { id: 'pedidos', etiqueta: 'Pedidos', label: 'Pedidos', icono: Clock, icon: Clock, vista: PedidosPage },
    { id: 'perfil', etiqueta: 'Perfil', label: 'Perfil', icono: User, icon: User, vista: PerfilPage },
  ],
  Cajero: [
    { id: 'caja', etiqueta: 'Caja', label: 'Caja', icono: Lock, icon: Lock, vista: CajaPage },
    { id: 'cobros', etiqueta: 'Cobros', label: 'Cobros', icono: Receipt, icon: Receipt, vista: CobrosPage },
    { id: 'llevar', etiqueta: 'Llevar', label: 'Llevar', icono: ShoppingBag, icon: ShoppingBag, vista: LlevarPage },
    { id: 'salon', etiqueta: 'Salón', label: 'Salón', icono: Utensils, icon: Utensils, vista: SalonPage },
    { id: 'perfil', etiqueta: 'Perfil', label: 'Perfil', icono: User, icon: User, vista: PerfilPage },
  ],
  Cocinero: [
    { id: 'cocina', etiqueta: 'Cocina', label: 'Cocina', icono: ChefHat, icon: ChefHat, vista: CocinaPage },
    { id: 'platos', etiqueta: 'Menú', label: 'Menú', icono: CalendarCheck, icon: CalendarCheck, vista: PlatosPage },
    { id: 'perfil', etiqueta: 'Perfil', label: 'Perfil', icono: User, icon: User, vista: PerfilPage },
  ],
  Administrador: [
    { id: 'inicio', etiqueta: 'Inicio', label: 'Inicio', icono: LayoutDashboard, icon: LayoutDashboard, vista: InicioPage },
    { id: 'salon', etiqueta: 'Salón', label: 'Salón', icono: Utensils, icon: Utensils, vista: SalonPage },
    { id: 'caja', etiqueta: 'Caja', label: 'Caja', icono: Lock, icon: Lock, vista: CajaPage },
    { id: 'reportes', etiqueta: 'Reportes', label: 'Reportes', icono: BarChart3, icon: BarChart3, vista: ReportesPage },
    { id: 'mas', etiqueta: 'Más', label: 'Más', icono: Menu, icon: Menu, vista: MasPage },
  ],
};

/**
 * Retorna la pestaña inicial predeterminada según el rol del usuario autenticado.
 */
export function pestanaInicial(rol: RolUsuario): string {
  switch (rol) {
    case 'Administrador':
      return 'inicio';
    case 'Cajero':
      return 'caja';
    case 'Cocinero':
      return 'cocina';
    case 'Mozo':
    default:
      return 'salon';
  }
}

/**
 * Obtiene la lista de pestañas autorizadas para un rol.
 */
export function obtenerPestanasParaRol(rol: RolUsuario): NavTabConfig[] {
  return PESTANAS_POR_ROL[rol] || PESTANAS_POR_ROL.Mozo;
}
