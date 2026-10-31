import React from 'react';
import {
  ShoppingBag,
  LayoutGrid,
  Lock,
  UtensilsCrossed,
  Users,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';
import { QuickActionCard } from '../QuickActionCard';

export interface AdminQuickActionsProps {
  onNavigate: (pagina: string) => void;
}

export const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    { label: 'Pedido para Llevar', pagina: 'pedidos-llevar', icon: ShoppingBag },
    { label: 'Mesas y Salón', pagina: 'mesas', icon: LayoutGrid },
    { label: 'Historial de Cierres', pagina: 'historial-cierres', icon: Lock },
    { label: 'Ventas y Anulaciones', pagina: 'ventas', icon: SolesIcon },
    { label: 'Reportes y Estadísticas', pagina: 'reportes', icon: BarChart3 },
    { label: 'Menú del Día', pagina: 'menu-dia', icon: CalendarCheck },
    { label: 'Gestión de Productos', pagina: 'productos', icon: UtensilsCrossed },
    { label: 'Gestión de Usuarios', pagina: 'usuarios', icon: Users },
  ];

  return (
    <div className="bg-surface border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
        Accesos Rápidos a Módulos
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {actions.map((act) => (
          <QuickActionCard
            key={act.pagina}
            label={act.label}
            icon={act.icon}
            variant="secondary"
            onClick={() => onNavigate(act.pagina)}
          />
        ))}
      </div>
    </div>
  );
};
