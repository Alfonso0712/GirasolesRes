import React from 'react';
import { UsersPage } from '../UsersPage';
import { MesasPage } from '../MesasPage';
import { ProductsPage } from '../ProductsPage';
import { MenuDiaPage } from '../MenuDiaPage';
import { PedidoMesaPage } from '../PedidoMesaPage';
import { PedidoLlevarPage } from '../PedidoLlevarPage';
import { PedidosPage } from '../PedidosPage';
import { CocinaPage } from '../CocinaPage';
import { CobrosPage } from '../CobrosPage';
import { VentasPage } from '../VentasPage';
import { HistorialCierresPage } from '../HistorialCierresPage';
import { ReportesPage } from '../ReportesPage';
import { DashboardPage } from '../DashboardPage';
import { ConfiguracionPage } from '../ConfiguracionPage';
import { AccesoRestringidoView } from '../../components/layout';
import type { UserSession } from '../../types/auth';

export interface HomeActiveViewProps {
  paginaActiva: string;
  session: UserSession;
  onLogout: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onUpdateSession: (session: UserSession) => void;
  setPaginaActiva: (pagina: string) => void;
  mesaSeleccionadaParaPedido: string | null;
  setMesaSeleccionadaParaPedido: (mesaId: string | null) => void;
  modoPedidoMesa: 'nuevo' | 'ampliacion';
  setModoPedidoMesa: (modo: 'nuevo' | 'ampliacion') => void;
  pedidoIdParaPedidoMesa: string | null;
  setPedidoIdParaPedidoMesa: (id: string | null) => void;
  mesaParaCobro: { id: string; nombre: string } | null;
  setMesaParaCobro: (mesa: { id: string; nombre: string } | null) => void;
  pedidoIdParaCobro: string | null;
  setPedidoIdParaCobro: (id: string | null) => void;
  filtroEstadoPedidos: string;
  consultarCajaGlobal: () => void;
  handleDashboardNavigate: (pagina: string, params?: Record<string, unknown>) => void;
}

