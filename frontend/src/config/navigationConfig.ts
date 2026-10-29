import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  ReceiptText,
  ChefHat,
  DollarSign,
  BadgeDollarSign,
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
  icon: LucideIcon;
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
        matchPaths: ['mesas', 'pedidos-mesa', 'pedidos-llevar', 'pedido-mesa', 'pedido-llevar'],
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
        icon: DollarSign,
        roles: ['Cajero'],
        matchPaths: ['caja'],
      },
      {
        id: 'ventas',
        label: 'Historial de Ventas',
        icon: BadgeDollarSign,
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

/**
 * Resuelve la sección y la página para la cabecera a partir de la ruta activa,
 * soportando rutas dinámicas y casos especiales como "Inicio" sin prefijo de grupo.
 */
export function resolveBreadcrumbs(paginaActiva: string): BreadcrumbResolution {
  // Caso especial: "Inicio" / Dashboard sin grupo en el breadcrumb
  if (paginaActiva === 'inicio' || paginaActiva === 'dashboard') {
    return {
      section: null,
      page: 'Inicio',
    };
  }

  // Rutas dinámicas de pedido de mesa / llevar
  if (paginaActiva === 'pedidos-mesa' || paginaActiva === 'pedido-mesa') {
    return {
      section: 'Salón y Pedidos',
      page: 'Pedido de Mesa',
    };
  }
  if (paginaActiva === 'pedidos-llevar' || paginaActiva === 'pedido-llevar') {
    return {
      section: 'Salón y Pedidos',
      page: 'Pedido para Llevar',
    };
  }

  // Buscar en los grupos canónicos
  for (const group of NAVIGATION_GROUPS) {
    for (const item of group.items) {
      if (item.id === paginaActiva || item.matchPaths?.includes(paginaActiva)) {
        return {
          section: group.title,
          page: item.label,
        };
      }
    }
  }

  return {
    section: null,
    page: 'Inicio',
  };
}
