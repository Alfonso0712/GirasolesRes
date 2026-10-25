import React from 'react';
import { Sidebar } from '../components/layout';
import { Header } from '../components/layout';
import type { UserSession } from '../types/auth';
import { resolveBreadcrumbs } from '../config/navigationConfig';

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
  const breadcrumbs = resolveBreadcrumbs(paginaActiva);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
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
          breadcrumbSection={breadcrumbs.section}
          breadcrumbPage={breadcrumbs.page}
          onToggleSidebar={() => setSidebarAbierto((prev) => !prev)}
        />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
