import React from 'react';
import { useInicioDashboard } from '../hooks/useInicioDashboard';
import type { UserSession } from '../types/auth';
import type {
  BloqueVentasHoy,
  BloquePlatosHoy,
  BloquePedidosPorEstado,
  BloqueMesas,
  BloqueCajaAdmin,
  BloqueMenuAdmin,
  BloqueUltimoCierre,
  AlertaInicio,
  BloqueCajaCajero,
  BloquePorCobrar,
  BloqueListos,
  BloqueSimpleCantidad,
  BloqueComandasCocinero,
  BloqueAgotadosCocinero
} from '../types/inicio';
import {
  RefreshCw, RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Utensils,
  UtensilsCrossed,
  DollarSign,
  ClipboardList,
  ShoppingBag,
  Receipt,
  ReceiptText,
  Users,
  WifiOff,
  ChefHat,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
  session: UserSession;
  onNavigate: (pagina: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ session, onNavigate }) => {
  const {
    data,
    cargandoInicial,
    actualizando,
    errorGeneral,
    segundosDesdeActualizacion,
    sinConexion,
    reintentandoBloque,
    refrescarManual,
    reintentarBloque
  } = useInicioDashboard({ token: session.token, rol: session.rol });

  if (cargandoInicial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D35400] mb-4 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-xl font-bold font-sans text-neutral-800 mb-1">
          Cargando panel de inicio...
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          Sincronizando los indicadores y operaciones del restaurante en tiempo real.
        </p>
      </div>
    );
  }

  if (errorGeneral && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-sans text-neutral-800 mb-2">
          No se pudo cargar el panel
        </h2>
        <p className="text-sm text-neutral-600 max-w-md mb-6">
          {errorGeneral}
        </p>
        <button
          type="button"
          onClick={() => refrescarManual()}
          className="px-5 py-2.5 bg-[#D35400] text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-[#b84500] transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  const bloques = data?.bloques || {};

  // Helper para renderizar error específico por bloque (RV-149, RNF-55)
  const renderBloqueError = (nombreBloque: string) => (
    <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-center">
      <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
      <p className="text-xs font-semibold text-rose-800 mb-1">
        No se pudo cargar este bloque
      </p>
      <p className="text-[11px] text-rose-600 mb-3">
        Intente nuevamente sin afectar el resto del panel.
      </p>
      <button
        type="button"
        onClick={() => reintentarBloque(nombreBloque)}
        disabled={reintentandoBloque[nombreBloque]}
        className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
      >
        <RefreshCw className={`w-3 h-3 ${reintentandoBloque[nombreBloque] ? 'animate-spin' : ''}`} />
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3">
      {/* Encabezado Editorial */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Bienvenido/a, {session.nombre}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              {session.rol}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Resumen operativo y métricas principales según su rol de trabajo.
          </p>
        </div>

        {/* Indicador discreto de actualización y botón manual */}
        <div className="flex items-center gap-2 shrink-0">
          {sinConexion ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              Sin conexión, datos de hace {segundosDesdeActualizacion} s
            </span>
          ) : actualizando ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D35400]" />
              Actualizando...
            </span>
          ) : (
            <span className="text-xs text-neutral-500 font-medium tabular-nums hidden sm:inline">
              Actualizado hace <span className="font-semibold text-neutral-700">{segundosDesdeActualizacion}</span> s
            </span>
          )}

          <button
            type="button"
            onClick={() => refrescarManual()}
            disabled={actualizando}
            aria-label="Actualizar datos del panel"
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#D35400] ${actualizando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL SEGÚN ROL */}
      {session.rol === 'Administrador' && renderAdminDashboard(bloques, onNavigate, renderBloqueError)}
      {session.rol === 'Cajero' && renderCajeroDashboard(bloques, onNavigate, renderBloqueError)}
      {session.rol === 'Mozo' && renderMozoDashboard(bloques, onNavigate, renderBloqueError)}
      {session.rol === 'Cocinero' && renderCocineroDashboard(bloques, onNavigate, renderBloqueError)}
      </div>
    </div>
  );
};

