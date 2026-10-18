import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Search,
  ShoppingBag,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { usePedidoMesaManagement } from '../hooks/usePedidoMesaManagement';
import { NotaObservacionModal } from '../components/NotaObservacionModal';
import { PedidoDescartarModal } from '../components/PedidoDescartarModal';
import { PedidoConfirmacionModal } from '../components/PedidoConfirmacionModal';
import { Button } from '../components/Button';
import type { UserSession } from '../types/auth';

interface PedidoMesaPageProps {
  session: UserSession;
  mesaIdInicial?: string | null;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onVolverAMesas: () => void;
}

export const PedidoMesaPage: React.FC<PedidoMesaPageProps> = ({
  session,
  mesaIdInicial,
  onLogout,
  onVolverAMesas,
}) => {
  const {
    cargando,
    registrando,
    errorGeneral,
    setErrorGeneral,
    erroresLineas,
    catalogo,
    mesasLibres,
    mesaSeleccionada,
    setMesaSeleccionada,
    modo,
    pedidoExistente,
    lineasBorrador,
    notas,
    setNotas,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalExitoOpen,
    exitoData,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    agregarProducto,
    disminuirProducto,
    actualizarCantidad,
    quitarLinea,
    abrirModalNota,
    guardarNota,
    solicitarDescarte,
    confirmarDescarte,
    reiniciarParaNuevoPedido,
    totalCalculado,
    totalGeneralConExistente,
    cantidadTotalProductos,
    registrarPedido
  } = usePedidoMesaManagement({
    token: session.token,
    mesaIdInicial,
    onLogout,
  });

  // Visibilidad del resumen en dispositivos móviles (drawer / bottom sheet)
  const [drawerMovilAbierto, setDrawerMovilAbierto] = useState(false);

  // Categorías presentes en el catálogo
  const categorias = ['Todas', ...Array.from(new Set(catalogo.map((p) => p.categoria)))];

  // Lista de mesas para el selector garantizando que la mesa seleccionada esté incluida
  const opcionesMesas = React.useMemo(() => {
    if (
      mesaSeleccionada &&
      !mesasLibres.some((m) => String(m.id).toLowerCase() === String(mesaSeleccionada.id).toLowerCase())
    ) {
      return [mesaSeleccionada, ...mesasLibres];
    }
    return mesasLibres;
  }, [mesasLibres, mesaSeleccionada]);

  // Catálogo filtrado por categoría y búsqueda
  const catalogoFiltrado = catalogo.filter((prod) => {
    const coincideCat = categoriaActiva === 'Todas' || prod.categoria === categoriaActiva;
    const coincideBusqueda =
      busqueda.trim() === '' ||
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase().trim());
    return coincideCat && coincideBusqueda;
  });

  // Agrupación por categoría si está en "Todas"
  const productosPorCategoria: Record<string, typeof catalogo> = {};
  catalogoFiltrado.forEach((prod) => {
    if (!productosPorCategoria[prod.categoria]) {
      productosPorCategoria[prod.categoria] = [];
    }
    productosPorCategoria[prod.categoria].push(prod);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden gap-4">
      {/* 1. Encabezado Fijo del Módulo sobre fondo crema */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7C6F66] mb-1">
            <button
              onClick={onVolverAMesas}
              className="hover:text-[#D35400] transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Mesas</span>
            </button>
            <span>•</span>
            <span className="font-bold uppercase tracking-wider text-[#D35400] text-[11px]">
              OPERACIÓN DE SALÓN
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
              Pedido de Mesa
            </h1>
            {mesaSeleccionada && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {mesaSeleccionada.nombre}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              {modo === 'ampliacion' ? 'Ampliación' : 'Nuevo pedido'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Seleccione la mesa y los productos de la carta para generar la comanda a cocina.
          </p>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={solicitarDescarte}
            disabled={lineasBorrador.length === 0}
            className="text-xs px-3 py-2 min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Limpiar Borrador
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onVolverAMesas}
            className="text-xs px-3 py-2 min-h-[38px]"
          >
            Volver a Mesas
          </Button>
        </div>
      </div>

      {/* Alerta de Error General si existiera */}
      {errorGeneral && (
        <div className="shrink-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorGeneral}</span>
          </div>
          <button
            onClick={() => setErrorGeneral(null)}
            className="text-rose-500 hover:text-rose-800 text-base leading-none p-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. CUERPO PRINCIPAL: VISTA DIVIDIDA (CATÁLOGO A LA IZQUIERDA / TICKET A LA DERECHA) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 overflow-hidden">
        {/* PANEL IZQUIERDO: Búsqueda, Categorías y Grilla de Productos */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
          {/* Barra de Filtros y Búsqueda */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plato o bebida..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 text-[#2C1A0E] placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] transition-all"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Selector de Mesa Libre */}
            {modo === 'nuevo' ? (
              <div className="w-full sm:w-60 shrink-0">
                <select
                  value={mesaSeleccionada?.id || ''}
                  onChange={(e) => {
                    const m = opcionesMesas.find((item) => String(item.id).toLowerCase() === e.target.value.toLowerCase());
                    setMesaSeleccionada(m || null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-white text-[#2C1A0E] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] transition-all cursor-pointer shadow-2xs"
                >
                  <option value="">-- Seleccione Mesa Libre --</option>
                  {opcionesMesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} (Libre)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="w-full sm:w-60 shrink-0 flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <span className="truncate">Mesa: {mesaSeleccionada?.nombre || 'Mesa'}</span>
              </div>
            )}
          </div>

          {/* Pastillas de Categorías */}
          <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaActiva(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  categoriaActiva === cat
                    ? 'bg-[#482813] text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-[#7C6F66] hover:text-[#2C1A0E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grilla con Scroll Interno Confinado */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 animate-pulse h-28 flex flex-col justify-between"
                  >
                    <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                    <div className="h-8 bg-neutral-200 rounded-lg w-full" />
                  </div>
                ))}
              </div>
            ) : catalogoFiltrado.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <Utensils className="w-12 h-12 stroke-[1.5] mb-3 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-600">
                  No hay productos disponibles en esta sección
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  {busqueda
                    ? 'No se encontraron platos que coincidan con la búsqueda.'
                    : 'Avise a la administración para habilitar productos en la carta o menú del día.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(productosPorCategoria).map(([catNombre, prods]) => (
                  <div key={catNombre}>
                    {categoriaActiva === 'Todas' && (
                      <h3 className="text-xs uppercase font-bold tracking-wider text-[#7C6F66] mb-2.5 flex items-center gap-2">
                        <span>{catNombre}</span>
                        <div className="h-px bg-neutral-200 flex-1" />
                      </h3>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {prods.map((prod) => {
                        const cantEnBorrador = lineasBorrador
                          .filter((l) => l.productoId === prod.id)
                          .reduce((sum, l) => sum + l.cantidad, 0);

                        const esAgotado = prod.agotado || !prod.disponible;

                        return (
                          <div
                            key={prod.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between relative ${
                              esAgotado
                                ? 'bg-neutral-100/70 border-neutral-300/80 text-neutral-400 select-none opacity-65'
                                : cantEnBorrador > 0
                                ? 'bg-amber-50/40 border-[#D35400] shadow-xs'
                                : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Insignia de Cantidad seleccionada */}
                            {cantEnBorrador > 0 && !esAgotado && (
                              <span className="absolute -top-2 -right-2 bg-[#D35400] text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                                {cantEnBorrador}
                              </span>
                            )}

                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-bold text-[#2C1A0E] leading-snug line-clamp-2">
                                  {prod.nombre}
                                </h4>
                                {esAgotado && (
                                  <span className="shrink-0 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                    Agotado
                                  </span>
                                )}
                              </div>
                              <span className="block text-xs text-[#7C6F66] mt-0.5">
                                {prod.categoria}
                              </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                              <span className="text-base font-extrabold text-neutral-800 tabular-nums">
                                S/ {prod.precio.toFixed(2)}
                              </span>

                              {/* Controles táctiles accesibles (mínimo 44px de área táctil) */}
                              <div className="flex items-center gap-1.5">
                                {cantEnBorrador > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => disminuirProducto(prod.id)}
                                    className="w-10 h-10 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                                    aria-label={`Disminuir ${prod.nombre}`}
                                    title="Disminuir cantidad"
                                  >
                                    <Minus className="w-4 h-4 stroke-[2.5]" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => agregarProducto(prod)}
                                  disabled={esAgotado}
                                  aria-disabled={esAgotado}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                    esAgotado
                                      ? 'bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed opacity-60'
                                      : 'bg-[#D35400] hover:bg-[#B84600] text-white shadow-xs cursor-pointer active:scale-95'
                                  }`}
                                  aria-label={`Agregar ${prod.nombre}`}
                                  title={esAgotado ? 'Plato agotado - No disponible' : 'Agregar plato al pedido'}
                                >
                                  <Plus className="w-5 h-5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: TICKET / RESUMEN DEL PEDIDO (Desktop) */}
        <div className="hidden lg:flex w-96 shrink-0 flex-col min-h-0 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          {/* Cabecera del Ticket */}
          <div className="p-4 border-b border-neutral-200/80 bg-[#FAF7F4] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D35400]" />
                <h3 className="font-sans font-bold text-base text-[#2C1A0E]">
                  {modo === 'ampliacion' ? 'Ampliación de Pedido' : 'Pedido de Mesa'}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#482813] border border-amber-200/80">
                {mesaSeleccionada?.nombre || 'Sin Mesa'}
              </span>
            </div>

            {/* Aviso de modo ampliación con datos anteriores */}
            {modo === 'ampliacion' && pedidoExistente && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex justify-between items-center">
                <span>Pedido #{pedidoExistente.numero} en curso</span>
                <span className="font-bold tabular-nums">Subtotal: S/ {pedidoExistente.total.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Lista de Líneas con Scroll Confinado */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
            {lineasBorrador.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.5] text-neutral-300 mb-2" />
                <p className="text-xs font-medium text-neutral-500">
                  No hay productos en el pedido
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Toque el botón + de cualquier producto del catálogo para agregarlo.
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

                    {/* Alerta de plato agotado en vivo */}
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
                      {/* Botón compacto o ícono "+ Nota" */}
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
            {/* Notas generales del pedido (opcional, máx 100 caracteres - RN-35 / RV-67) */}
            {modo === 'nuevo' && (
              <div>
                <label htmlFor="notas-pedido-desktop" className="block text-[11px] font-semibold text-[#7C6F66] mb-1">
                  Notas generales del pedido (opcional):
                </label>
                <input
                  id="notas-pedido-desktop"
                  type="text"
                  maxLength={100}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Servir todo junto, sin cubiertos..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#D35400] text-[#2C1A0E]"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#7C6F66]">
                <span>Productos nuevos ({cantidadTotalProductos})</span>
                <span className="tabular-nums font-semibold">S/ {totalCalculado.toFixed(2)}</span>
              </div>
              {modo === 'ampliacion' && pedidoExistente && (
                <div className="flex justify-between text-xs text-[#7C6F66]">
                  <span>Consumo anterior</span>
                  <span className="tabular-nums">S/ {pedidoExistente.total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#2C1A0E] pt-1 border-t border-neutral-200">
                <span>Total a Cobrar</span>
                <span className="text-emerald-700 tabular-nums">
                  S/ {totalGeneralConExistente.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={
                registrando ||
                lineasBorrador.length === 0 ||
                !mesaSeleccionada ||
                lineasBorrador.some((l) => l.agotado)
              }
              onClick={() => registrarPedido(onVolverAMesas)}
              className="w-full min-h-[44px] py-3 text-sm font-bold bg-[#D35400] hover:bg-[#B84600] text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {registrando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{modo === 'ampliacion' ? 'AGREGAR AL PEDIDO' : 'REGISTRAR PEDIDO'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. BARRA INFERIOR FIJA PARA MÓVILES (BOTTOM SHEET / FOOTER) */}
      <div className="lg:hidden shrink-0 bg-white border-t border-neutral-200/80 p-3 shadow-lg flex items-center justify-between gap-3">
        <div
          onClick={() => setDrawerMovilAbierto(!drawerMovilAbierto)}
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#D35400]">
              {cantidadTotalProductos} productos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500">
              {mesaSeleccionada?.nombre || 'Sin mesa'}
            </span>
          </div>
          <div className="text-base font-extrabold text-[#2C1A0E] tabular-nums">
            Total S/ {totalGeneralConExistente.toFixed(2)}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={
            registrando ||
            lineasBorrador.length === 0 ||
            !mesaSeleccionada ||
            lineasBorrador.some((l) => l.agotado)
          }
          onClick={() => registrarPedido(onVolverAMesas)}
          className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-[#D35400] hover:bg-[#B84600] text-white shadow-md shrink-0 flex items-center gap-1.5"
        >
          {registrando ? (
            <span>Enviando…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{modo === 'ampliacion' ? 'AGREGAR' : 'REGISTRAR'}</span>
            </>
          )}
        </Button>
      </div>

      {/* MODAL / DRAWER MÓVIL PARA VER Y EDITAR LÍNEAS DEL PEDIDO */}
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
                onClick={() => setDrawerMovilAbierto(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700"
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
                    {/* Fila 1: Nombre del plato y Subtotal */}
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

                    {/* Alerta de plato agotado */}
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

            <div className="p-4 border-t border-neutral-200/80 bg-[#FAF7F4] shrink-0 space-y-3">
              {modo === 'nuevo' && (
                <div>
                  <label htmlFor="notas-pedido-movil" className="block text-[11px] font-semibold text-[#7C6F66] mb-1">
                    Notas generales del pedido (opcional):
                  </label>
                  <input
                    id="notas-pedido-movil"
                    type="text"
                    maxLength={100}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: Servir todo junto, sin cubiertos..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-[#2C1A0E] placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] transition-colors"
                  />
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-0.5">
                    <span>Anotaciones para cocina/salón</span>
                    <span className="tabular-nums">{notas.length}/100</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-1">
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
        onConfirmarDescarte={confirmarDescarte}
      />

      {exitoData && (
        <PedidoConfirmacionModal
          isOpen={modalExitoOpen}
          modo={modo}
          numeroPedido={exitoData.numeroPedido}
          mesaNombre={exitoData.mesaNombre}
          total={exitoData.total}
          onNuevoPedido={reiniciarParaNuevoPedido}
          onVerMesas={onVolverAMesas}
        />
      )}
    </div>
  );
};

export default PedidoMesaPage;
