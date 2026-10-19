import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import type { UserSession } from '../types/auth';

interface MainLayoutProps {
  children: React.ReactNode;
  session?: UserSession | null;
  onLogout?: () => void;
  onCambiarPassword?: () => void;
  paginaActiva?: string;
  onSelectPagina?: (pagina: string) => void;
  pedidosListosCount?: number;
  cajaEstado?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  session,
  onLogout,
  onCambiarPassword,
  paginaActiva = 'usuarios',
  onSelectPagina,
  pedidosListosCount,
  cajaEstado,
}) => {
  const [sidebarAbierto, setSidebarAbierto] = React.useState(false);

  const getTituloPagina = (p?: string) => {
    switch (p) {
      case 'usuarios':
        return 'Usuarios';
      case 'productos':
        return 'Productos';
      case 'menu-dia':
        return 'Menú del día';
      case 'caja':
        return 'Caja y Cobros';
      case 'ventas':
        return 'Gestión de Ventas';
      case 'historial-cierres':
        return 'Historial de Cierres de Caja';
      case 'mesas':
        return 'Mesas y Salón';
      case 'pedidos-mesa':
        return 'Tomar Pedido';
      case 'pedidos-llevar':
        return 'Pedido para Llevar';
      case 'pedidos':
        return 'Gestión de Pedidos';
      case 'cocina':
        return 'Cocina (KDS)';
      default:
        return 'Inicio';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F4]">
      <Sidebar
        session={session}
        onLogout={onLogout}
        paginaActiva={paginaActiva}
        onSelectPagina={onSelectPagina}
        isOpenMobile={sidebarAbierto}
        onCloseMobile={() => setSidebarAbierto(false)}
        pedidosListosCount={pedidosListosCount}
        cajaEstado={cajaEstado}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          session={session}
          onLogout={onLogout}
          onCambiarPassword={onCambiarPassword}
          breadcrumbSection={
            session?.rol === 'Cocinero'
              ? 'Cocina'
              : session?.rol === 'Mozo'
              ? 'Salón y Comandas'
              : 'Administración'
          }
          breadcrumbPage={getTituloPagina(paginaActiva)}
          onToggleSidebar={() => setSidebarAbierto((prev) => !prev)}
        />
        <main className="flex-1 flex flex-col overflow-y-auto relative w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
