import React, { useState } from 'react';
import {
  Plus,
  RotateCcw,
  Utensils,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Check,
  ShoppingBag
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { MesaItem, FiltroEstadoMesa } from '../types/mesa';
import { useMesasManagement } from '../hooks/useMesasManagement';
import { menuDiaService } from '../services/menuDiaService';
import { pedidoService } from '../services/pedidoService';
import { MesaCard } from '../components/mesas';
import { MesaFormModal } from '../components/mesas';
import { MesaConfirmModal } from '../components/mesas';
import { PageHeader, PageContainer } from '../components/layout';

interface MesasPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onNavigateToPedido?: (mesaId: string, modo?: 'nuevo' | 'ampliacion') => void;
  onNavigateToCobro?: (mesa: { id: string; nombre: string }) => void;
  onNavigateToPedidoLlevar?: () => void;
  onNavigateToMenuDia?: () => void;
}

export const MesasPage: React.FC<MesasPageProps> = ({
  session,
  onLogout,
  onNavigateToPedido,
  onNavigateToCobro,
  onNavigateToPedidoLlevar,
  onNavigateToMenuDia
}) => {
  const {
    mesas,
    todasLasMesas,
    resumen,
    filtroEstado,
    setFiltroEstado,
    mostrarInactivas,
    setMostrarInactivas,
    cargando,
    refrescando,
    errorCarga,
    segundosTranscurridos,
    avisoExito,
    avisoError,
    mesaResaltadaId,
    setAvisoError,
    cargarMesas,
    esAdmin,
    esMozo,
    esCajero,
    formModalOpen,
    mesaAEditar,
    handleAbrirCrear,
    handleAbrirEditar,
    handleCerrarForm,
    handleGuardarMesa,
    confirmModalOpen,
    confirmAccion,
    mesaAConfirmar,
    procesandoConfirm,
    handleAbrirConfirmacionEstado,
    handleCerrarConfirm,
    handleConfirmarCambioEstado
  } = useMesasManagement({ session, onLogout });

  // Estado para modal/aviso de acción contextual de rol (CUS07 y CUS11)
  const [modalAccionRol, setModalAccionRol] = useState<{
    abierto: boolean;
    mesa: MesaItem | null;
    accion: string;
  }>({ abierto: false, mesa: null, accion: '' });

  // Estado del menú del día de hoy (MSG-204)
  const [menuDefinido, setMenuDefinido] = useState<boolean>(true);

  React.useEffect(() => {
    let activo = true;
    menuDiaService
      .obtenerMenuHoy(session.token)
      .then((res) => {
        if (activo) {
          setMenuDefinido(res.definido);
        }
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [session.token]);

  const [modalMesaOcupada, setModalMesaOcupada] = useState<{ mesa: MesaItem; cantidadPedidos: number } | null>(null);

  const handleAccionRol = async (mesa: MesaItem, accion: string) => {
    if (accion === 'REGISTRAR PEDIDO') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id, 'nuevo');
        return;
      }
    }
    if (accion === 'AGREGAR PRODUCTOS') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id, 'ampliacion');
        return;
      }
    }
    if (accion === 'OPCIONES_MESA_OCUPADA') {
      try {
        const pedidos = await pedidoService.obtenerPedidosActivosPorMesa(mesa.id, session.token);
        const count = pedidos && pedidos.length > 0 ? pedidos.length : 1;
        setModalMesaOcupada({ mesa, cantidadPedidos: count });
      } catch {
        setModalMesaOcupada({ mesa, cantidadPedidos: 1 });
      }
      return;
    }
    if (accion === 'COBRAR') {
      if (onNavigateToCobro) {
        onNavigateToCobro({ id: mesa.id, nombre: mesa.nombre });
        return;
      }
    }
    setModalAccionRol({
      abierto: true,
      mesa,
      accion
    });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer>
      {/* 1. Encabezado Unificado */}
      <PageHeader
        title="Mesas"
        subtitle="Supervise la disponibilidad del salón y asigne mesas en tiempo real."
        badge={
          <div className="px-3.5 py-1 bg-amber-50/80 rounded-full border border-amber-200/80 text-xs font-semibold text-ink flex items-center gap-2 shadow-2xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Libres {resumen.libres}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-accent">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Ocupadas {resumen.ocupadas}
            </span>
            {esAdmin && mostrarInactivas && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500">Inactivas {resumen.inactivas}</span>
              </>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="hidden sm:inline tabular-nums">
                Actualizado hace <span className="font-semibold text-neutral-700">{segundosTranscurridos}</span> s
              </span>
              <button
                type="button"
                onClick={() => cargarMesas(false)}
                disabled={refrescando}
                title="Actualizar mesas ahora"
                aria-label="Actualizar mesas ahora"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-accent ${refrescando ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {esCajero && onNavigateToPedidoLlevar && (
              <button
                type="button"
                onClick={onNavigateToPedidoLlevar}
                className="px-3.5 py-2 rounded-xl bg-surface border border-accent text-accent hover:bg-orange-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
              >
                <ShoppingBag className="w-4 h-4 text-accent" />
                <span>Pedido para llevar</span>
              </button>
            )}

            {esAdmin && (
              <button
                type="button"
                onClick={handleAbrirCrear}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-2xs hover:shadow transition-all cursor-pointer min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva mesa</span>
              </button>
            )}
          </div>
        }
      />

      {/* Banner preventivo: Menú del día no definido aún (MSG-204 / Nielsen 5) */}
      {!menuDefinido && (
        <div className="shrink-0 p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-accent flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                El menú de hoy aún no está definido
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                {esAdmin
                  ? 'Defina el menú diario para que el personal pueda registrar comandas de salón y para llevar.'
                  : 'Solicite a la administración que publique el menú de hoy para comenzar a tomar pedidos.'}
              </p>
            </div>
          </div>
          {esAdmin && onNavigateToMenuDia && (
            <button
              type="button"
              onClick={onNavigateToMenuDia}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              Definir Menú
            </button>
          )}
        </div>
      )}

      {/* 2. Barra de Filtros Fija (shrink-0) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Estado:
          </span>

          {(['todas', 'libre', 'ocupada'] as FiltroEstadoMesa[]).map((estado) => {
            const activo = filtroEstado === estado;
            const labels: Record<FiltroEstadoMesa, string> = {
              todas: 'Todas',
              libre: 'Libres',
              ocupada: 'Ocupadas'
            };
            return (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                  activo
                    ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                    : 'text-ink-muted hover:bg-neutral-100 hover:text-ink'
                }`}
              >
                {labels[estado]}
              </button>
            );
          })}
        </div>

        {/* Interruptor "Mostrar inactivas" (Solo Administrador, RF-18) */}
        {esAdmin && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-ink font-medium">
            <input
              type="checkbox"
              checked={mostrarInactivas}
              onChange={(e) => setMostrarInactivas(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                mostrarInactivas ? 'bg-primary' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`bg-surface w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  mostrarInactivas ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
            <span className="flex items-center gap-1 text-ink-muted">
              {mostrarInactivas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
              Mostrar inactivas
            </span>
          </label>
        )}
      </div>

      {/* Banner de Aviso de Error de Conexión si ya había datos (MSG-94) */}
      {errorCarga && mesas.length > 0 && (
        <div className="shrink-0 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Sin conexión, mostrando datos de hace {segundosTranscurridos} s.</span>
          </div>
          <button
            type="button"
            onClick={() => cargarMesas(false)}
            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 3. Contenedor Principal de Cuadrícula */}
      <div className="w-full bg-surface rounded-2xl border border-neutral-200/80 p-3.5 sm:p-4 lg:p-5 flex flex-col shadow-2xs">
        <div className="w-full">
          {/* Estado de Carga Inicial (Skeletons) */}
          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200/60 p-4 min-h-[140px] flex flex-col justify-between animate-pulse bg-neutral-50/70"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="w-16 h-5 bg-neutral-200 rounded-md" />
                    <div className="w-20 h-6 bg-neutral-200 rounded-lg" />
                  </div>
                  <div className="w-full h-8 bg-neutral-200/80 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : errorCarga && mesas.length === 0 ? (
            /* Estado de Error Total sin datos (MSG-94) */
            <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-danger flex items-center justify-center mb-4 border border-rose-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-sans font-bold text-lg text-ink mb-1">
                No se pudieron cargar las mesas
              </h3>
              <p className="text-xs text-ink-muted max-w-sm mb-4">
                Intente nuevamente para sincronizar el estado del salón con el servidor.
              </p>
              <button
                type="button"
                onClick={() => cargarMesas(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
            </div>
          ) : todasLasMesas.length === 0 ? (
            /* Estado: Sin mesas registradas (MSG-91 / MSG-92) */
            <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mb-4 border border-amber-200">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-lg text-ink mb-1">
                No hay mesas registradas
              </h3>
              <p className="text-xs text-ink-muted max-w-sm mb-4">
                {esAdmin
                  ? 'Use "Nueva mesa" para registrar la primera mesa del salón.'
                  : 'Pida a la administradora que registre las mesas del local.'}
              </p>
              {esAdmin && (
                <button
                  type="button"
                  onClick={handleAbrirCrear}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva mesa</span>
                </button>
              )}
            </div>
          ) : mesas.length === 0 ? (
            /* Estado: Sin resultados con el filtro (MSG-93) */
            <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mb-3 border border-neutral-200">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-base text-ink mb-1">
                No hay mesas con ese estado
              </h3>
              <p className="text-xs text-ink-muted max-w-sm mb-4">
                Cambie el filtro para visualizar otras mesas disponibles en el salón.
              </p>
              <button
                type="button"
                onClick={() => setFiltroEstado('todas')}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Ver todas las mesas
              </button>
            </div>
          ) : (
            /* Cuadrícula de Tarjetas de Mesas en orden natural (RNF-18 / CUS06.2) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
              {mesas.map((mesa) => (
                <MesaCard
                  key={mesa.id}
                  mesa={mesa}
                  esAdmin={esAdmin}
                  esMozo={esMozo}
                  esCajero={esCajero}
                  isHighlighted={mesaResaltadaId === mesa.id}
                  onEditar={handleAbrirEditar}
                  onCambiarEstado={handleAbrirConfirmacionEstado}
                  onAccionRol={handleAccionRol}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal CUS06.1 / CUS06.3: Registrar / Editar Mesa */}
      <MesaFormModal
        isOpen={formModalOpen}
        onClose={handleCerrarForm}
        mesaAEditar={mesaAEditar}
        todasLasMesas={todasLasMesas}
        onSave={handleGuardarMesa}
      />

      {/* Modal MSG-95: Diálogo al elegir una mesa ocupada */}
      {modalMesaOcupada && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-ink mb-2">
              Mesa Ocupada
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
              La <strong>{modalMesaOcupada.mesa.nombre}</strong> ya tiene <strong>{modalMesaOcupada.cantidadPedidos}</strong> pedido(s) abierto(s). ¿Registrar un pedido nuevo o agregar productos a uno existente?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const mesaId = modalMesaOcupada.mesa.id;
                  setModalMesaOcupada(null);
                  onNavigateToPedido?.(mesaId, 'nuevo');
                }}
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                PEDIDO NUEVO
              </button>
              <button
                type="button"
                onClick={() => {
                  const mesaId = modalMesaOcupada.mesa.id;
                  setModalMesaOcupada(null);
                  onNavigateToPedido?.(mesaId, 'ampliacion');
                }}
                className="flex-1 py-2.5 px-4 bg-surface border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                AGREGAR PRODUCTOS
              </button>
            </div>
            <button
              type="button"
              onClick={() => setModalMesaOcupada(null)}
              className="mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal CUS06.3 / Vista 6.4: Activar o Desactivar Mesa */}
      <MesaConfirmModal
        isOpen={confirmModalOpen}
        onClose={handleCerrarConfirm}
        onConfirm={handleConfirmarCambioEstado}
        mesa={mesaAConfirmar}
        accion={confirmAccion}
        loading={procesandoConfirm}
      />

      {/* Modal Informativo de Flujo Alterno para Acciones de Mozo / Cajero (CUS07 y CUS11) */}
      {modalAccionRol.abierto && modalAccionRol.mesa && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-surface rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-ink mb-1">
              {modalAccionRol.accion}
            </h3>
            <p className="text-xs text-ink-muted mb-4">
              Acción seleccionada para <strong>{modalAccionRol.mesa.nombre}</strong> ({modalAccionRol.mesa.ocupacion}).
              Este enlace conectará con la interfaz de {modalAccionRol.accion === 'COBRAR' ? 'Cobro en Caja' : 'Toma de Pedido'}.
            </p>
            <button
              type="button"
              onClick={() => setModalAccionRol({ abierto: false, mesa: null, accion: '' })}
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Aviso Flotante Toast de Éxito (4 segundos) */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoExito}</span>
        </div>
      )}

      {/* Aviso Flotante Toast de Error */}
      {avisoError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 bg-rose-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoError}</span>
          <button
            type="button"
            onClick={() => setAvisoError(null)}
            className="ml-2 text-rose-300 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}
      </PageContainer>
    </div>
  );
};

