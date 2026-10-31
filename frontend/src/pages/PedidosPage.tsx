import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DetallePedidoModal, AnularPedidoModal, PedidosKpiResumen, PedidosFilterBar, PedidosTable } from '../components/pedidos';
import { pedidoService } from '../services/pedidoService';
import { getMesasService } from '../services/mesaService';
import type { UserSession } from '../types/auth';
import type {
  PedidoItemDto,
  ResumenEstadosDto,
  DetallePedidoCompletoDto,
} from '../types/pedido';
import type { MesaItem } from '../types/mesa';
import { RotateCcw, Check } from 'lucide-react';
import { PageHeader, PageContainer } from '../components/layout';

interface PedidosPageProps {
  session: UserSession;
  onLogout: () => void;
  onNavigateToCobro?: (pedidoId: string) => void;
  filtroEstadoInicial?: string;
}

export const PedidosPage: React.FC<PedidosPageProps> = ({
  session,
  onLogout,
  onNavigateToCobro,
  filtroEstadoInicial = '',
}) => {
  // Estado de lista y contadores
  const [pedidos, setPedidos] = useState<PedidoItemDto[]>([]);
  const [resumen, setResumen] = useState<ResumenEstadosDto>({
    pendiente: 0,
    enPreparacion: 0,
    listo: 0,
    pagado: 0,
    anulado: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros combinables (RV-81)
  const [filtroEstado, setFiltroEstado] = useState<string>(filtroEstadoInicial);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroMesaId, setFiltroMesaId] = useState<string>('');
  const [filtroSoloMios, setFiltroSoloMios] = useState<boolean>(false);
  const [filtroFecha, setFiltroFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Catálogo de mesas para el selector
  const [mesas, setMesas] = useState<MesaItem[]>([]);

  // Temporizador de refresco (RNF-27: cada 15 segundos)
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerSegundosRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modales
  const [pedidoSeleccionadoDetalle, setPedidoSeleccionadoDetalle] = useState<DetallePedidoCompletoDto | null>(null);
  const [abrirModalDetalle, setAbrirModalDetalle] = useState(false);

  const [pedidoParaAnular, setPedidoParaAnular] = useState<PedidoItemDto | null>(null);
  const [abrirModalAnular, setAbrirModalAnular] = useState(false);
  const [guardandoAnulacion, setGuardandoAnulacion] = useState(false);

  // Notificaciones Toast (MSG-119, MSG-120 - 4 segundos)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Cargar catálogo de mesas
  useEffect(() => {
    getMesasService({ incluirInactivas: false }, session.token)
      .then((data: MesaItem[]) => setMesas(data.filter((m: MesaItem) => m.activa)))
      .catch((err: unknown) => console.warn('Error al cargar mesas:', err));
  }, [session.token]);

  // Consulta de pedidos (CUS09.1)
  const cargarPedidos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setErrorCarga(null);

    try {
      const res = await pedidoService.listarPedidos(
        {
          fecha: session.rol === 'Administrador' ? filtroFecha : undefined,
          estado: filtroEstado || undefined,
          tipo: filtroTipo || undefined,
          mesaId: filtroMesaId || undefined,
          soloMios: filtroSoloMios,
          pagina: 1,
          tamano: 100,
        },
        session.token
      );

      setPedidos(res.items);
      setResumen(res.resumen);
      setSegundosDesdeActualizacion(0);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      if (errorObj?.status === 401) {
        onLogout();
        return;
      }
      setErrorCarga(errorObj?.message || 'No se pudieron cargar los pedidos. Intente nuevamente.');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [session.token, session.rol, filtroFecha, filtroEstado, filtroTipo, filtroMesaId, filtroSoloMios, onLogout]);

  // Efecto para cargar al cambiar filtros
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Refresco automático cada 15 segundos (RNF-27) y contador de segundos
  useEffect(() => {
    timerSegundosRef.current = setInterval(() => {
      setSegundosDesdeActualizacion((prev) => prev + 1);
    }, 1000);

    intervalRef.current = setInterval(() => {
      cargarPedidos(true);
    }, 15000);

    return () => {
      if (timerSegundosRef.current) clearInterval(timerSegundosRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargarPedidos]);

  // Auto-cierre de Toast a los 4 segundos
  useEffect(() => {
    if (!toastMensaje) return;
    const t = setTimeout(() => setToastMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [toastMensaje]);

  // Abrir detalle de pedido
  const handleVerDetalle = async (pedidoId: string) => {
    try {
      const detalle = await pedidoService.obtenerDetalleCompleto(pedidoId, session.token);
      setPedidoSeleccionadoDetalle(detalle);
      setAbrirModalDetalle(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'Error al obtener el detalle del pedido.');
    }
  };

  // Abrir modal de anulación (CUS09.2)
  const handleAbrirAnular = (item: PedidoItemDto) => {
    setPedidoParaAnular(item);
    setAbrirModalAnular(true);
  };

  // Confirmar anulación (CUS09.2)
  const handleConfirmarAnular = async (pedidoId: string, motivo: string) => {
    setGuardandoAnulacion(true);
    try {
      const solicitudId = `anulacion-${pedidoId}-${Date.now()}`;
      await pedidoService.anularPedido(pedidoId, { solicitudId, motivo }, session.token);
      setToastMensaje('Pedido anulado correctamente.');
      setAbrirModalAnular(false);
      cargarPedidos(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'Error al anular el pedido.');
    } finally {
      setGuardandoAnulacion(false);
    }
  };

  const hayFiltrosActivos =
    Boolean(filtroEstado) ||
    Boolean(filtroTipo) ||
    Boolean(filtroMesaId) ||
    filtroSoloMios ||
    (session.rol === 'Administrador' && filtroFecha !== new Date().toISOString().split('T')[0]);

  const handleLimpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroTipo('');
    setFiltroMesaId('');
    setFiltroSoloMios(false);
    if (session.rol === 'Administrador') {
      setFiltroFecha(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <PageContainer>
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Pedidos"
          subtitle="Visualización y seguimiento del flujo de pedidos del servicio en salón y para llevar."
          badge={
            <span className="text-xs text-neutral-500 tabular-nums hidden sm:inline px-2.5 py-0.5 rounded-full bg-surface border border-neutral-200">
              Actualizado hace {segundosDesdeActualizacion} s
            </span>
          }
          actions={
            <button
              type="button"
              onClick={() => cargarPedidos()}
              disabled={cargando}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60 shrink-0"
              aria-label="Refrescar lista de pedidos"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          }
        />

        {/* Contenedor sin confinamiento artificial */}
        <div className="w-full">
          {/* Contadores por Estado (actúan como filtro al tocarlos) */}
          <PedidosKpiResumen
            resumen={resumen}
            filtroEstado={filtroEstado}
            onSelectEstado={setFiltroEstado}
          />

          {/* Barra de Filtros Combinables (RV-81) */}
          <PedidosFilterBar
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroMesaId={filtroMesaId}
            setFiltroMesaId={setFiltroMesaId}
            filtroSoloMios={filtroSoloMios}
            setFiltroSoloMios={setFiltroSoloMios}
            filtroFecha={filtroFecha}
            setFiltroFecha={setFiltroFecha}
            mesas={mesas}
            rolUsuario={session.rol}
            hayFiltrosActivos={hayFiltrosActivos}
            onLimpiarFiltros={handleLimpiarFiltros}
          />

          {/* Lista de Pedidos con DataTable */}
          <PedidosTable
            cargando={cargando}
            errorCarga={errorCarga}
            onRecargar={() => cargarPedidos()}
            pedidos={pedidos}
            hayFiltrosActivos={hayFiltrosActivos}
            onLimpiarFiltros={handleLimpiarFiltros}
            rolUsuario={session.rol}
            onVerDetalle={handleVerDetalle}
            onNavigateToCobro={onNavigateToCobro}
            onAbrirAnular={handleAbrirAnular}
          />

          {/* Modal de Detalle (Vista 9.2) */}
          <DetallePedidoModal
            pedido={pedidoSeleccionadoDetalle}
            isOpen={abrirModalDetalle}
            onClose={() => setAbrirModalDetalle(false)}
            onAbrirAnular={(id) => {
              const item = pedidos.find((p) => p.id === id);
              if (item) handleAbrirAnular(item);
            }}
            puedeAnular={pedidoSeleccionadoDetalle ? pedidos.find(p => p.id === pedidoSeleccionadoDetalle.id)?.puedeAnular : false}
            motivoDeshabilitado={pedidoSeleccionadoDetalle ? pedidos.find(p => p.id === pedidoSeleccionadoDetalle.id)?.motivoDeshabilitado : null}
          />

          {/* Modal de Anulación (Vista 9.4) */}
          <AnularPedidoModal
            pedido={pedidoParaAnular}
            isOpen={abrirModalAnular}
            onClose={() => setAbrirModalAnular(false)}
            onConfirmAnular={handleConfirmarAnular}
            loading={guardandoAnulacion}
          />

          {/* Toast Notificación (MSG-119 / MSG-120) */}
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
        </div>
      </PageContainer>
    </div>
  );
};

export default PedidosPage;
