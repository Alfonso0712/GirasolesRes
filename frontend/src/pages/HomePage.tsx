import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { cajaService } from '../services/cajaService';
import { useKitchenNotifications } from '../hooks/useKitchenNotifications';
import { useSessionLifecycle } from '../hooks/useSessionLifecycle';
import type { UserSession } from '../types/auth';
import type { CajaActualResponseDto } from '../types/caja';
import { HomeActiveView, HomePageModals } from './home';

interface HomePageProps {
  session: UserSession;
  onLogout: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onUpdateSession: (session: UserSession) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  session,
  onLogout,
  onUpdateSession
}) => {
  // RN-124, RV-144, E-346: Todo usuario llega a su pantalla de inicio tras iniciar sesión
  const [paginaActiva, setPaginaActiva] = useState('inicio');

  // Filtro de estado para navegación hacia Pedidos (RV-146, E-350)
  const [filtroEstadoPedidos, setFiltroEstadoPedidos] = useState<string>('');

  // Estado de mesa seleccionada para pedido (CUS07)
  const [mesaSeleccionadaParaPedido, setMesaSeleccionadaParaPedido] = useState<string | null>(null);
  const [modoPedidoMesa, setModoPedidoMesa] = useState<'nuevo' | 'ampliacion'>('nuevo');
  const [pedidoIdParaPedidoMesa, setPedidoIdParaPedidoMesa] = useState<string | null>(null);

  // Estados para navegación contextual hacia Cobros (CUS11)
  const [mesaParaCobro, setMesaParaCobro] = useState<{ id: string; nombre: string } | null>(null);
  const [pedidoIdParaCobro, setPedidoIdParaCobro] = useState<string | null>(null);

  // Sincronización compartida del estado de caja (CUS 13)
  const [cajaGlobal, setCajaGlobal] = useState<CajaActualResponseDto | null>(null);

  const consultarCajaGlobal = useCallback(async () => {
    if (session.rol !== 'Cajero' && session.rol !== 'Administrador') return;
    try {
      const data = await cajaService.obtenerActual(session.token);
      setCajaGlobal(data);
    } catch {
      // ignore network errors
    }
  }, [session.rol, session.token]);

  useEffect(() => {
    consultarCajaGlobal();
    const interval = setInterval(consultarCajaGlobal, 30000);
    return () => clearInterval(interval);
  }, [consultarCajaGlobal]);

  // RN-106 / RN-116: Redirección automática si un rol no autorizado intenta acceder a Historial de Cierres o Reportes
  useEffect(() => {
    if (paginaActiva === 'historial-cierres' && session.rol !== 'Administrador') {
      const defaultPage =
        session.rol === 'Cajero'
          ? 'pedidos-llevar'
          : session.rol === 'Mozo'
          ? 'mesas'
          : session.rol === 'Cocinero'
          ? 'cocina'
          : 'inicio';
      setPaginaActiva(defaultPage);
      return;
    }
    if (paginaActiva === 'reportes' && session.rol !== 'Administrador') {
      const defaultPage =
        session.rol === 'Cajero'
          ? 'pedidos-llevar'
          : session.rol === 'Mozo'
          ? 'mesas'
          : session.rol === 'Cocinero'
          ? 'cocina'
          : 'inicio';
      setPaginaActiva(defaultPage);
      return;
    }
    if (paginaActiva === 'pedidos-mesa' || paginaActiva === 'pedido-mesa') {
      if (session.rol !== 'Administrador' && session.rol !== 'Mozo') {
        const defaultPage =
          session.rol === 'Cajero'
            ? 'pedidos-llevar'
            : session.rol === 'Cocinero'
            ? 'cocina'
            : 'inicio';
        setPaginaActiva(defaultPage);
        return;
      }
      if (!mesaSeleccionadaParaPedido) {
        setPaginaActiva('mesas');
      }
    }
  }, [paginaActiva, session.rol, mesaSeleccionadaParaPedido]);

  // Estados de Modales del CUS-03
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [mostrarModalConfiguracion, setMostrarModalConfiguracion] = useState(false);

  // RV-28: Mensaje flotante de confirmación (Toast) durante 4 segundos
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const {
    mostrarModalLogout,
    setMostrarModalLogout,
    cerrandoLogout,
    mostrarModalInactividad,
    handleConfirmLogout,
    handleContinuarSesion,
    handleTimeoutInactividad,
  } = useSessionLifecycle({
    session,
    paginaActiva,
    onLogout,
    onUpdateSession,
  });

  const {
    avisosPendientes,
    cerrandoAviso,
    handleCerrarAviso,
    avisoNuevaComandaCocinero,
    setAvisoNuevaComandaCocinero,
  } = useKitchenNotifications({
    session,
    paginaActiva,
  });

  // Éxito al cambiar contraseña (HU-09 / RF-07 / Vista 3.2)
  const handlePasswordSuccess = (nuevoToken: string, mensaje: string) => {
    onUpdateSession({ ...session, token: nuevoToken });
    setToastMensaje(mensaje || 'Contraseña actualizada correctamente.');
    setTimeout(() => {
      setToastMensaje(null);
    }, 4000);
  };

  // Bloqueo por 5 intentos fallidos consecutivos (RN-17 / E-51)
  const handleForceLogoutDueToFailedAttempts = () => {
    setMostrarModalPassword(false);
    onLogout({
      type: 'error',
      message: 'Por seguridad se cerró su sesión. Superó los 5 intentos fallidos.'
    });
  };

  // Navegación contextual desde Dashboard (CUS15)
  const handleDashboardNavigate = (pagina: string, params?: Record<string, unknown>) => {
    if (pagina === 'cobros' || pagina === 'caja') {
      if (session.rol === 'Cajero') {
        setPaginaActiva('caja');
      } else {
        setFiltroEstadoPedidos('Listo');
        setPaginaActiva('pedidos');
      }
      return;
    }
    if (pagina === 'pedidos') {
      const est = typeof params?.estado === 'string' ? params.estado : '';
      const normalizado = est
        ? est.toLowerCase() === 'listo'
          ? 'Listo'
          : est.toLowerCase() === 'pendiente'
          ? 'Pendiente'
          : est.toLowerCase() === 'en_proceso' || est.toLowerCase() === 'enpreparacion'
          ? 'EnPreparacion'
          : est
        : '';
      setFiltroEstadoPedidos(normalizado);
    }
    if (pagina === 'caja' || pagina === 'cobros') {
      if (session.rol === 'Cajero') {
        if (typeof params?.pedidoId === 'string') {
          setPedidoIdParaCobro(params.pedidoId);
        }
        if (params?.mesa && typeof params.mesa === 'object') {
          setMesaParaCobro(params.mesa as { id: string; nombre: string });
        }
        setPaginaActiva('caja');
      } else {
        setFiltroEstadoPedidos('listo');
        setPaginaActiva('pedidos');
      }
      return;
    }
    if (pagina === 'pedido-mesa' || pagina === 'pedidos-mesa') {
      const mesaId = typeof params?.mesaId === 'string' ? params.mesaId : null;
      if (!mesaId) {
        setMesaSeleccionadaParaPedido(null);
        setPaginaActiva('mesas');
        return;
      }
      setMesaSeleccionadaParaPedido(mesaId);
      setModoPedidoMesa((params?.modo as 'nuevo' | 'ampliacion') || 'nuevo');
      setPedidoIdParaPedidoMesa(typeof params?.pedidoId === 'string' ? params.pedidoId : null);
      setPaginaActiva('pedidos-mesa');
      return;
    }
    setPaginaActiva(pagina);
  };

  return (
    <MainLayout
      session={session}
      onLogout={() => setMostrarModalLogout(true)}
      onCambiarPassword={() => setMostrarModalPassword(true)}
      onAbrirConfiguracion={() => setPaginaActiva('configuracion')}
      paginaActiva={paginaActiva}
      pedidosListosCount={avisosPendientes.length}
      cajaEstado={cajaGlobal?.estado}
      onSelectPagina={(p) => {
        if (p === 'historial-cierres' && session.rol !== 'Administrador') {
          return;
        }
        if (p === 'pedido-mesa' || p === 'pedidos-mesa') {
          setMesaSeleccionadaParaPedido(null);
          setPaginaActiva('mesas');
          return;
        }
        if (p === 'cobros') {
          setMesaSeleccionadaParaPedido(null);
          setPaginaActiva('caja');
          return;
        }
        setMesaSeleccionadaParaPedido(null);
        setPaginaActiva(p);
      }}
    >
      <HomeActiveView
        paginaActiva={paginaActiva}
        session={session}
        onLogout={onLogout}
        onUpdateSession={onUpdateSession}
        setPaginaActiva={setPaginaActiva}
        mesaSeleccionadaParaPedido={mesaSeleccionadaParaPedido}
        setMesaSeleccionadaParaPedido={setMesaSeleccionadaParaPedido}
        modoPedidoMesa={modoPedidoMesa}
        setModoPedidoMesa={setModoPedidoMesa}
        pedidoIdParaPedidoMesa={pedidoIdParaPedidoMesa}
        setPedidoIdParaPedidoMesa={setPedidoIdParaPedidoMesa}
        mesaParaCobro={mesaParaCobro}
        setMesaParaCobro={setMesaParaCobro}
        pedidoIdParaCobro={pedidoIdParaCobro}
        setPedidoIdParaCobro={setPedidoIdParaCobro}
        filtroEstadoPedidos={filtroEstadoPedidos}
        consultarCajaGlobal={consultarCajaGlobal}
        handleDashboardNavigate={handleDashboardNavigate}
      />

      <HomePageModals
        session={session}
        mostrarModalLogout={mostrarModalLogout}
        setMostrarModalLogout={setMostrarModalLogout}
        cerrandoLogout={cerrandoLogout}
        handleConfirmLogout={handleConfirmLogout}
        mostrarModalInactividad={mostrarModalInactividad}
        handleContinuarSesion={handleContinuarSesion}
        handleTimeoutInactividad={handleTimeoutInactividad}
        mostrarModalPassword={mostrarModalPassword}
        setMostrarModalPassword={setMostrarModalPassword}
        handlePasswordSuccess={handlePasswordSuccess}
        handleForceLogoutDueToFailedAttempts={handleForceLogoutDueToFailedAttempts}
        mostrarModalConfiguracion={mostrarModalConfiguracion}
        setMostrarModalConfiguracion={setMostrarModalConfiguracion}
        avisosPendientes={avisosPendientes}
        handleCerrarAviso={handleCerrarAviso}
        cerrandoAviso={cerrandoAviso}
        avisoNuevaComandaCocinero={avisoNuevaComandaCocinero}
        setAvisoNuevaComandaCocinero={setAvisoNuevaComandaCocinero}
        setPaginaActiva={setPaginaActiva}
        toastMensaje={toastMensaje}
        setToastMensaje={setToastMensaje}
      />
    </MainLayout>
  );
};

export default HomePage;

