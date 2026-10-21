import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { UsersPage } from './UsersPage';
import { MesasPage } from './MesasPage';
import { ProductsPage } from './ProductsPage';
import { MenuDiaPage } from './MenuDiaPage';
import { PedidoMesaPage } from './PedidoMesaPage';
import { PedidoLlevarPage } from './PedidoLlevarPage';
import { PedidosPage } from './PedidosPage';
import { CocinaPage } from './CocinaPage';
import { CobrosPage } from './CobrosPage';
import { VentasPage } from './VentasPage';
import { HistorialCierresPage } from './HistorialCierresPage';
import { ReportesPage } from './ReportesPage';
import { DashboardPage } from './DashboardPage';
import { LogoutModal } from '../components/layout';
import { InactivityModal } from '../components/layout';
import { ChangePasswordModal } from '../components/usuarios';
import { AvisoComandaModal } from '../components/cocina';
import { logoutService, renovarTokenService } from '../services/authService';
import { pedidoService } from '../services/pedidoService';
import { cajaService } from '../services/cajaService';
import { Check, ShieldAlert } from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { AvisoComandaDto } from '../types/pedido';
import type { CajaActualResponseDto } from '../types/caja';

interface HomePageProps {
  session: UserSession;
  onLogout: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onUpdateSession: (session: UserSession) => void;
}

