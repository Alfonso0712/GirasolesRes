import React, { useState } from 'react';
import {
  Plus,
  RotateCcw,
  AlertCircle,
  Check,
  ShoppingBag
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { MesaItem } from '../types/mesa';
import { useMesasManagement } from '../hooks/useMesasManagement';
import { menuDiaService } from '../services/menuDiaService';
import { pedidoService } from '../services/pedidoService';
import {
  MesaFormModal,
  MesaConfirmModal,
  SelectorPedidoModal,
  MesaFilterBar,
  MesaGrid,
  MesaOcupadaModal,
  MesaAccionRolModal
} from '../components/mesas';
import type { PedidoAbiertoMesaDto } from '../types/pedido';
import { PageHeader, PageContainer } from '../components/layout';

interface MesasPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onNavigateToPedido?: (mesaId: string, modo?: 'nuevo' | 'ampliacion', pedidoId?: string) => void;
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
  const [pedidosSelector, setPedidosSelector] = useState<{ mesa: MesaItem; pedidos: PedidoAbiertoMesaDto[] } | null>(null);

  const iniciarAgregarProductos = async (mesa: MesaItem) => {
    try {
      const pedidos = await pedidoService.obtenerPedidosActivosPorMesa(mesa.id, session.token);
      if (!pedidos || pedidos.length === 0) {
        onNavigateToPedido?.(mesa.id, 'nuevo');
      } else if (pedidos.length === 1) {
        onNavigateToPedido?.(mesa.id, 'ampliacion', pedidos[0].id);
      } else {
        setPedidosSelector({ mesa, pedidos });
      }
    } catch {
      onNavigateToPedido?.(mesa.id, 'ampliacion');
    }
  };

  const handleAccionRol = async (mesa: MesaItem, accion: string) => {
    if (accion === 'REGISTRAR PEDIDO') {
      if (onNavigateToPedido) {
        onNavigateToPedido(mesa.id, 'nuevo');
        return;
      }
    }
    if (accion === 'AGREGAR PRODUCTOS') {
      await iniciarAgregarProductos(mesa);
      return;
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
        <MesaFilterBar
          filtroEstado={filtroEstado}
          onFiltroEstadoChange={setFiltroEstado}
          esAdmin={esAdmin}
          mostrarInactivas={mostrarInactivas}
          onMostrarInactivasChange={setMostrarInactivas}
        />

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
        <MesaGrid
          cargando={cargando}
          errorCarga={errorCarga}
          mesas={mesas}
          todasLasMesas={todasLasMesas}
          mesaResaltadaId={mesaResaltadaId}
          esAdmin={esAdmin}
          esMozo={esMozo}
          esCajero={esCajero}
          onReintentar={() => cargarMesas(false)}
          onAbrirCrear={handleAbrirCrear}
          onLimpiarFiltro={() => setFiltroEstado('todas')}
          onEditar={handleAbrirEditar}
          onCambiarEstado={handleAbrirConfirmacionEstado}
          onAccionRol={handleAccionRol}
        />

        {/* Modal CUS06.1 / CUS06.3: Registrar / Editar Mesa */}
        <MesaFormModal
          isOpen={formModalOpen}
          onClose={handleCerrarForm}
          mesaAEditar={mesaAEditar}
          todasLasMesas={todasLasMesas}
          onSave={handleGuardarMesa}
        />

        {/* Modal MSG-95: Diálogo al elegir una mesa ocupada */}
        <MesaOcupadaModal
          isOpen={!!modalMesaOcupada}
          mesa={modalMesaOcupada?.mesa || null}
          cantidadPedidos={modalMesaOcupada?.cantidadPedidos || 1}
          onPedidoNuevo={(mesaId) => {
            setModalMesaOcupada(null);
            onNavigateToPedido?.(mesaId, 'nuevo');
          }}
          onAgregarProductos={async (m) => {
            setModalMesaOcupada(null);
            await iniciarAgregarProductos(m);
          }}
          onClose={() => setModalMesaOcupada(null)}
        />

        {/* Modal Selector de Pedido para Mesa con Múltiples Pedidos Abiertos */}
        {pedidosSelector && (
          <SelectorPedidoModal
            isOpen={!!pedidosSelector}
            mesaNombre={pedidosSelector.mesa.nombre}
            pedidos={pedidosSelector.pedidos}
            onSeleccionarPedido={(pedidoId) => {
              const mesaId = pedidosSelector.mesa.id;
              setPedidosSelector(null);
              onNavigateToPedido?.(mesaId, 'ampliacion', pedidoId);
            }}
            onClose={() => setPedidosSelector(null)}
          />
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
        <MesaAccionRolModal
          isOpen={modalAccionRol.abierto}
          mesa={modalAccionRol.mesa}
          accion={modalAccionRol.accion}
          onClose={() => setModalAccionRol({ abierto: false, mesa: null, accion: '' })}
        />

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