// =========================================================================
// 1. VISTA 15.1: PANEL DEL ADMINISTRADOR
// =========================================================================
function renderAdminDashboard(
  bloques: Record<string, any>,
  onNavigate: (pagina: string, params?: any) => void,
  renderBloqueError: (nombre: string) => React.ReactNode
) {
  const alertasRes = bloques.alertas;
  const ventasHoyRes = bloques.ventasHoy;
  const platosHoyRes = bloques.platosHoy;
  const pedidosRes = bloques.pedidosPorEstado;
  const mesasRes = bloques.mesas;
  const cajaRes = bloques.caja;
  const menuRes = bloques.menu;
  const ultimoCierreRes = bloques.ultimoCierre;

  const alertas: AlertaInicio[] = alertasRes?.estado === 'ok' ? (alertasRes.datos || []) : [];
  const ventasHoy: BloqueVentasHoy | null = ventasHoyRes?.estado === 'ok' ? ventasHoyRes.datos : null;
  const platosHoy: BloquePlatosHoy | null = platosHoyRes?.estado === 'ok' ? platosHoyRes.datos : null;
  const pedidos: BloquePedidosPorEstado | null = pedidosRes?.estado === 'ok' ? pedidosRes.datos : null;
  const mesas: BloqueMesas | null = mesasRes?.estado === 'ok' ? mesasRes.datos : null;
  const caja: BloqueCajaAdmin | null = cajaRes?.estado === 'ok' ? cajaRes.datos : null;
  const menu: BloqueMenuAdmin | null = menuRes?.estado === 'ok' ? menuRes.datos : null;
  const ultimoCierre: BloqueUltimoCierre | null = ultimoCierreRes?.estado === 'ok' ? ultimoCierreRes.datos : null;

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE ALERTAS (RV-147, RN-128) */}
      <div>
        {alertasRes?.estado === 'error' ? (
          renderBloqueError('alertas')
        ) : alertas.length > 0 ? (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Alertas de Atención Inmediata ({alertas.length})
            </h2>
            <div className="space-y-2">
              {alertas.map((alerta, idx) => {
                const esCaja = alerta.tipo === 'caja_anterior';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                      esCaja
                        ? 'bg-rose-50/90 border-rose-300 text-rose-900'
                        : alerta.tipo === 'comandas_demora'
                        ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                        : 'bg-orange-50/70 border-orange-200 text-orange-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        esCaja ? 'bg-rose-200/80 text-rose-700' : 'bg-amber-200/80 text-amber-700'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{alerta.texto}</p>
                        <p className="text-[11px] opacity-75 mt-0.5">
                          Prioridad {alerta.prioridad} · Requiere gestión del administrador
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(alerta.enlace)}
                      className={`self-end sm:self-auto px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 shrink-0 ${
                        esCaja
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-[#D35400] hover:bg-[#b84500] text-white'
                      }`}
                    >
                      <span>Resolver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Todo en orden:</span> no hay alertas por atender en este momento.
            </div>
          </div>
        )}
      </div>

      {/* ACCESOS RÁPIDOS EN MÓVIL (RV-153: en móvil van primero) */}
      <div className="block lg:hidden">
        {renderAdminQuickActions(onNavigate)}
      </div>

      {/* 2. CUATRO TARJETAS GRANDES DE RESUMEN (RV-145, RV-146, RV-150) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1: Ventas de Hoy */}
        {ventasHoyRes?.estado === 'error' ? (
          renderBloqueError('ventasHoy')
        ) : (
          <div
            onClick={() => onNavigate('reportes')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-[#D35400] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Ventas de Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D35400] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                S/ {(ventasHoy?.total ?? 0).toFixed(2)}
              </div>
              {ventasHoy?.nVentas === 0 ? (
                <p className="text-xs text-neutral-500 italic mt-1">
                  Todavía no hay ventas registradas hoy.
                </p>
              ) : (
                <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
                  <div className="flex justify-between">
                    <span>Efectivo:</span>
                    <span className="font-semibold tabular-nums">S/ {(ventasHoy?.efectivo ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yape / Digital:</span>
                    <span className="font-semibold tabular-nums">S/ {(ventasHoy?.yape ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-100 text-[11px] text-neutral-500">
                    <span>Total ventas:</span>
                    <span className="font-medium">{ventasHoy?.nVentas ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver reporte de hoy</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Tarjeta 2: Platos Vendidos */}
        {platosHoyRes?.estado === 'error' ? (
          renderBloqueError('platosHoy')
        ) : (
          <div
            onClick={() => onNavigate('reportes')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-[#D35400] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Platos Vendidos Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#D35400] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {platosHoy?.total ?? 0} <span className="text-sm font-normal text-neutral-500">unidades</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                {platosHoy?.principales && platosHoy.principales.length > 0
                  ? `Plato líder: ${platosHoy.principales[0].producto} (${platosHoy.principales[0].cantidad})`
                  : 'Sin platos servidos aún hoy.'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver detalle de platos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Tarjeta 3: Pedidos por Estado */}
        {pedidosRes?.estado === 'error' ? (
          renderBloqueError('pedidosPorEstado')
        ) : (
          <div
            onClick={() => onNavigate('pedidos')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-[#D35400] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pedidos de Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {(pedidos?.pendiente ?? 0) + (pedidos?.enPreparacion ?? 0) + (pedidos?.listo ?? 0) + (pedidos?.pagado ?? 0)} <span className="text-sm font-normal text-neutral-500">total</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
                <div className="flex justify-between">
                  <span>En curso / Cocina:</span>
                  <span className="font-semibold tabular-nums text-amber-700">
                    {(pedidos?.pendiente ?? 0) + (pedidos?.enPreparacion ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Listos / Por cobrar:</span>
                  <span className="font-semibold tabular-nums text-blue-700">
                    {pedidos?.porCobrar ?? 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Gestionar pedidos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Tarjeta 4: Mesas del Salón */}
        {mesasRes?.estado === 'error' ? (
          renderBloqueError('mesas')
        ) : (
          <div
            onClick={() => onNavigate('mesas')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-[#D35400] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mesas y Salón
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Utensils className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {mesas?.libres ?? 0} <span className="text-sm font-normal text-emerald-700">libres</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
                <div className="flex justify-between">
                  <span>Mesas ocupadas:</span>
                  <span className="font-semibold tabular-nums text-rose-700">{mesas?.ocupadas ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacidad total:</span>
                  <span className="font-semibold tabular-nums">{(mesas?.libres ?? 0) + (mesas?.ocupadas ?? 0)}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver salón de mesas</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>

      {/* 3. BLOQUES DE DETALLE (TOP 5 PLATOS, PEDIDOS POR ESTADO, CAJA Y MENÚ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Top 5 Platos Vendidos */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D35400]" />
                Top 5 Platos más Vendidos
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('reportes')}
                className="text-xs text-[#D35400] hover:underline font-semibold cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {platosHoyRes?.estado === 'error' ? (
              renderBloqueError('platosHoy')
            ) : platosHoy?.principales && platosHoy.principales.length > 0 ? (
              <div className="space-y-2.5">
                {platosHoy.principales.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-neutral-300 text-neutral-800' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-800 break-words line-clamp-2" title={p.producto}>
                        {p.producto}
                      </span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-neutral-700 bg-white px-2 py-0.5 rounded-md border border-neutral-200/80 shrink-0">
                      {p.cantidad} und.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-400 text-xs">
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No hay platos registrados en ventas hoy.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 text-center">
            <span className="text-xs text-neutral-500">
              Total platos despachados hoy: <strong className="text-neutral-800 tabular-nums">{platosHoy?.total ?? 0}</strong>
            </span>
          </div>
        </div>

        {/* Columna 2: Pedidos por Estado */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Pedidos de Hoy por Estado
              </h3>
              <span className="text-xs text-neutral-500 font-medium">Toque para filtrar</span>
            </div>

            {pedidosRes?.estado === 'error' ? (
              renderBloqueError('pedidosPorEstado')
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Pendiente */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'pendiente' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">Pendientes</span>
                  <span className="text-lg font-bold tabular-nums text-neutral-800 group-hover:text-amber-700">
                    {pedidos?.pendiente ?? 0}
                  </span>
                </button>

                {/* En Preparación */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'enPreparacion' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">En Preparación</span>
                  <span className="text-lg font-bold tabular-nums text-orange-700">
                    {pedidos?.enPreparacion ?? 0}
                  </span>
                </button>

                {/* Listo */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'listo' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">Listos</span>
                  <span className="text-lg font-bold tabular-nums text-emerald-700">
                    {pedidos?.listo ?? 0}
                  </span>
                </button>

                {/* Por Cobrar */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'porCobrar' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">Por Cobrar</span>
                  <span className="text-lg font-bold tabular-nums text-blue-700">
                    {pedidos?.porCobrar ?? 0}
                  </span>
                </button>

                {/* Pagado */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'pagado' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">Pagados</span>
                  <span className="text-lg font-bold tabular-nums text-neutral-700">
                    {pedidos?.pagado ?? 0}
                  </span>
                </button>

                {/* Anulado */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'anulado' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] font-medium text-neutral-500 block">Anulados</span>
                  <span className="text-lg font-bold tabular-nums text-rose-700">
                    {pedidos?.anulado ?? 0}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Gestión completa en Pedidos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D35400]" />
          </div>
        </div>

        {/* Columna 3: Estado de Caja, Menú y Último Cierre */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Tarjeta Caja */}
          {cajaRes?.estado === 'error' ? (
            renderBloqueError('caja')
          ) : (
            <div
              onClick={() => onNavigate('caja')}
              className="p-4 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Estado de Caja
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  caja?.estado === 'Abierta'
                    ? 'bg-emerald-100 text-emerald-800'
                    : caja?.estado === 'Anterior sin cerrar'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {caja?.estado ?? 'Desconocido'}
                </span>
              </div>
              {caja?.estado === 'Abierta' ? (
                <div className="text-xs text-neutral-600">
                  <p>Abierta por: <strong className="text-neutral-800">{caja.usuario ?? 'Cajero'}</strong> ({caja.desde})</p>
                  <p className="mt-0.5">Efectivo esperado: <strong className="text-emerald-700 tabular-nums">S/ {(caja.efectivoEsperado ?? 0).toFixed(2)}</strong></p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  {caja?.estado === 'Anterior sin cerrar'
                    ? 'Caja pendiente de arqueo del día anterior.'
                    : 'Aún no se ha registrado apertura de caja hoy.'}
                </p>
              )}
            </div>
          )}

          {/* Tarjeta Menú del Día */}
          {menuRes?.estado === 'error' ? (
            renderBloqueError('menu')
          ) : (
            <div
              onClick={() => onNavigate('menu-dia')}
              className="p-4 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Menú de Hoy
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  menu?.definido ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {menu?.definido ? 'Definido' : 'Sin definir'}
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                {menu?.definido
                  ? `${menu.platos} platos disponibles · ${menu.agotados} agotados`
                  : 'El menú no ha sido publicado aún para el servicio de hoy.'}
              </p>
            </div>
          )}

          {/* Tarjeta Último Cierre */}
          {ultimoCierreRes?.estado === 'error' ? (
            renderBloqueError('ultimoCierre')
          ) : (
            <div
              onClick={() => onNavigate('historial-cierres')}
              className="p-4 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Último Cierre de Caja
                </span>
                {ultimoCierre?.resultado && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    ultimoCierre.resultado === 'Cuadra'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ultimoCierre.resultado === 'Sobrante'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ultimoCierre.resultado}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600">
                {ultimoCierre?.fecha ? (
                  <>
                    Fecha: <strong className="text-neutral-800">{ultimoCierre.fecha}</strong>
                    {ultimoCierre.diferencia !== undefined && ultimoCierre.diferencia !== 0 && (
                      <span className="block mt-0.5 text-neutral-700">
                        Diferencia: <strong className="tabular-nums">S/ {(ultimoCierre.diferencia ?? 0).toFixed(2)}</strong>
                      </span>
                    )}
                  </>
                ) : (
                  'No hay cierres anteriores registrados.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACCESOS RÁPIDOS EN DESKTOP (RV-151) */}
      <div className="hidden lg:block pt-2">
        {renderAdminQuickActions(onNavigate)}
      </div>
    </div>
  );
}

function renderAdminQuickActions(onNavigate: (pagina: string) => void) {
  const actions = [
    { label: 'Nuevo Pedido de Mesa', pagina: 'pedido-mesa', icon: UtensilsCrossed },
    { label: 'Pedido para Llevar', pagina: 'pedidos-llevar', icon: ShoppingBag },
    { label: 'Mesas y Salón', pagina: 'mesas', icon: LayoutGrid },
    { label: 'Gestión de Caja', pagina: 'caja', icon: DollarSign },
    { label: 'Ventas y Anulaciones', pagina: 'ventas', icon: Receipt },
    { label: 'Reportes y Estadísticas', pagina: 'reportes', icon: TrendingUp },
    { label: 'Menú del Día', pagina: 'menu-dia', icon: ClipboardList },
    { label: 'Gestión de Productos', pagina: 'productos', icon: UtensilsCrossed },
    { label: 'Gestión de Usuarios', pagina: 'usuarios', icon: Users },
  ];

  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
        Accesos Rápidos a Módulos
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(act.pagina)}
              className="p-3 bg-neutral-50 hover:bg-amber-50/70 border border-neutral-200/70 hover:border-[#D35400] rounded-xl text-left transition-all cursor-pointer group flex items-center gap-3 min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-[#D35400] group-hover:border-[#D35400] shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700 group-hover:text-neutral-900 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// 2. VISTA 15.2: PANEL DEL CAJERO
// =========================================================================
function renderCajeroDashboard(
  bloques: Record<string, any>,
  onNavigate: (pagina: string, params?: any) => void,
  renderBloqueError: (nombre: string) => React.ReactNode
) {
  const cajaRes = bloques.caja;
  const porCobrarRes = bloques.porCobrar;
  const listosRes = bloques.listos;

  const caja: BloqueCajaCajero | null = cajaRes?.estado === 'ok' ? cajaRes.datos : null;
  const porCobrar: BloquePorCobrar | null = porCobrarRes?.estado === 'ok' ? porCobrarRes.datos : null;
  const listos: BloqueListos | null = listosRes?.estado === 'ok' ? listosRes.datos : null;

  const cajaAbierta = caja?.estado === 'Abierta';
  const hayCajaAnterior = caja?.estado === 'Anterior sin cerrar';

  return (
    <div className="space-y-6">
      {/* Alerta si la caja no está abierta (MSG-166, MSG-168) */}
      {hayCajaAnterior ? (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-4 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">
              Hay una caja de un día anterior sin cerrar. Ciérrela antes de abrir una nueva o cobrar.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('caja')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Cerrar Caja Anterior
          </button>
        </div>
      ) : !cajaAbierta ? (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold">
              Todavía no hay caja abierta. Ábrala para empezar a cobrar.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('caja')}
            className="px-4 py-2 bg-[#D35400] hover:bg-[#b84500] text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Abrir Caja Ahora
          </button>
        </div>
      ) : null}

      {/* ACCESOS RÁPIDOS PRINCIPALES DEL CAJERO (RV-151) */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Operaciones de Caja y Mostrador
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Botón Cobrar (Deshabilitado con motivo si no hay caja abierta) */}
          <div className="relative group">
            <button
              type="button"
              disabled={!cajaAbierta}
              onClick={() => onNavigate('cobros')}
              className={`w-full p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all min-h-[48px] ${
                cajaAbierta
                  ? 'bg-[#D35400] text-white shadow-md hover:bg-[#b84500] cursor-pointer'
                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>COBRAR PEDIDO</span>
            </button>
            {!cajaAbierta && (
              <span className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[11px] px-2.5 py-1 rounded-md shadow-md whitespace-nowrap z-20">
                Abra la caja primero
              </span>
            )}
          </div>

          {/* Botón Pedido para Llevar */}
          <button
            type="button"
            onClick={() => onNavigate('pedidos-llevar')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <ShoppingBag className="w-5 h-5 text-[#D35400]" />
            <span>PEDIDO PARA LLEVAR</span>
          </button>

          {/* Botón Gestión de Caja */}
          <button
            type="button"
            onClick={() => onNavigate('caja')}
            className={`p-4 border rounded-xl font-bold text-sm shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px] ${
              !cajaAbierta
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-white border-neutral-200/80 hover:border-[#D35400] text-neutral-800 hover:text-[#D35400]'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>{cajaAbierta ? 'GESTIÓN DE CAJA' : 'ABRIR CAJA'}</span>
          </button>

          {/* Botón Ventas */}
          <button
            type="button"
            onClick={() => onNavigate('ventas')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <ReceiptText className="w-5 h-5 text-neutral-600" />
            <span>CONSULTAR VENTAS</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES DEL CAJERO (RV-154: Sin totales del negocio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Estado de su caja con resumen parcial */}
        {cajaRes?.estado === 'error' ? (
          renderBloqueError('caja')
        ) : (
          <div className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Resumen de su Caja
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                cajaAbierta ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {caja?.estado ?? 'Sin abrir'}
              </span>
            </div>
            {cajaAbierta ? (
              <div className="space-y-2 mt-3 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Monto Inicial:</span>
                  <span className="font-semibold tabular-nums text-neutral-800">S/ {(caja?.montoInicial ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Efectivo:</span>
                  <span className="font-semibold tabular-nums text-emerald-700">S/ {(caja?.efectivo ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Yape / Digital:</span>
                  <span className="font-semibold tabular-nums text-purple-700">S/ {(caja?.yape ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100 text-sm">
                  <span className="font-bold text-neutral-800">Total Esperado en Caja:</span>
                  <span className="font-bold tabular-nums text-emerald-800">S/ {(caja?.totalEsperado ?? 0).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 mt-2">
                Abra la caja para comenzar a procesar pedidos y ventas.
              </p>
            )}
          </div>
        )}

        {/* Pedidos por cobrar */}
        {porCobrarRes?.estado === 'error' ? (
          renderBloqueError('porCobrar')
        ) : (
          <div
            onClick={() => onNavigate('cobros')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pedidos por Cobrar
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {porCobrar?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">pedidos</span>
              </div>
              {porCobrar?.cantidad === 0 ? (
                <p className="text-xs text-neutral-500 italic mt-2">
                  No hay pedidos pendientes de cobro.
                </p>
              ) : (
                <p className="text-xs text-neutral-600 mt-2">
                  Monto pendiente acumulado: <strong className="text-neutral-800 tabular-nums">S/ {(porCobrar?.monto ?? 0).toFixed(2)}</strong>
                </p>
              )}
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ir a módulo de Cobros</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Pedidos listos */}
        {listosRes?.estado === 'error' ? (
          renderBloqueError('listos')
        ) : (
          <div
            onClick={() => onNavigate('pedidos', { estado: 'listo' })}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pedidos Listos
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {listos?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">listos para servir o entrega</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Listos para ser entregados o cobrados inmediatamente.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver pedidos listos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 3. VISTA 15.3: PANEL DEL MOZO
// =========================================================================
function renderMozoDashboard(
  bloques: Record<string, any>,
  onNavigate: (pagina: string, params?: any) => void,
  renderBloqueError: (nombre: string) => React.ReactNode
) {
  const mesasRes = bloques.mesas;
  const enCursoRes = bloques.misPedidosEnCurso;
  const misListosRes = bloques.misListos;

  const mesas: BloqueMesas | null = mesasRes?.estado === 'ok' ? mesasRes.datos : null;
  const enCurso: BloqueSimpleCantidad | null = enCursoRes?.estado === 'ok' ? enCursoRes.datos : null;
  const misListos: BloqueSimpleCantidad | null = misListosRes?.estado === 'ok' ? misListosRes.datos : null;

  return (
    <div className="space-y-6">
      {/* Aviso prioritario si tiene pedidos listos por recoger */}
      {misListos && misListos.cantidad > 0 ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-4 text-emerald-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">¡Tiene {misListos.cantidad} pedido(s) listos en cocina!</p>
              <p className="text-xs text-emerald-700">Por favor, acérquese a recogerlos para servir a los comensales.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pedidos', { estado: 'listo' })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Ver Pedidos
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-neutral-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>No tiene pedidos listos por recoger.</span>
        </div>
      )}

      {/* ACCESOS RÁPIDOS DEL MOZO */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Acciones Operativas del Salón
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('pedido-mesa')}
            className="p-4 bg-[#D35400] text-white hover:bg-[#b84500] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>NUEVO PEDIDO DE MESA</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mesas')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <LayoutGrid className="w-5 h-5 text-[#D35400]" />
            <span>VER MESAS Y SALÓN</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DEL MOZO (RV-154: Sin montos económicos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Mesas Libres y Ocupadas */}
        {mesasRes?.estado === 'error' ? (
          renderBloqueError('mesas')
        ) : (
          <div
            onClick={() => onNavigate('mesas')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Estado de Mesas
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-emerald-700 mb-1">
                {mesas?.libres ?? 0} <span className="text-sm font-normal text-neutral-500">libres</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Ocupadas: <strong className="text-rose-700 tabular-nums">{mesas?.ocupadas ?? 0}</strong> mesas
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ir al mapa de mesas</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Mis Pedidos en Curso */}
        {enCursoRes?.estado === 'error' ? (
          renderBloqueError('misPedidosEnCurso')
        ) : (
          <div
            onClick={() => onNavigate('pedidos')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mis Pedidos en Curso
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {enCurso?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">activos</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Pedidos tomados por usted en preparación o pendientes.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver mis pedidos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Mis Pedidos Listos */}
        {misListosRes?.estado === 'error' ? (
          renderBloqueError('misListos')
        ) : (
          <div
            onClick={() => onNavigate('pedidos', { estado: 'listo' })}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mis Pedidos Listos
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {misListos?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">por recoger</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Platos listos en cocina esperando ser servidos.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Ver pedidos listos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 4. VISTA 15.4: PANEL DEL COCINERO
// =========================================================================
function renderCocineroDashboard(
  bloques: Record<string, any>,
  onNavigate: (pagina: string, params?: any) => void,
  renderBloqueError: (nombre: string) => React.ReactNode
) {
  const comandasRes = bloques.comandas;
  const agotadosRes = bloques.agotados;

  const comandas: BloqueComandasCocinero | null = comandasRes?.estado === 'ok' ? comandasRes.datos : null;
  const agotados: BloqueAgotadosCocinero | null = agotadosRes?.estado === 'ok' ? agotadosRes.datos : null;

  const tieneDemora = (comandas?.masAntiguaMinutos ?? 0) >= 15;

  return (
    <div className="space-y-6">
      {/* Alerta si hay demoras de preparación (RV-152, E-365) */}
      {tieneDemora && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-amber-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">
                Atención: hay comandas con más de 15 minutos de espera ({comandas?.masAntiguaMinutos} min).
              </p>
              <p className="text-xs text-amber-700">
                Priorice las órdenes más antiguas para reducir el tiempo del servicio.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cocina')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Ver Comandas
          </button>
        </div>
      )}

      {/* ACCESOS RÁPIDOS DEL COCINERO */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Operación de Cocina KDS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('cocina')}
            className="p-4 bg-[#D35400] text-white hover:bg-[#b84500] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <ChefHat className="w-5 h-5" />
            <span>PANTALLA DE COMANDAS (KDS)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('menu-dia')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <Utensils className="w-5 h-5 text-[#D35400]" />
            <span>MARCAR PLATOS AGOTADOS / MENÚ</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DEL COCINERO (RV-154: Sin montos económicos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Comandas Activas */}
        {comandasRes?.estado === 'error' ? (
          renderBloqueError('comandas')
        ) : (
          <div
            onClick={() => onNavigate('cocina')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Comandas por Preparar
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  tieneDemora ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tieneDemora ? 'Demora' : 'Ritmo Normal'}
                </span>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {(comandas?.pendientes ?? 0) + (comandas?.enPreparacion ?? 0)} <span className="text-sm font-normal text-neutral-500">en cocina</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-1 mt-3">
                <div className="flex justify-between">
                  <span>Pendientes por iniciar:</span>
                  <span className="font-semibold tabular-nums text-neutral-800">{comandas?.pendientes ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>En preparación en fogón:</span>
                  <span className="font-semibold tabular-nums text-orange-700">{comandas?.enPreparacion ?? 0}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-100">
                  <span>Espera de la comanda más antigua:</span>
                  <span className={`font-bold tabular-nums ${tieneDemora ? 'text-rose-700' : 'text-neutral-700'}`}>
                    {comandas?.masAntiguaMinutos ?? 0} min
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Abrir pantalla de cocina</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Platos Agotados */}
        {agotadosRes?.estado === 'error' ? (
          renderBloqueError('agotados')
        ) : (
          <div
            onClick={() => onNavigate('menu-dia')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Platos Agotados Hoy
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  (agotados?.cantidad ?? 0) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {agotados?.cantidad ?? 0} agotados
                </span>
              </div>
              {agotados && agotados.cantidad > 0 ? (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs text-neutral-500">Platos marcados como sin stock:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agotados.platos.map((plato, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-[11px] font-semibold"
                      >
                        {plato}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-2">
                  Todos los platos del menú del día están disponibles para el salón.
                </p>
              )}
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#D35400] font-semibold">
              <span>Gestionar disponibilidad</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
