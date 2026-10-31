import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { MesaItem } from '../types/mesa';
import { useMesasManagement } from '../hooks/useMesasManagement';
import { menuDiaService } from '../services/menuDiaService';
import { pedidoService } from '../services/pedidoService';
import {
  MesaFilterBar,
  MesaGrid,
  MenuDiaAlertaBanner,
  MesasPageModals,
  MesasHeaderActions,
  MesasToastAvisos
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
            <MesasHeaderActions
              segundosTranscurridos={segundosTranscurridos}
              refrescando={refrescando}
              onActualizar={() => cargarMesas(false)}
              esCajero={esCajero}
              onNavigateToPedidoLlevar={onNavigateToPedidoLlevar}
              esAdmin={esAdmin}
              onAbrirCrear={handleAbrirCrear}
            />
          }
        />

        {/* Banner preventivo: Menú del día no definido aún (MSG-204 / Nielsen 5) */}
        <MenuDiaAlertaBanner
          menuDefinido={menuDefinido}
          esAdmin={esAdmin}
          onNavigateToMenuDia={onNavigateToMenuDia}
        />

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

        {/* Modales del Salón de Mesas */}
        <MesasPageModals
          formModalOpen={formModalOpen}
          onCerrarForm={handleCerrarForm}
          mesaAEditar={mesaAEditar}
          todasLasMesas={todasLasMesas}
          onGuardarMesa={handleGuardarMesa}
          modalMesaOcupada={modalMesaOcupada}
          onPedidoNuevo={(mesaId) => {
            setModalMesaOcupada(null);
            onNavigateToPedido?.(mesaId, 'nuevo');
          }}
          onAgregarProductos={async (m) => {
            setModalMesaOcupada(null);
            await iniciarAgregarProductos(m);
          }}
          onCerrarMesaOcupada={() => setModalMesaOcupada(null)}
          pedidosSelector={pedidosSelector}
          onSeleccionarPedido={(pedidoId) => {
            const mesaId = pedidosSelector?.mesa.id;
            setPedidosSelector(null);
            if (mesaId) {
              onNavigateToPedido?.(mesaId, 'ampliacion', pedidoId);
            }
          }}
          onCerrarSelectorPedido={() => setPedidosSelector(null)}
          confirmModalOpen={confirmModalOpen}
          onCerrarConfirm={handleCerrarConfirm}
          onConfirmarCambioEstado={handleConfirmarCambioEstado}
          mesaAConfirmar={mesaAConfirmar}
          confirmAccion={confirmAccion}
          procesandoConfirm={procesandoConfirm}
          modalAccionRol={modalAccionRol}
          onCerrarModalAccionRol={() => setModalAccionRol({ abierto: false, mesa: null, accion: '' })}
        />

        {/* Avisos Toast Flotantes */}
        <MesasToastAvisos
          avisoExito={avisoExito}
          avisoError={avisoError}
          onCerrarError={() => setAvisoError(null)}
        />
      </PageContainer>
    </div>
  );
};
