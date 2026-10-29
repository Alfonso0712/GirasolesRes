import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { SolesIcon } from '../components/ui/SolesIcon';
import {
  LayoutGrid,
  ReceiptText,
  ChefHat,
  Lock,
  CalendarCheck,
  UtensilsCrossed,
  Users,
  BarChart3,
} from 'lucide-react';
import type { RolUsuario } from '../types/usuario';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number | string }>;
  roles: RolUsuario[];
  /** Sub-rutas o rutas dinámicas que activan este ítem */
  matchPaths?: string[];
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
}

/**
 * Fuente única de verdad para el árbol de navegación.
 * Alimenta tanto al Sidebar como a la Cabecera (Header / MainLayout).
 */
export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'salon-pedidos',
    title: 'Salón y Pedidos',
    items: [
      {
        id: 'mesas',
        label: 'Mesas y Salón',
        icon: LayoutGrid,
        roles: ['Administrador', 'Mozo', 'Cajero'],
        matchPaths: ['mesas'],
      },
      {
        id: 'pedidos',
        label: 'Gestión de Pedidos',
        icon: ReceiptText,
        roles: ['Administrador', 'Mozo', 'Cajero'],
        matchPaths: ['pedidos'],
      },
      {
        id: 'cocina',
        label: 'Cocina (KDS)',
        icon: ChefHat,
        roles: ['Cocinero'],
        matchPaths: ['cocina'],
      },
    ],
  },
  {
    id: 'caja-ventas',
    title: 'Caja y Ventas',
    items: [
      {
        id: 'caja',
        label: 'Caja y Cobros',
        icon: SolesIcon,
        roles: ['Cajero'],
        matchPaths: ['caja'],
      },
      {
        id: 'ventas',
        label: 'Historial de Ventas',
        icon: SolesIcon,
        roles: ['Administrador', 'Cajero'],
        matchPaths: ['ventas'],
      },
      {
        id: 'historial-cierres',
        label: 'Historial de Cierres',
        icon: Lock,
        roles: ['Administrador'],
        matchPaths: ['historial-cierres'],
      },
    ],
  },
  {
    id: 'carta-menu',
    title: 'Carta y Menú',
    items: [
      {
        id: 'menu-dia',
        label: 'Menú del día',
        icon: CalendarCheck,
        roles: ['Administrador', 'Cocinero'],
        matchPaths: ['menu-dia'],
      },
      {
        id: 'productos',
        label: 'Productos',
        icon: UtensilsCrossed,
        roles: ['Administrador'],
        matchPaths: ['productos'],
      },
    ],
  },
  {
    id: 'administracion',
    title: 'Administración',
    items: [
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: Users,
        roles: ['Administrador'],
        matchPaths: ['usuarios'],
      },
      {
        id: 'reportes',
        label: 'Reportes',
        icon: BarChart3,
        roles: ['Administrador'],
        matchPaths: ['reportes'],
      },
    ],
  },
];

export interface BreadcrumbResolution {
  section: string | null;
  page: string;
}

export interface NavigationResolution extends BreadcrumbResolution {
  groupId: string | null;
  activeItemId: string | null;
}

/**
 * Resuelve de forma unificada el grupo, ítem activo del menú lateral y breadcrumb
 * de la cabecera a partir de la ruta activa.
 */
export function resolveNavigation(paginaActiva: string): NavigationResolution {
  if (!paginaActiva || paginaActiva === 'inicio' || paginaActiva === 'dashboard') {
    return {
      groupId: null,
      activeItemId: 'inicio',
      section: null,
      page: 'Inicio',
    };
  }

  if (paginaActiva === 'pedidos-mesa' || paginaActiva === 'pedido-mesa') {
    return {
      groupId: 'salon-pedidos',
      activeItemId: null,
      section: 'Salón y Pedidos',
      page: 'Pedido de Mesa',
    };
  }

  if (paginaActiva === 'pedidos-llevar' || paginaActiva === 'pedido-llevar') {
    return {
      groupId: 'salon-pedidos',
      activeItemId: null,
      section: 'Salón y Pedidos',
      page: 'Pedido para Llevar',
    };
  }

  for (const group of NAVIGATION_GROUPS) {
    for (const item of group.items) {
      if (item.id === paginaActiva || item.matchPaths?.includes(paginaActiva)) {
        return {
          groupId: group.id,
          activeItemId: item.id,
          section: group.title,
          page: item.label,
        };
      }
    }
  }

  return {
    groupId: null,
    activeItemId: 'inicio',
    section: null,
    page: 'Inicio',
  };
}

export function isNavigationItemActive(item: NavigationItem, paginaActiva: string): boolean {
  return resolveNavigation(paginaActiva).activeItemId === item.id;
}

/**
 * Resuelve la sección y la página para la cabecera a partir de la ruta activa,
 * soportando rutas dinámicas y casos especiales como "Inicio" sin prefijo de grupo.
 */
export function resolveBreadcrumbs(paginaActiva: string): BreadcrumbResolution {
  const { section, page } = resolveNavigation(paginaActiva);
  return { section, page };
}
