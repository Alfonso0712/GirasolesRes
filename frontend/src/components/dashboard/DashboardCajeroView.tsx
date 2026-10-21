import React from 'react';
import type {
  BloqueCajaCajero,
  BloquePorCobrar,
  BloqueListos
} from '../../types/inicio';
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Receipt,
  ChevronRight
} from 'lucide-react';

export interface DashboardCajeroViewProps {
  bloques: Record<string, any>;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const DashboardCajeroView: React.FC<DashboardCajeroViewProps> = ({
  bloques,
  onNavigate,
  renderBloqueError
}) => {
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
              <span className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md whitespace-nowrap z-20">
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
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <DollarSign className="w-5 h-5 text-neutral-600" />
            <span>GESTIONAR TURNO DE CAJA</span>
          </button>

          {/* Botón Historial de Ventas */}
          <button
            type="button"
            onClick={() => onNavigate('ventas')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#D35400] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <Receipt className="w-5 h-5 text-neutral-600" />
            <span>HISTORIAL DE COMPROBANTES</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DEL CAJERO (RV-154: Sin totales acumulados del día, solo turno) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Turno actual */}
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
};

export default DashboardCajeroView;