export const HomeActiveView: React.FC<HomeActiveViewProps> = ({
  paginaActiva,
  session,
  onLogout,
  onUpdateSession,
  setPaginaActiva,
  mesaSeleccionadaParaPedido,
  setMesaSeleccionadaParaPedido,
  modoPedidoMesa,
  setModoPedidoMesa,
  pedidoIdParaPedidoMesa,
  setPedidoIdParaPedidoMesa,
  mesaParaCobro,
  setMesaParaCobro,
  pedidoIdParaCobro,
  setPedidoIdParaCobro,
  filtroEstadoPedidos,
  consultarCajaGlobal,
  handleDashboardNavigate,
}) => {
  const irAModuloPrincipal = () =>
    setPaginaActiva(
      session.rol === 'Cajero'
        ? 'pedidos-llevar'
        : session.rol === 'Mozo'
        ? 'mesas'
        : session.rol === 'Cocinero'
        ? 'cocina'
        : 'inicio'
    );

  if (paginaActiva === 'productos' && session.rol === 'Administrador') {
    return <ProductsPage session={session} onLogout={onLogout} />;
  }

  if (paginaActiva === 'menu-dia' && (session.rol === 'Administrador' || session.rol === 'Cocinero')) {
    return (
      <MenuDiaPage
        session={session}
        onLogout={onLogout}
        onNavigateToProductos={() => setPaginaActiva('productos')}
      />
    );
  }

  if (paginaActiva === 'usuarios' && session.rol === 'Administrador') {
    return <UsersPage session={session} onLogout={onLogout} />;
  }

  if (
    paginaActiva === 'mesas' &&
    (session.rol === 'Administrador' || session.rol === 'Mozo' || session.rol === 'Cajero')
  ) {
    return (
      <MesasPage
        session={session}
        onLogout={onLogout}
        onNavigateToPedido={(mesaId, modo, pedidoId) => {
          setMesaSeleccionadaParaPedido(mesaId);
          setModoPedidoMesa(modo || 'nuevo');
          setPedidoIdParaPedidoMesa(pedidoId || null);
          setPaginaActiva('pedidos-mesa');
        }}
        onNavigateToCobro={(mesa) => {
          setMesaParaCobro(mesa);
          setPaginaActiva('caja');
        }}
        onNavigateToPedidoLlevar={() => setPaginaActiva('pedidos-llevar')}
        onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
      />
    );
  }

  if (
    paginaActiva === 'pedidos-mesa' &&
    (session.rol === 'Administrador' || session.rol === 'Mozo')
  ) {
    return mesaSeleccionadaParaPedido ? (
      <PedidoMesaPage
        session={session}
        mesaIdInicial={mesaSeleccionadaParaPedido}
        modoInicial={modoPedidoMesa}
        pedidoIdInicial={pedidoIdParaPedidoMesa}
        onLogout={onLogout}
        onVolverAMesas={() => {
          setMesaSeleccionadaParaPedido(null);
          setPedidoIdParaPedidoMesa(null);
          setPaginaActiva('mesas');
        }}
        onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
      />
    ) : null;
  }

  if (
    paginaActiva === 'pedidos-llevar' &&
    (session.rol === 'Administrador' || session.rol === 'Cajero')
  ) {
    return (
      <PedidoLlevarPage
        session={session}
        onLogout={onLogout}
        onVolver={() => setPaginaActiva('mesas')}
        onNavigateToCobro={() => setPaginaActiva('caja')}
        onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
      />
    );
  }

  if (
    paginaActiva === 'pedidos' &&
    (session.rol === 'Administrador' || session.rol === 'Mozo' || session.rol === 'Cajero')
  ) {
    return (
      <PedidosPage
        session={session}
        onLogout={onLogout}
        filtroEstadoInicial={filtroEstadoPedidos}
        onNavigateToCobro={(pedidoId) => {
          setPedidoIdParaCobro(pedidoId);
          setPaginaActiva('caja');
        }}
      />
    );
  }

  if ((paginaActiva === 'caja' || paginaActiva === 'cobros') && session.rol === 'Cajero') {
    return (
      <CobrosPage
        session={session}
        onLogout={onLogout}
        mesaSeleccionadaInicial={mesaParaCobro}
        pedidoIdInicial={pedidoIdParaCobro}
        onClearMesaInicial={() => {
          setMesaParaCobro(null);
          setPedidoIdParaCobro(null);
        }}
        onCajaEstadoChange={consultarCajaGlobal}
      />
    );
  }

  if (paginaActiva === 'ventas' && (session.rol === 'Administrador' || session.rol === 'Cajero')) {
    return <VentasPage session={session} onLogout={onLogout} />;
  }

  if (paginaActiva === 'historial-cierres') {
    return session.rol === 'Administrador' ? (
      <HistorialCierresPage session={session} onLogout={onLogout} />
    ) : (
      <AccesoRestringidoView modulo="historial-cierres" onIrAModuloPrincipal={irAModuloPrincipal} />
    );
  }

  if (paginaActiva === 'reportes') {
    return session.rol === 'Administrador' ? (
      <ReportesPage
        session={session}
        onLogout={onLogout}
        onNavigateToCierres={() => setPaginaActiva('historial-cierres')}
      />
    ) : (
      <AccesoRestringidoView modulo="reportes" onIrAModuloPrincipal={irAModuloPrincipal} />
    );
  }

  if (paginaActiva === 'cocina' && session.rol === 'Cocinero') {
    return (
      <CocinaPage
        session={session}
        onLogout={onLogout}
        onUpdateSession={onUpdateSession}
      />
    );
  }

  if (paginaActiva === 'configuracion') {
    return <ConfiguracionPage session={session} onLogout={onLogout} />;
  }

  return (
    <DashboardPage
      session={session}
      onNavigate={handleDashboardNavigate}
    />
  );
};