// RN-20: 30 minutos totales de inactividad. Advertencia a los 28 minutos (RV-32)
const INACTIVITY_THRESHOLD_MS = 28 * 60 * 1000;

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
    }
  }, [paginaActiva, session.rol]);

  // Estados de Modales del CUS-03
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [cerrandoLogout, setCerrandoLogout] = useState(false);

  const [mostrarModalInactividad, setMostrarModalInactividad] = useState(false);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);

  // RV-28: Mensaje flotante de confirmación (Toast) durante 4 segundos
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // CUS09.3: Avisos de comandas listas para recoger (HU27 / RF-27 / RN-71)
  const [avisosPendientes, setAvisosPendientes] = useState<AvisoComandaDto[]>([]);
  const [cerrandoAviso, setCerrandoAviso] = useState(false);

  // Sondeo cada 15 segundos para avisos de pedidos listos
  const consultarAvisos = useCallback(async () => {
    if (session.rol !== 'Mozo' && session.rol !== 'Cajero' && session.rol !== 'Administrador') return;
    try {
      const data = await pedidoService.obtenerAvisosPendientes(session.token);
      if (Array.isArray(data)) {
        setAvisosPendientes(data);
      }
    } catch (err) {
      console.warn('Error al consultar avisos de pedidos listos:', err);
    }
  }, [session.rol, session.token]);

  useEffect(() => {
    consultarAvisos();
    const interval = setInterval(consultarAvisos, 15000);
    return () => clearInterval(interval);
  }, [consultarAvisos]);

  const handleCerrarAviso = async (comandaId: string) => {
    setCerrandoAviso(true);
    try {
      await pedidoService.marcarAvisoVisto(comandaId, session.token);
      setAvisosPendientes((prev) => prev.filter((a) => a.id !== comandaId));
    } catch (err) {
      console.error('Error al marcar aviso visto:', err);
    } finally {
      setCerrandoAviso(false);
    }
  };

  // Referencia para temporizador de inactividad
  const ultimaActividadRef = useRef<number>(Date.now());

  // Registrar eventos de interacción de usuario (RV-32 / RN-20)
  const registrarActividad = useCallback(() => {
    if (!mostrarModalInactividad) {
      ultimaActividadRef.current = Date.now();
    }
  }, [mostrarModalInactividad]);

  useEffect(() => {
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimeout: any = null;

    const handleUserEvent = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          registrarActividad();
          throttleTimeout = null;
        }, 1000);
      }
    };

    eventos.forEach((e) => window.addEventListener(e, handleUserEvent, { passive: true }));

    // Verificación periódica cada segundo
    const interval = setInterval(() => {
      if (paginaActiva === 'cocina' && session.rol === 'Cocinero') {
        ultimaActividadRef.current = Date.now();
        return;
      }

      if (!mostrarModalInactividad && !mostrarModalLogout) {
        const transcurrido = Date.now() - ultimaActividadRef.current;
        if (transcurrido >= INACTIVITY_THRESHOLD_MS) {
          setMostrarModalInactividad(true);
        }
      }
    }, 1000);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, handleUserEvent));
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(interval);
    };
  }, [mostrarModalInactividad, mostrarModalLogout, registrarActividad]);

  // Cierre de sesión manual (HU-08 / RF-02 / Vista 3.1)
  const handleConfirmLogout = async () => {
    setCerrandoLogout(true);
    try {
      await logoutService('manual', session.token);
    } catch (err) {
      console.warn('Error al revocar token en backend:', err);
    } finally {
      setCerrandoLogout(false);
      setMostrarModalLogout(false);
      onLogout({
        type: 'success',
        message: 'Sesión cerrada correctamente.'
      });
    }
  };

  // Continuar sesión tras aviso de inactividad (RV-32 / RN-20 / Vista 3.1b)
  const handleContinuarSesion = async () => {
    try {
      const nuevoToken = await renovarTokenService(session.token);
      onUpdateSession({ ...session, token: nuevoToken });
    } catch (err) {
      console.warn('No se pudo renovar token, continuando con token actual:', err);
    } finally {
      ultimaActividadRef.current = Date.now();
      setMostrarModalInactividad(false);
    }
  };

  // Timeout de inactividad (120 s transcurridos en modal sin acción)
  const handleTimeoutInactividad = async () => {
    setMostrarModalInactividad(false);
    try {
      await logoutService('inactividad', session.token);
    } catch (err) {
      console.warn('Error en logout por inactividad:', err);
    }
    onLogout({
      type: 'warning',
      message: 'Su sesión expiró por inactividad. Ingrese nuevamente.'
    });
  };

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
  const handleDashboardNavigate = (pagina: string, params?: any) => {
    if (pagina === 'pedidos') {
      setFiltroEstadoPedidos(params?.estado || '');
    }
    if (pagina === 'pedido-mesa' || pagina === 'pedidos-mesa') {
      setMesaSeleccionadaParaPedido(null);
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
      paginaActiva={paginaActiva}
      pedidosListosCount={avisosPendientes.length}
      cajaEstado={cajaGlobal?.estado}
      onSelectPagina={(p) => {
        if (p === 'historial-cierres' && session.rol !== 'Administrador') {
          return;
        }
        if (p !== 'pedidos-mesa') {
          setMesaSeleccionadaParaPedido(null);
        }
        setPaginaActiva(p);
      }}
    >
      {paginaActiva === 'productos' && session.rol === 'Administrador' ? (
        <ProductsPage session={session} onLogout={onLogout} />
      ) : paginaActiva === 'menu-dia' && (session.rol === 'Administrador' || session.rol === 'Cocinero') ? (
        <MenuDiaPage
          session={session}
          onLogout={onLogout}
          onNavigateToProductos={() => setPaginaActiva('productos')}
        />
      ) : paginaActiva === 'usuarios' && session.rol === 'Administrador' ? (
        <UsersPage session={session} onLogout={onLogout} />
      ) : paginaActiva === 'mesas' && (session.rol === 'Administrador' || session.rol === 'Mozo' || session.rol === 'Cajero') ? (
        <MesasPage
          session={session}
          onLogout={onLogout}
          onNavigateToPedido={(mesaId) => {
            setMesaSeleccionadaParaPedido(mesaId);
            setPaginaActiva('pedidos-mesa');
          }}
          onNavigateToCobro={(mesa) => {
            setMesaParaCobro(mesa);
            setPaginaActiva('caja');
          }}
          onNavigateToPedidoLlevar={() => {
            setPaginaActiva('pedidos-llevar');
          }}
          onNavigateToMenuDia={() => {
            setPaginaActiva('menu-dia');
          }}
        />
      ) : paginaActiva === 'pedidos-mesa' && (session.rol === 'Administrador' || session.rol === 'Mozo') ? (
        <PedidoMesaPage
          session={session}
          mesaIdInicial={mesaSeleccionadaParaPedido}
          onLogout={onLogout}
          onVolverAMesas={() => {
            setMesaSeleccionadaParaPedido(null);
            setPaginaActiva('mesas');
          }}
          onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
        />
      ) : paginaActiva === 'pedidos-llevar' && (session.rol === 'Administrador' || session.rol === 'Cajero') ? (
        <PedidoLlevarPage
          session={session}
          onLogout={onLogout}
          onVolver={() => setPaginaActiva('mesas')}
          onNavigateToCobro={() => {
            setPaginaActiva('caja');
          }}
          onNavigateToMenuDia={() => setPaginaActiva('menu-dia')}
        />
      ) : paginaActiva === 'pedidos' && (session.rol === 'Administrador' || session.rol === 'Mozo' || session.rol === 'Cajero') ? (
        <PedidosPage
          session={session}
          onLogout={onLogout}
          filtroEstadoInicial={filtroEstadoPedidos}
          onNavigateToCobro={(pedidoId) => {
            setPedidoIdParaCobro(pedidoId);
            setPaginaActiva('caja');
          }}
        />
      ) : paginaActiva === 'caja' && (session.rol === 'Administrador' || session.rol === 'Cajero') ? (
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
      ) : paginaActiva === 'ventas' && (session.rol === 'Administrador' || session.rol === 'Cajero') ? (
        <VentasPage
          session={session}
          onLogout={onLogout}
        />
      ) : paginaActiva === 'historial-cierres' ? (
        // RN-106: session.rol === 'Administrador' && (
        session.rol === 'Administrador' ? (
          <HistorialCierresPage
            session={session}
            onLogout={onLogout}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto text-sm">
              No tiene permiso para acceder al Historial de Cierres. Este módulo está reservado exclusivamente para el rol Administrador.
            </p>
            <button
              type="button"
              onClick={() =>
                setPaginaActiva(
                  session.rol === 'Cajero'
                    ? 'pedidos-llevar'
                    : session.rol === 'Mozo'
                    ? 'mesas'
                    : session.rol === 'Cocinero'
                    ? 'cocina'
                    : 'inicio'
                )
              }
              className="mt-6 px-4 py-2 bg-[#C74E00] text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-[#b84500] transition-colors cursor-pointer"
            >
              Ir al módulo principal
            </button>
          </div>
        )
      ) : paginaActiva === 'reportes' ? (
        session.rol === 'Administrador' ? (
          <ReportesPage
            session={session}
            onLogout={onLogout}
            onNavigateToCierres={() => setPaginaActiva('historial-cierres')}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-12 px-4 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto text-sm">
              No tiene permiso para acceder a Reportes. Este módulo está restringido exclusivamente para el rol Administrador.
            </p>
            <button
              type="button"
              onClick={() =>
                setPaginaActiva(
                  session.rol === 'Cajero'
                    ? 'pedidos-llevar'
                    : session.rol === 'Mozo'
                    ? 'mesas'
                    : session.rol === 'Cocinero'
                    ? 'cocina'
                    : 'inicio'
                )
              }
              className="mt-6 px-4 py-2 bg-[#C74E00] text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-[#b84500] transition-colors cursor-pointer"
            >
              Ir al módulo principal
            </button>
          </div>
        )
      ) : paginaActiva === 'cocina' && (session.rol === 'Administrador' || session.rol === 'Cocinero') ? (
        <CocinaPage
          session={session}
          onLogout={onLogout}
        />
      ) : (
        <DashboardPage
          session={session}
          onNavigate={handleDashboardNavigate}
        />
      )}

      {/* Vista 3.1: Modal de confirmación para cerrar sesión (MSG-40 / RV-31) */}
      <LogoutModal
        isOpen={mostrarModalLogout}
        onClose={() => setMostrarModalLogout(false)}
        onConfirm={handleConfirmLogout}
        loading={cerrandoLogout}
      />

      {/* Vista 3.1b: Modal de aviso de inactividad (MSG-42 / RV-32 / RN-20) */}
      <InactivityModal
        isOpen={mostrarModalInactividad}
        onContinue={handleContinuarSesion}
        onTimeout={handleTimeoutInactividad}
      />

      {/* Vista 3.2: Modal de cambio de contraseña propia (HU-09 / RF-07) */}
      <ChangePasswordModal
        isOpen={mostrarModalPassword}
        onClose={() => setMostrarModalPassword(false)}
        token={session.token}
        onSuccess={handlePasswordSuccess}
        onForceLogoutDueToFailedAttempts={handleForceLogoutDueToFailedAttempts}
      />

      {/* CUS09.3: Modal emergente de aviso de comanda lista (HU27 / RF-27 / RN-71 / RV-83) */}
      <AvisoComandaModal
        aviso={avisosPendientes.length > 0 ? avisosPendientes[0] : null}
        onCerrar={handleCerrarAviso}
        cargando={cerrandoAviso}
      />

      {/* Notificación flotante de confirmación (MSG-47 / RV-28 - 4 segundos) */}
      {toastMensaje && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toastMensaje}</span>
          <button
            type="button"
            onClick={() => setToastMensaje(null)}
            className="ml-3 text-neutral-500 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;

