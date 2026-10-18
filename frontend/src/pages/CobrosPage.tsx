import React from 'react';
import {
  DollarSign,
  Receipt,
  RotateCw,
  Search,
  Filter,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Check,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useCobrosManagement } from '../hooks/useCobrosManagement';
import { AbrirCajaModal } from '../components/AbrirCajaModal';
import { CobroModal } from '../components/CobroModal';
import { TicketComprobanteModal } from '../components/TicketComprobanteModal';
import type { UserSession } from '../types/auth';

interface CobrosPageProps {
  session: UserSession;
  onLogout: () => void;
}

export const CobrosPage: React.FC<CobrosPageProps> = ({ session, onLogout }) => {
  void onLogout;
  const {
    cajaEstado,
    pedidos,
    totalPedidos,
    totalPorCobrar,
    totalListos,
    cargando,
    errorCarga,
    filtroTipo,
    setFiltroTipo,
    busqueda,
    setBusqueda,
    abrirCajaModalOpen,
    setAbrirCajaModalOpen,
    cobroModalOpen,
    setCobroModalOpen,
    pedidoParaCobro,
    ticketModalOpen,
    setTicketModalOpen,
    comprobanteActual,
    procesandoCaja,
    procesandoCobro,
    descargandoTxt,
    cargarDatos,
    handleAbrirCaja,
    handleIniciarCobro,
    handleConfirmarCobro,
    handleDescargarTxt,
    avisoExito,
    avisoError,
    setAvisoError,
  } = useCobrosManagement(session.token);

  const cajaCerrada = !cajaEstado?.estaAbierta;

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6 max-w-7xl mx-auto w-full select-none">
      {/* 1. Encabezado Editorial Limpio Directo sobre Canvas (#FAF7F4) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">
            GESTIÓN DE CAJA
          </p>
          <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
            Cobro de Pedidos
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Registro de cobros, cálculo de cambio y emisión de tickets térmicos.
          </p>
        </div>

        {/* Estado de Caja & Controles */}
        <div className="flex items-center gap-3 shrink-0">
          {cajaCerrada ? (
            <button
              type="button"
              onClick={() => setAbrirCajaModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B84600] border border-amber-200 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[38px]"
            >
              <Lock className="w-4 h-4 text-[#B84600]" />
              <span>Caja Cerrada · Abrir Caja</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Caja abierta por <strong>{cajaEstado?.cajeroNombre || session.nombre}</strong>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            title="Refrescar pedidos pendientes"
            aria-label="Refrescar pedidos pendientes"
            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#D35400]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Banner de Caja Cerrada si corresponde */}
      {cajaCerrada && (
        <div className="shrink-0 mb-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#B84600] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#482813]">
                La caja se encuentra cerrada
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                Debe registrar el fondo inicial para habilitar la visualización y cobro de pedidos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAbrirCajaModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0 min-h-[38px] flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Abrir caja ahora</span>
          </button>
        </div>
      )}

      {/* 2. Tarjetas KPI / Resumen Rápido (shrink-0) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Por Cobrar
            </span>
            <span className="text-xl font-bold font-mono text-[#2C1A0E]">
              {totalPedidos} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#D35400] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Listos en Cocina
            </span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {totalListos} listos
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Monto Pendiente
            </span>
            <span className="text-xl font-bold font-mono text-[#D35400]">
              S/ {totalPorCobrar.toFixed(2)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D35400] flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros Fija (shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-neutral-200/80 shadow-2xs mb-4">
        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-[#7C6F66] flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Ver:
          </span>

          <button
            type="button"
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filtroTipo === 'todos'
                ? 'bg-[#482813] text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Todos ({totalPedidos})
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('mesa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filtroTipo === 'mesa'
                ? 'bg-[#482813] text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Salón / Mesas
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('llevar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filtroTipo === 'llevar'
                ? 'bg-[#482813] text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Para Llevar
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('listos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filtroTipo === 'listos'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            Listos ({totalListos})
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar mesa o n.º..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400]"
          />
        </div>
      </div>

      {/* 4. Contenedor de Datos con Scroll Confinado */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white border border-neutral-200/80 rounded-2xl shadow-2xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
        {cargando ? (
          <div className="p-12 text-center">
            <RotateCw className="w-8 h-8 text-[#D35400] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-600">
              Cargando pedidos pendientes de cobro...
            </p>
          </div>
        ) : errorCarga ? (
          <div className="p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-800 mb-1">Error al cargar datos</h3>
            <p className="text-xs text-neutral-500 mb-4">{errorCarga}</p>
            <button
              type="button"
              onClick={cargarDatos}
              className="px-4 py-2 bg-[#D35400] text-white rounded-xl text-xs font-semibold hover:bg-[#B84600] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-neutral-800 mb-1">
              No hay pedidos pendientes de cobro
            </h3>
            <p className="text-xs text-neutral-500">
              {cajaCerrada
                ? 'Abra la caja para consultar y registrar cobros.'
                : busqueda
                ? 'No se encontraron pedidos con ese criterio de búsqueda.'
                : 'Todos los pedidos tomados han sido cobrados o no registran consumos activos.'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop (>= lg) */}
            <div className="hidden lg:block">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">N.º Pedido</th>
                    <th className="py-3 px-4">Destino</th>
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Estado Cocina</th>
                    <th className="py-3 px-4 text-right">Total a Cobrar</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {pedidos.map((p) => {
                    const esMesa = p.tipo.toLowerCase() === 'mesa';

                    return (
                      <tr
                        key={p.pedidoId}
                        className={`transition-colors hover:bg-neutral-50/70 ${
                          p.estaListo ? 'bg-emerald-50/25' : ''
                        }`}
                      >
                        {/* N.º Pedido */}
                        <td className="py-3.5 px-4 font-bold font-mono text-neutral-900">
                          #{p.numero}
                        </td>

                        {/* Destino */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {esMesa ? (
                              <Utensils className="w-4 h-4 text-[#D35400]" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="font-semibold text-neutral-900">
                              {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                            </span>
                          </div>
                          {p.referencia && (
                            <span className="text-xs text-neutral-400 italic block mt-0.5">
                              Ref: {p.referencia}
                            </span>
                          )}
                        </td>

                        {/* Hora */}
                        <td className="py-3.5 px-4 text-xs font-mono text-neutral-600">
                          {p.hora}
                        </td>

                        {/* Estado Cocina */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold ${
                              p.estaListo
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {p.estaListo ? 'Listo' : 'En proceso'}
                          </span>
                        </td>

                        {/* Total a Cobrar */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-[#D35400]">
                          S/ {p.total.toFixed(2)}
                        </td>

                        {/* Acción */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleIniciarCobro(p)}
                            title={`Cobrar pedido #${p.numero}`}
                            aria-label={`Cobrar pedido #${p.numero}`}
                            className="px-4 py-1.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer mx-auto min-h-[34px]"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Cobrar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas Móviles (< lg) */}
            <div className="lg:hidden p-3 space-y-3">
              {pedidos.map((p) => {
                const esMesa = p.tipo.toLowerCase() === 'mesa';

                return (
                  <div
                    key={p.pedidoId}
                    className={`p-4 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col gap-3 ${
                      p.estaListo ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {esMesa ? (
                          <Utensils className="w-4 h-4 text-[#D35400]" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="font-bold text-neutral-900">
                          {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-500">
                          #{p.numero}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          p.estaListo
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.estaListo ? 'Listo' : 'En proceso'}
                      </span>
                    </div>

                    {p.referencia && (
                      <p className="text-xs text-neutral-500 italic">
                        Referencia: {p.referencia}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                          Total
                        </span>
                        <span className="text-lg font-bold font-mono text-[#D35400]">
                          S/ {p.total.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIniciarCobro(p)}
                        className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Cobrar pedido</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <AbrirCajaModal
        isOpen={abrirCajaModalOpen}
        onClose={() => setAbrirCajaModalOpen(false)}
        onConfirm={handleAbrirCaja}
        loading={procesandoCaja}
      />

      <CobroModal
        isOpen={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
        pedido={pedidoParaCobro}
        onConfirmarCobro={handleConfirmarCobro}
        loading={procesandoCobro}
      />

      <TicketComprobanteModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        comprobante={comprobanteActual}
        onDescargarTxt={handleDescargarTxt}
        descargando={descargandoTxt}
      />

      {/* Toasts Flotantes */}
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
    </div>
  );
};
