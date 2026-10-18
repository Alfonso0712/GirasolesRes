import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Search,
  RotateCcw,
  User,
  ArrowLeft
} from 'lucide-react';
import { usePedidoLlevarManagement } from '../hooks/usePedidoLlevarManagement';
import { NotaObservacionModal } from '../components/NotaObservacionModal';
import { PedidoDescartarModal } from '../components/PedidoDescartarModal';
import { PedidoLlevarConfirmacionModal } from '../components/PedidoLlevarConfirmacionModal';
import { Button } from '../components/Button';
import type { UserSession } from '../types/auth';

interface PedidoLlevarPageProps {
  session: UserSession;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onVolver?: () => void;
  onNavigateToCobro?: (pedidoId: string) => void;
}

export const PedidoLlevarPage: React.FC<PedidoLlevarPageProps> = ({
  session,
  onLogout,
  onVolver,
  onNavigateToCobro,
}) => {
  const {
    cargando,
    registrando,
    errorGeneral,
    erroresLineas,
    catalogoFiltrado,
    categorias,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    referencia,
    handleCambioReferencia,
    errorReferencia,
    lineasBorrador,
    agregarProducto,
    actualizarCantidad,
    disminuirProducto,
    quitarLinea,
    totalCalculado,
    cantidadTotalProductos,
    modalDescartarOpen,
    setModalDescartarOpen,
    descartarPedido,
    modalExitoOpen,
    setModalExitoOpen,
    exitoData,
    iniciarNuevoPedido,
    registrarPedidoLlevar,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    abrirModalNota,
    guardarNota,
    recargarCatalogo
  } = usePedidoLlevarManagement({
    token: session.token,
    onLogout
  });

  const [drawerMovilAbierto, setDrawerMovilAbierto] = useState(false);

  // Atajos de teclado: Escape para descartar pedido si hay líneas
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !modalNotaOpen && !modalExitoOpen && !modalDescartarOpen) {
        if (lineasBorrador.length > 0) {
          setModalDescartarOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lineasBorrador.length, modalNotaOpen, modalExitoOpen, modalDescartarOpen, setModalDescartarOpen]);

  // Si está cargando el catálogo
  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FDFBF9] animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#D35400] flex items-center justify-center animate-spin mb-4">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <p className="font-sans font-bold text-lg text-[#2C1A0E]">Cargando carta para llevar…</p>
        <p className="text-xs text-[#7C6F66] mt-1">Consultando disponibilidad de productos</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FAF7F4] overflow-hidden">
      {/* 1. Encabezado Fijo del Módulo sobre fondo crema */}
      <div className="shrink-0 p-4 sm:p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {onVolver && (
              <button
                type="button"
                onClick={onVolver}
                aria-label="Volver"
                className="p-2 rounded-xl text-neutral-500 hover:text-[#2C1A0E] hover:bg-neutral-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer mt-0.5"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">
                OPERACIÓN DE SALÓN
              </p>
              <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
                Pedido para Llevar
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Registre el pedido para llevar del cliente y envíe la comanda a cocina.
              </p>
            </div>
          </div>

          {/* Campo de Referencia del Cliente (RV-73: Opcional, máx 30 caracteres) */}
          <div className="w-full sm:w-80">
            <label
              htmlFor="referencia-cliente"
              className="flex items-center justify-between text-xs font-semibold text-[#2C1A0E] mb-1"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D35400]" />
                Referencia del cliente (opcional):
              </span>
              <span className={`text-[10px] font-bold tabular-nums ${referencia.length > 30 ? 'text-rose-600' : 'text-neutral-400'}`}>
                {referencia.length}/30
              </span>
            </label>
            <div className="relative">
              <input
                id="referencia-cliente"
                type="text"
                value={referencia}
                onChange={(e) => handleCambioReferencia(e.target.value)}
                maxLength={30}
                placeholder="Ej: Sra. Rosa, joven de polera azul..."
                className={`w-full px-3 py-2 text-xs bg-[#FAF7F4] border rounded-xl text-[#2C1A0E] placeholder:text-neutral-400 transition-all min-h-[44px] focus:outline-hidden focus:ring-2 ${
                  errorReferencia
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
                    : 'border-neutral-200 focus:border-[#D35400] focus:ring-[#D35400]/20'
                }`}
              />
            </div>
            {errorReferencia && (
              <p className="text-[11px] font-medium text-rose-600 mt-1 animate-in fade-in flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errorReferencia}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL: 2 COLUMNAS (CATÁLOGO A LA IZQUIERDA, TICKET A LA DERECHA) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* COLUMNA IZQUIERDA: CATÁLOGO DE PRODUCTOS (RNF-26) */}
        <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 overflow-hidden">
          {/* Barra de búsqueda y categorías */}
          <div className="space-y-3 shrink-0 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o categoría de plato..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-[#2C1A0E] placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] transition-colors min-h-[40px]"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 px-1 py-0.5 rounded-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Píldoras de Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                    categoriaActiva === cat
                      ? 'bg-[#482813] text-white shadow-xs'
                      : 'bg-white border border-neutral-200 text-[#7C6F66] hover:bg-neutral-50 hover:text-[#2C1A0E]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla scrolleable de Tarjetas de Producto */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {catalogoFiltrado.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center p-6 text-center bg-white border border-dashed border-neutral-300 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-neutral-300 mb-2" />
                <p className="font-sans font-bold text-sm text-[#2C1A0E]">
                  No se encontraron productos disponibles
                </p>
                <p className="text-xs text-[#7C6F66] mt-1 max-w-sm">
                  {busqueda
                    ? 'No hay platos que coincidan con el término de búsqueda ingresado.'
                    : 'No hay platos configurados en el menú para esta categoría.'}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setBusqueda('');
                    setCategoriaActiva('Todas');
                    recargarCatalogo();
                  }}
                  className="mt-4 text-xs"
                >
                  Restablecer filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
                {catalogoFiltrado.map((prod) => {
                  const enBorrador = lineasBorrador.filter((l) => l.productoId === prod.id);
                  const cantidadEnBorrador = enBorrador.reduce((s, l) => s + l.cantidad, 0);

                  return (
                    <div
                      key={prod.id}
                      className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        prod.agotado
                          ? 'bg-neutral-100/70 border-neutral-200 opacity-60'
                          : 'bg-white border-neutral-200/90 hover:border-[#D35400]/60 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                            {prod.categoria}
                          </span>

                          {prod.agotado ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
                              AGOTADO
                            </span>
                          ) : cantidadEnBorrador > 0 ? (
                            <span className="text-[11px] font-extrabold text-[#D35400] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 tabular-nums">
                              {cantidadEnBorrador} en pedido
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-bold text-sm text-[#2C1A0E] line-clamp-2 leading-snug">
                          {prod.nombre}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#2C1A0E] tabular-nums">
                          S/ {prod.precio.toFixed(2)}
                        </span>

                        <Button
                          type="button"
                          variant="primary"
                          disabled={prod.agotado}
                          onClick={() => agregarProducto(prod)}
                          title={prod.agotado ? 'Plato agotado' : 'Agregar al pedido para llevar'}
                          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs ${
                            prod.agotado
                              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
                              : 'bg-[#D35400] hover:bg-[#B84600] text-white active:scale-95'
                          }`}
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Agregar</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO / TICKET (DESKTOP) */}
        <div className="hidden lg:flex w-96 flex-col min-h-0 bg-white border-l border-neutral-200/80 shadow-xs">
          {/* Cabecera del Ticket */}
          <div className="p-4 border-b border-neutral-200/80 bg-[#FAF7F4] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#D35400] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-sm text-[#2C1A0E]">
                  Comanda para Llevar
                </h2>
                <p className="text-[11px] text-[#7C6F66]">
                  {lineasBorrador.length} ítems • {cantidadTotalProductos} platos
                </p>
              </div>
            </div>

            {lineasBorrador.length > 0 && (
              <button
                type="button"
                onClick={() => setModalDescartarOpen(true)}
                className="text-xs text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Descartar pedido (Esc)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lista de Líneas en Borrador */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {lineasBorrador.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F4] border border-neutral-200 flex items-center justify-center text-neutral-300 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-neutral-500">
                  No hay productos en el pedido para llevar
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                  Toque el botón + de cualquier producto de la carta para agregarlo a la comanda.
                </p>
              </div>
            ) : (
              lineasBorrador.map((linea, index) => {
                const tieneError = Boolean(erroresLineas[linea.productoId] || linea.agotado);

                return (
                  <div
                    key={`${linea.productoId}-${linea.observacion}-${index}`}
                    className={`p-3 rounded-xl border transition-all ${
                      tieneError
                        ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                        : 'bg-[#FAF7F4] border-neutral-200 hover:border-neutral-300 shadow-2xs'
                    }`}
                  >
                    {/* Fila 1: Nombre del plato y Subtotal */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#2C1A0E] block truncate" title={linea.nombre}>
                          {linea.nombre}
                        </span>
                        <span className="text-[11px] text-[#7C6F66] tabular-nums">
                          {linea.cantidad} × S/ {linea.precioUnitario.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-[#2C1A0E] tabular-nums">
                        S/ {linea.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Alerta si el plato se agotó en cocina (409 Conflict) */}
                    {tieneError && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/80 border border-rose-200 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{erroresLineas[linea.productoId] || 'Plato marcado como agotado.'}</span>
                      </div>
                    )}

                    {/* Observación / Nota del plato */}
                    {linea.observacion && (
                      <div className="mt-2 text-xs text-amber-950 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2">
                        <span className="truncate italic font-medium">Nota: "{linea.observacion}"</span>
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          className="text-[#D35400] font-bold text-[11px] hover:underline shrink-0 cursor-pointer"
                          title="Editar nota del plato"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    {/* Controles de línea: Botón "+ Nota" a la izquierda y Controles de Cantidad (+/-) a la derecha */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalNota(linea)}
                        title={linea.observacion ? `Editar observación: "${linea.observacion}"` : 'Agregar nota de preparación (máx 100 caracteres)'}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                          linea.observacion
                            ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200'
                            : 'bg-white border-amber-300/80 text-[#D35400] hover:bg-amber-50 hover:border-[#D35400]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Control de cantidad rápido + / - */}
                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => disminuirProducto(linea.productoId, linea.observacion)}
                            className="w-7 h-7 rounded-l-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer active:scale-95"
                            aria-label="Restar una unidad"
                            title="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold text-[#2C1A0E] tabular-nums select-none">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCantidad(
                                linea.productoId,
                                Math.min(20, linea.cantidad + 1),
                                linea.observacion
                              )
                            }
                            disabled={linea.cantidad >= 20}
                            className="w-7 h-7 rounded-r-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 transition-colors cursor-pointer active:scale-95"
                            aria-label="Sumar una unidad"
                            title="Sumar una unidad"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Botón Quitar */}
                        <button
                          type="button"
                          onClick={() => quitarLinea(linea.productoId, linea.observacion)}
                          className="w-7 h-7 rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title="Quitar línea del pedido"
                          aria-label="Quitar línea"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pie Fijo con Total y Botón de Envío */}
          <div className="p-4 border-t border-neutral-200/80 bg-[#FAF7F4] shrink-0 space-y-3">
            {errorGeneral && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1">{errorGeneral}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="text-xs text-[#7C6F66] block">Total a Pagar</span>
                {referencia.trim() && (
                  <span className="text-[11px] font-semibold text-[#D35400] block truncate max-w-[140px]">
                    Cliente: {referencia.trim()}
                  </span>
                )}
              </div>
              <span className="text-xl font-extrabold text-[#2C1A0E] tabular-nums">
                S/ {totalCalculado.toFixed(2)}
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={
                registrando ||
                lineasBorrador.length === 0 ||
                Boolean(errorReferencia) ||
                lineasBorrador.some((l) => l.agotado)
              }
              onClick={registrarPedidoLlevar}
              className="w-full min-h-[48px] text-xs font-bold bg-[#D35400] hover:bg-[#B84600] text-white shadow-md flex items-center justify-center gap-2"
            >
              {registrando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registrando comanda…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REGISTRAR PEDIDO</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. BARRA INFERIOR FLOTANTE PARA MÓVIL (RNF-24) */}
      <div className="lg:hidden shrink-0 bg-white border-t border-neutral-200 p-3 flex items-center justify-between gap-3 shadow-lg z-30">
        <div
          onClick={() => setDrawerMovilAbierto(true)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs font-bold text-[#D35400]">
              {cantidadTotalProductos} productos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500 truncate">
              {referencia.trim() || 'Para llevar'}
            </span>
          </div>
          <div className="text-base font-extrabold text-[#2C1A0E] tabular-nums">
            Total S/ {totalCalculado.toFixed(2)}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={
            registrando ||
            lineasBorrador.length === 0 ||
            Boolean(errorReferencia) ||
            lineasBorrador.some((l) => l.agotado)
          }
          onClick={registrarPedidoLlevar}
          className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-[#D35400] hover:bg-[#B84600] text-white shadow-md shrink-0 flex items-center gap-1.5"
        >
          {registrando ? (
            <span>Enviando…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>REGISTRAR PEDIDO</span>
            </>
          )}
        </Button>
      </div>

      {/* MODAL / DRAWER MÓVIL PARA VER Y EDITAR LÍNEAS DEL PEDIDO (RNF-24) */}
      {drawerMovilAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-[#FAF7F4]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D35400]" />
                <h3 className="font-sans font-bold text-base text-[#2C1A0E]">
                  Detalle del Pedido ({lineasBorrador.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerMovilAbierto(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {lineasBorrador.map((linea, idx) => {
                const tieneError = Boolean(erroresLineas[linea.productoId] || linea.agotado);
                return (
                  <div
                    key={`${linea.productoId}-${linea.observacion}-${idx}`}
                    className={`p-3 rounded-xl border transition-all ${
                      tieneError
                        ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                        : 'bg-[#FAF7F4] border-neutral-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#2C1A0E] block truncate">
                          {linea.nombre}
                        </span>
                        <span className="text-[11px] text-[#7C6F66] tabular-nums">
                          {linea.cantidad} × S/ {linea.precioUnitario.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-[#2C1A0E] tabular-nums">
                        S/ {linea.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {tieneError && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/80 border border-rose-200 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{erroresLineas[linea.productoId] || 'Plato marcado como agotado.'}</span>
                      </div>
                    )}

                    {linea.observacion && (
                      <div className="mt-2 text-xs text-amber-950 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2">
                        <span className="truncate italic font-medium">Nota: "{linea.observacion}"</span>
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          className="text-[#D35400] font-bold text-[11px] hover:underline shrink-0 cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalNota(linea)}
                        className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                          linea.observacion
                            ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                            : 'bg-white border-amber-300/80 text-[#D35400]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => disminuirProducto(linea.productoId, linea.observacion)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95"
                            aria-label="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold text-[#2C1A0E] tabular-nums select-none">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCantidad(
                                linea.productoId,
                                Math.min(20, linea.cantidad + 1),
                                linea.observacion
                              )
                            }
                            disabled={linea.cantidad >= 20}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 active:scale-95"
                            aria-label="Sumar una unidad"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => quitarLinea(linea.productoId, linea.observacion)}
                          className="min-h-[36px] min-w-[36px] rounded-lg border border-neutral-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center active:scale-95"
                          title="Quitar línea del pedido"
                          aria-label="Quitar línea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-neutral-200/80 bg-[#FAF7F4] shrink-0 flex justify-between items-center">
              <div>
                <span className="text-xs text-[#7C6F66] block">Total Pedido:</span>
                <span className="font-extrabold text-base text-[#2C1A0E] tabular-nums">
                  S/ {totalCalculado.toFixed(2)}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => setDrawerMovilAbierto(false)}
                className="bg-[#482813] hover:bg-[#341b0b] text-white text-xs px-5 py-2.5 min-h-[44px]"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALES DE APOYO */}
      <NotaObservacionModal
        isOpen={modalNotaOpen}
        onClose={() => setModalNotaOpen(false)}
        productoNombre={lineaParaNota?.nombre || 'Plato'}
        observacionActual={lineaParaNota?.observacion || ''}
        onGuardar={guardarNota}
      />

      <PedidoDescartarModal
        isOpen={modalDescartarOpen}
        onClose={() => setModalDescartarOpen(false)}
        onConfirmarDescarte={descartarPedido}
      />

      {/* Vista 8.2: Confirmación con COBRAR AHORA, NUEVO PEDIDO y VER PEDIDOS (RV-74) */}
      <PedidoLlevarConfirmacionModal
        isOpen={modalExitoOpen}
        numeroPedido={exitoData?.numeroPedido || 0}
        referencia={exitoData?.referencia}
        total={exitoData?.total || 0}
        onCobrarAhora={() => {
          setModalExitoOpen(false);
          if (exitoData?.pedidoId && onNavigateToCobro) {
            onNavigateToCobro(exitoData.pedidoId);
          } else if (onVolver) {
            onVolver();
          }
        }}
        onNuevoPedido={iniciarNuevoPedido}
        onVerPedidos={() => {
          setModalExitoOpen(false);
          if (onVolver) onVolver();
        }}
      />
    </div>
  );
};

export default PedidoLlevarPage;
