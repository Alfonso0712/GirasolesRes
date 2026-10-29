import React from 'react';
import type {
  BloqueVentasHoy,
  BloquePlatosHoy,
  BloquePedidosPorEstado,
  BloqueMesas,
  BloqueCajaAdmin,
  BloqueMenuAdmin,
  BloqueUltimoCierre,
  AlertaInicio
} from '../../types/inicio';
import { SolesIcon } from '../ui/SolesIcon';
import {
  AlertTriangle,
  CheckCircle2,
  Utensils,
  UtensilsCrossed,
  ClipboardList,
  ShoppingBag,
  Users,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  Lock,
  BarChart3,
  CalendarCheck
} from 'lucide-react';

export interface DashboardAdminViewProps {
  bloques: Record<string, any>;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const DashboardAdminView: React.FC<DashboardAdminViewProps> = ({
  bloques,
  onNavigate,
  renderBloqueError
}) => {
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
                        <p className="text-xs opacity-75 mt-0.5">
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
                          : 'bg-primary hover:bg-primary-hover text-white'
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
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Todo en orden:</span> no hay alertas por atender en este momento.
            </div>
          </div>
        )}
      </div>

      {/* ACCESOS RÁPIDOS A MÓDULOS (RV-151, RV-153) */}
      <div>
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
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Ventas de Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-accent flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <SolesIcon className="w-4 h-4" />
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
                  <div className="flex justify-between pt-1 border-t border-neutral-100 text-xs text-neutral-500">
                    <span>Total ventas:</span>
                    <span className="font-medium">{ventasHoy?.nVentas ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Ver reporte de hoy</span>
              <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
            </div>
          </div>
        )}

        {/* Tarjeta 2: Platos Vendidos */}
        {platosHoyRes?.estado === 'error' ? (
          renderBloqueError('platosHoy')
        ) : (
          <div
            onClick={() => onNavigate('reportes')}
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Platos Vendidos Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-accent flex items-center justify-center group-hover:bg-orange-100 transition-colors">
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
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Ver detalle de platos</span>
              <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
            </div>
          </div>
        )}

        {/* Tarjeta 3: Pedidos por Estado */}
        {pedidosRes?.estado === 'error' ? (
          renderBloqueError('pedidosPorEstado')
        ) : (
          <div
            onClick={() => onNavigate('pedidos')}
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pedidos de Hoy
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
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
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Gestionar pedidos</span>
              <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
            </div>
          </div>
        )}

        {/* Tarjeta 4: Mesas del Salón */}
        {mesasRes?.estado === 'error' ? (
          renderBloqueError('mesas')
        ) : (
          <div
            onClick={() => onNavigate('mesas')}
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mesas y Salón
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
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
                  <span>Total mesas:</span>
                  <span className="font-semibold tabular-nums">{(mesas?.libres ?? 0) + (mesas?.ocupadas ?? 0)}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Ver salón de mesas</span>
              <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* 3. BLOQUES DE DETALLE (TOP 5 PLATOS, PEDIDOS POR ESTADO, CAJA Y MENÚ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Top 5 Platos Vendidos */}
        <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-accent" />
                <span>Top Platos Vendidos de Hoy</span>
              </h3>
              <span className="text-xs font-semibold text-neutral-500">Ranking</span>
            </div>

            {platosHoyRes?.estado === 'error' ? (
              renderBloqueError('platosHoy')
            ) : !platosHoy?.principales || platosHoy.principales.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Aún no hay platos despachados el día de hoy.
              </div>
            ) : (
              <div className="space-y-3">
                {platosHoy.principales.slice(0, 5).map((plato, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-neutral-800 truncate" title={plato.producto}>
                        {plato.producto}
                      </span>
                    </div>
                    <span className="font-bold font-sans tabular-nums text-neutral-900 bg-neutral-100/80 px-2 py-0.5 rounded-md shrink-0">
                      {plato.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Visualice el acumulado en Reportes</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>

        {/* Columna 2: Desglose de Pedidos por Estado */}
        <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-info" />
                <span>Estado de Pedidos</span>
              </h3>
              <span className="text-xs font-semibold text-neutral-500">Operación</span>
            </div>

            {pedidosRes?.estado === 'error' ? (
              renderBloqueError('pedidosPorEstado')
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Pendientes */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'pendiente' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-medium text-neutral-500 block">Pendientes</span>
                  <span className="text-lg font-bold tabular-nums text-amber-700">
                    {pedidos?.pendiente ?? 0}
                  </span>
                </button>

                {/* En preparación */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'en_preparacion' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-medium text-neutral-500 block">En Cocina</span>
                  <span className="text-lg font-bold tabular-nums text-accent">
                    {pedidos?.enPreparacion ?? 0}
                  </span>
                </button>

                {/* Listos */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'listo' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-medium text-neutral-500 block">Listos</span>
                  <span className="text-lg font-bold tabular-nums text-blue-700">
                    {pedidos?.listo ?? 0}
                  </span>
                </button>

                {/* Por cobrar */}
                <button
                  type="button"
                  onClick={() => onNavigate('cobros')}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-medium text-neutral-500 block">Por Cobrar</span>
                  <span className="text-lg font-bold tabular-nums text-purple-700">
                    {pedidos?.porCobrar ?? 0}
                  </span>
                </button>

                {/* Pagados */}
                <button
                  type="button"
                  onClick={() => onNavigate('pedidos', { estado: 'pagado' })}
                  className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-medium text-neutral-500 block">Pagados</span>
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
                  <span className="text-xs font-medium text-neutral-500 block">Anulados</span>
                  <span className="text-lg font-bold tabular-nums text-rose-700">
                    {pedidos?.anulado ?? 0}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Gestión completa en Pedidos</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>

        {/* Columna 3: Estado de Caja, Menú y Último Cierre */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Tarjeta Caja */}
          {cajaRes?.estado === 'error' ? (
            renderBloqueError('caja')
          ) : (
            <div
              onClick={() => onNavigate('historial-cierres')}
              className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Estado de Caja
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
              className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Menú de Hoy
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
              className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Último Cierre de Caja
                </span>
                {ultimoCierre?.resultado && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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

      </div>
  );
};

function renderAdminQuickActions(onNavigate: (pagina: string) => void) {
  const actions = [
    { label: 'Pedido para Llevar', pagina: 'pedidos-llevar', icon: ShoppingBag },
    { label: 'Mesas y Salón', pagina: 'mesas', icon: LayoutGrid },
    { label: 'Historial de Cierres', pagina: 'historial-cierres', icon: Lock },
    { label: 'Ventas y Anulaciones', pagina: 'ventas', icon: SolesIcon },
    { label: 'Reportes y Estadísticas', pagina: 'reportes', icon: BarChart3 },
    { label: 'Menú del Día', pagina: 'menu-dia', icon: CalendarCheck },
    { label: 'Gestión de Productos', pagina: 'productos', icon: UtensilsCrossed },
    { label: 'Gestión de Usuarios', pagina: 'usuarios', icon: Users },
  ];

  return (
    <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
        Accesos Rápidos a Módulos
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(act.pagina)}
              className="p-3 bg-neutral-50 hover:bg-amber-50/70 border border-neutral-200/70 hover:border-accent rounded-xl text-left transition-all cursor-pointer group flex items-center gap-3 min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-lg bg-surface border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-accent group-hover:border-accent shrink-0 transition-colors">
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

export default DashboardAdminView;
