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
  ArrowLeft,
  Utensils,
  UtensilsCrossed,
  Copy
} from 'lucide-react';
import { usePedidoLlevarManagement } from '../hooks/usePedidoLlevarManagement';
import {
  NotaObservacionModal,
  PedidoDescartarModal,
  PedidoLlevarConfirmacionModal,
  MenuItemSelectableCard
} from '../components/pedidos';
import { ArmarMenuCompletoModal } from '../components/menu-dia';
import { Button } from '../components/ui';
import type { UserSession } from '../types/auth';
import type { MenuCompletoDia } from '../types/menuDia';

interface PedidoLlevarPageProps {
  session: UserSession;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onVolver?: () => void;
  onNavigateToCobro?: (pedidoId: string) => void;
  onNavigateToMenuDia?: () => void;
}

export const PedidoLlevarPage: React.FC<PedidoLlevarPageProps> = ({
  session,
  onLogout,
  onVolver,
  onNavigateToCobro,
  onNavigateToMenuDia,
}) => {
  const {
    cargando,
    registrando,
    errorGeneral,
    erroresLineas,
    catalogoFiltrado,
    menusCompletos,
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
    agregarMenuCompleto,
    repetirLinea,
    disminuirProducto,
    disminuirLinea,
    quitarLineaByIndex,
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
    menuDefinido,
    recargarCatalogo
  } = usePedidoLlevarManagement({
    token: session.token,
    onLogout
  });

  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDia | null>(null);
  const [modalArmarOpen, setModalArmarOpen] = useState(false);

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
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#B84500] flex items-center justify-center animate-spin mb-4">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <p className="font-sans font-bold text-lg text-[#2C1A0E]">Cargando carta para llevar…</p>
        <p className="text-xs text-[#7C6F66] mt-1">Consultando disponibilidad de productos</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3">
      {/* 1. Encabezado Fijo del Módulo */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Pedido para Llevar
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              Para llevar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Registre el pedido para llevar del cliente y envíe la comanda a cocina.
          </p>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setModalDescartarOpen(true)}
            disabled={lineasBorrador.length === 0}
            className="text-xs px-3 py-2 min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Limpiar Borrador
          </Button>

          {onVolver && (
            <Button
              type="button"
              variant="secondary"
              onClick={onVolver}
              className="text-xs px-3 py-2 min-h-[38px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Volver a Mesas
            </Button>
          )}
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
            onClick={() => recargarCatalogo()}
            className="text-rose-500 hover:text-rose-800 text-base leading-none p-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. CUERPO PRINCIPAL: VISTA DIVIDIDA (CATÁLOGO A LA IZQUIERDA / TICKET A LA DERECHA) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 lg:min-h-[640px] lg:h-[calc(100vh-140px)]">
        {/* PANEL IZQUIERDO: Búsqueda, Categorías y Grilla de Productos */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
          {/* Barra de Filtros y Búsqueda */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plato o bebida..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 text-[#2C1A0E] placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] transition-all"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 text-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Campo Referencia del Cliente integrado (en la misma posición del selector de mesa) */}
            <div className="w-full sm:w-72 shrink-0 relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="referencia-cliente"
                type="text"
                value={referencia}
                onChange={(e) => handleCambioReferencia(e.target.value)}
                maxLength={30}
                placeholder="Referencia cliente (opcional)..."
                className={`w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border bg-white text-[#2C1A0E] placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 transition-all ${
                  errorReferencia
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
                    : 'border-neutral-200 focus:ring-[#D35400]/20 focus:border-[#D35400]'
                }`}
              />
            </div>
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
            {!menuDefinido ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#B84500] flex items-center justify-center mx-auto border border-amber-200 mb-4 shadow-2xs">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-sans font-bold text-[#2C1A0E] mb-2">
                  El menú del día aún no está definido
                </h3>
                {session.rol === 'Administrador' ? (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Para habilitar la toma de pedidos para llevar, primero debe configurar y publicar el menú del día de hoy.
                    </p>
                    {onNavigateToMenuDia && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={onNavigateToMenuDia}
                        className="mx-auto !w-auto px-6 py-2.5 text-xs font-bold shadow-md cursor-pointer"
                      >
                        Ir a definir Menú del Día
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm text-center">
                    <p className="font-semibold text-amber-950">
                      Solicite a la administradora que publique el menú de hoy para comenzar a tomar pedidos
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      No es posible registrar comandas para llevar hasta que el menú diario esté activo.
                    </p>
                  </div>
                )}
              </div>
            ) : catalogoFiltrado.length === 0 && (categoriaActiva !== 'Menús Completos' && menusCompletos.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                <Utensils className="w-12 h-12 stroke-[1.5] mb-3 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-600">
                  No hay productos disponibles en esta sección
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  {busqueda
                    ? 'No se encontraron platos que coincidan con la búsqueda.'
                    : 'Avise a la administración para habilitar productos en la carta o menú del día.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {/* Bloque de Menús Completos de Hoy */}
                {menusCompletos.length > 0 &&
                  (categoriaActiva === 'Todas' || categoriaActiva === 'Menús Completos') &&
                  (!busqueda || menusCompletos.some((m) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))) && (
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-[#B84500] mb-2.5 flex items-center gap-2 font-sans">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Menús Completos de Hoy</span>
                      <div className="h-px bg-amber-200 flex-1" />
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                      {menusCompletos
                        .filter((mc) => !busqueda || mc.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                        .map((mc) => {
                          const cantEnBorrador = lineasBorrador
                            .filter((l) => l.menuCompletoId === mc.id)
                            .reduce((sum, l) => sum + l.cantidad, 0);

                          return (
                            <div
                              key={mc.id}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between relative ${
                                !mc.disponible
                                  ? 'bg-neutral-100/70 border-neutral-300/80 text-neutral-500 select-none opacity-75'
                                  : cantEnBorrador > 0
                                  ? 'bg-amber-50/50 border-[#D35400] shadow-xs'
                                  : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                              }`}
                            >
                              {cantEnBorrador > 0 && mc.disponible && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#D35400] text-white text-xs font-bold flex items-center justify-center shadow-xs z-10 font-sans tabular-nums">
                                  {cantEnBorrador}
                                </span>
                              )}
                              <div>
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <h4 className="font-bold text-sm sm:text-base text-[#2C1A0E] font-sans break-words line-clamp-2 leading-snug" title={mc.nombre}>
                                    {mc.nombre}
                                  </h4>
                                  <span className="font-bold text-sm text-[#B84500] font-sans tabular-nums whitespace-nowrap ml-1">
                                    S/ {mc.precio.toFixed(2)}
                                  </span>
                                </div>
                                {mc.incluye && (
                                  <p className="text-xs text-[#7C6F66] font-sans mb-1.5 break-words line-clamp-2">
                                    Incluye: {mc.incluye}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {mc.partes.map((p) => (
                                    <span
                                      key={p.id}
                                      className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium font-sans"
                                    >
                                      {p.nombre}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-neutral-100 mt-1 flex items-center justify-between gap-2">
                                {!mc.disponible ? (
                                  <span
                                    className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 w-full text-center font-sans"
                                    title={mc.motivoNoDisponible || undefined}
                                  >
                                    No disponible hoy
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuParaArmar(mc);
                                      setModalArmarOpen(true);
                                    }}
                                    className="w-full py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#B84500] border border-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-sans"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Armar menú</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {categoriaActiva !== 'Menús Completos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                {catalogoFiltrado.map((prod) => {
                  const enBorrador = lineasBorrador.filter((l) => l.productoId === prod.id);
                  const cantidadEnBorrador = enBorrador.reduce((s, l) => s + l.cantidad, 0);

                  return (
                    <MenuItemSelectableCard
                      key={prod.id}
                      id={prod.id}
                      nombre={prod.nombre}
                      categoria={prod.categoria}
                      precio={prod.precio}
                      cantEnBorrador={cantidadEnBorrador}
                      esAgotado={prod.agotado}
                      onAgregar={() => agregarProducto(prod)}
                      onDisminuir={() => disminuirProducto(prod.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

        {/* PANEL DERECHO: RESUMEN DEL PEDIDO / TICKET (DESKTOP) */}
        <div className="hidden lg:flex w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px] shrink-0 flex-col min-h-0 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          {/* Cabecera del Ticket */}
          <div className="p-4 border-b border-neutral-200/80 bg-[#FAF7F4] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B84500]" />
              <div>
                <h3 className="font-sans font-bold text-base text-[#2C1A0E]">
                  Pedido para Llevar
                </h3>
                <p className="text-xs text-[#7C6F66]">
                  {lineasBorrador.length} ítems • {cantidadTotalProductos} platos
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#482813] border border-amber-200/80">
              Para Llevar
            </span>
          </div>

          {/* Lista de Líneas en Borrador */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
            {lineasBorrador.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F4] border border-neutral-200 flex items-center justify-center text-neutral-300 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-neutral-500">
                  No hay productos en el pedido para llevar
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                  Toque el botón + de cualquier producto de la carta para agregarlo a la comanda.
                </p>
              </div>
            ) : (
              lineasBorrador.map((linea, index) => {
                const tieneError = Boolean(erroresLineas[linea.productoId || ''] || linea.agotado);

                return (
                  <div
                    key={`${linea.productoId || linea.menuCompletoId}-${linea.observacion}-${index}`}
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
                        {linea.elecciones && linea.elecciones.length > 0 && (
                          <span className="text-xs text-[#7C6F66] italic block mt-0.5 font-sans line-clamp-2">
                            {linea.elecciones.map((e) => e.productoNombre).join(' + ')}
                            {linea.incluye ? ` (incluye ${linea.incluye})` : ''}
                          </span>
                        )}
                        <span className="text-xs text-[#7C6F66] tabular-nums whitespace-nowrap">
                          {linea.cantidad} × S/ {linea.precioUnitario.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#2C1A0E] tabular-nums whitespace-nowrap">
                        S/ {linea.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Alerta si el plato se agotó en cocina (409 Conflict) */}
                    {tieneError && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/80 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{erroresLineas[linea.productoId || ''] || 'Plato marcado como agotado.'}</span>
                      </div>
                    )}

                    {/* Observación / Nota del plato */}
                    {linea.observacion && (
                      <div className="mt-2 text-xs text-amber-950 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2">
                        <span className="truncate italic font-medium">Nota: "{linea.observacion}"</span>
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          className="text-[#B84500] font-bold text-xs hover:underline shrink-0 cursor-pointer"
                          title="Editar nota del plato"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    {/* Controles de línea: Botón "+ Nota" a la izquierda y Controles de Cantidad (+/-) a la derecha */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          title={linea.observacion ? `Editar observación: "${linea.observacion}"` : 'Agregar nota de preparación (máx 100 caracteres)'}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                            linea.observacion
                              ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200'
                              : 'bg-white border-amber-300/80 text-[#B84500] hover:bg-amber-50 hover:border-[#D35400]'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                        </button>

                        {/* Botón Repetir (RV-165) para Menús Completos */}
                        {linea.menuCompletoId && (
                          <button
                            type="button"
                            onClick={() => repetirLinea(index)}
                            disabled={linea.cantidad >= 20}
                            title="Repetir esta misma combinación de menú completo"
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-[#B84500] border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-sans disabled:opacity-40"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Repetir</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Control de cantidad rápido + / - */}
                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => disminuirLinea(index)}
                            className="w-7 h-7 rounded-l-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer active:scale-95"
                            aria-label="Restar una unidad"
                            title="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#2C1A0E] tabular-nums select-none">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => repetirLinea(index)}
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
                          onClick={() => quitarLineaByIndex(index)}
                          className="w-7 h-7 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
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
                  <span className="text-xs font-semibold text-[#B84500] block truncate max-w-[140px]">
                    Cliente: {referencia.trim()}
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-[#2C1A0E] tabular-nums">
                S/ {totalCalculado.toFixed(2)}
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={
                !menuDefinido ||
                registrando ||
                lineasBorrador.length === 0 ||
                Boolean(errorReferencia) ||
                lineasBorrador.some((l) => l.agotado)
              }
              onClick={registrarPedidoLlevar}
              className="w-full min-h-[48px] text-xs font-bold bg-[#C74E00] hover:bg-[#B84600] text-white shadow-md flex items-center justify-center gap-2"
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
            <span className="text-xs font-bold text-[#B84500]">
              {cantidadTotalProductos} productos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500 truncate">
              {referencia.trim() || 'Para llevar'}
            </span>
          </div>
          <div className="text-base font-bold text-[#2C1A0E] tabular-nums">
            Total S/ {totalCalculado.toFixed(2)}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={
            !menuDefinido ||
            registrando ||
            lineasBorrador.length === 0 ||
            Boolean(errorReferencia) ||
            lineasBorrador.some((l) => l.agotado)
          }
          onClick={registrarPedidoLlevar}
          className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-[#C74E00] hover:bg-[#B84600] text-white shadow-md shrink-0 flex items-center gap-1.5"
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
                <ShoppingBag className="w-5 h-5 text-[#B84500]" />
                <h3 className="font-sans font-bold text-base text-[#2C1A0E]">
                  Detalle del Pedido ({lineasBorrador.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerMovilAbierto(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-700 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
              {lineasBorrador.map((linea, idx) => {
                const tieneError = Boolean(erroresLineas[linea.productoId || ''] || linea.agotado);
                return (
                  <div
                    key={`${linea.productoId || linea.menuCompletoId}-${linea.observacion}-${idx}`}
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
                        {linea.elecciones && linea.elecciones.length > 0 && (
                          <span className="text-xs text-[#7C6F66] italic block mt-0.5 font-sans line-clamp-2">
                            {linea.elecciones.map((e) => e.productoNombre).join(' + ')}
                            {linea.incluye ? ` (incluye ${linea.incluye})` : ''}
                          </span>
                        )}
                        <span className="text-xs text-[#7C6F66] tabular-nums whitespace-nowrap">
                          {linea.cantidad} × S/ {linea.precioUnitario.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#2C1A0E] tabular-nums whitespace-nowrap">
                        S/ {linea.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {tieneError && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/80 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{erroresLineas[linea.productoId || ''] || 'Plato marcado como agotado.'}</span>
                      </div>
                    )}

                    {linea.observacion && (
                      <div className="mt-2 text-xs text-amber-950 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2">
                        <span className="truncate italic font-medium">Nota: "{linea.observacion}"</span>
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          className="text-[#B84500] font-bold text-xs hover:underline shrink-0 cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => abrirModalNota(linea)}
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                            linea.observacion
                              ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                              : 'bg-white border-amber-300/80 text-[#B84500]'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                        </button>

                        {/* Botón Repetir (RV-165) para Menús Completos en móvil */}
                        {linea.menuCompletoId && (
                          <button
                            type="button"
                            onClick={() => repetirLinea(idx)}
                            disabled={linea.cantidad >= 20}
                            title="Repetir esta misma combinación de menú completo"
                            className="min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-[#B84500] border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-sans disabled:opacity-40"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Repetir</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => disminuirLinea(idx)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95"
                            aria-label="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#2C1A0E] tabular-nums select-none">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => repetirLinea(idx)}
                            disabled={linea.cantidad >= 20}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 active:scale-95"
                            aria-label="Sumar una unidad"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => quitarLineaByIndex(idx)}
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
                <span className="font-bold text-base text-[#2C1A0E] tabular-nums whitespace-nowrap">
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

      {/* Modal para armar Menú Completo (RV-163 / RV-165) */}
      <ArmarMenuCompletoModal
        isOpen={modalArmarOpen}
        onClose={() => {
          setModalArmarOpen(false);
          setMenuParaArmar(null);
        }}
        menu={menuParaArmar}
        onConfirm={(elecciones, obs) => {
          if (menuParaArmar) {
            agregarMenuCompleto(menuParaArmar, elecciones, obs);
            setModalArmarOpen(false);
            setMenuParaArmar(null);
          }
        }}
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
    </div>
  );
};

export default PedidoLlevarPage;

