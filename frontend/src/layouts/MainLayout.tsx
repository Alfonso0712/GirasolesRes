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
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  session,
  onLogout,
  onCambiarPassword,
  paginaActiva = 'usuarios',
  onSelectPagina
}) => {
  const [sidebarAbierto, setSidebarAbierto] = React.useState(false);

  const getTituloPagina = (p?: string) => {
    switch (p) {
      case 'usuarios':
        return 'Usuarios';
      case 'roles':
        return 'Roles y permisos';
      case 'caja':
        return 'Caja y Ventas';
      case 'mesas':
        return 'Mesas y Pedidos';
      case 'cocina':
        return 'Cocina (KDS)';
      default:
        return 'Inicio';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF9]">
      <Sidebar
        session={session}
        onLogout={onLogout}
        paginaActiva={paginaActiva}
        onSelectPagina={onSelectPagina}
        isOpenMobile={sidebarAbierto}
        onCloseMobile={() => setSidebarAbierto(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          session={session}
          onLogout={onLogout}
          onCambiarPassword={onCambiarPassword}
          breadcrumbSection="Administración"
          breadcrumbPage={getTituloPagina(paginaActiva)}
          onToggleSidebar={() => setSidebarAbierto((prev) => !prev)}
        />
        <main className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
