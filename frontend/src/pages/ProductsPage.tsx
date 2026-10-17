import React, { useRef } from 'react';
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  RotateCcw,
  ShieldAlert,
  Edit2,
  PowerOff,
  Power,
  UtensilsCrossed
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { CategoriaProducto } from '../types/producto';
import { useProductsManagement } from '../hooks/useProductsManagement';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductConfirmModal } from '../components/ProductConfirmModal';

export interface ProductsPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ session, onLogout }) => {
  const {
    productos,
    total,
    pagina,
    setPagina,
    tamano,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    filtroEstado,
    setFiltroEstado,
    cargando,
    errorCarga,
    cargarProductos,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    productoResaltadoId,
    formModalOpen,
    setFormModalOpen,
    productoAEditar,
    confirmModalOpen,
    setConfirmModalOpen,
    confirmTipo,
    productoAConfirmar,
    procesandoConfirm,
    esAdmin,
    handleQuitarFiltros,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleGuardarProducto,
    handleAbrirConfirmacion,
    handleConfirmarAccion
  } = useProductsManagement({ session, onLogout });

  const nuevoBtnRef = useRef<HTMLButtonElement | null>(null);

  // Estandarización de badges de categoría (w-28 h-7 exactos)
  const obtenerEstiloCategoria = (categoria: CategoriaProducto) => {
    switch (categoria) {
      case 'Desayuno':
        return 'bg-amber-50 text-amber-900 border-amber-200/90';
      case 'Almuerzo':
        return 'bg-orange-50 text-orange-900 border-orange-200/90';
      case 'Otro':
        return 'bg-sky-50 text-sky-900 border-sky-200/90';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  // RN-23: Si un no-administrador intenta acceder por URL o prop
  if (!esAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto text-sm">
          No tiene permiso para usar esta función. (MSG-39). Comuníquese con la administradora si requiere acceso al módulo de productos.
        </p>
      </div>
    );
  }

  const totalPaginas = Math.ceil(total / tamano) || 1;
  const hayFiltrosActivos =
    busqueda.trim() !== '' || filtroCategoria !== 'Todas' || filtroEstado !== 'Todos';

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-7xl mx-auto w-full gap-4">
      {/* Toast Alert / Banner de Éxito (shrink-0) */}
      {avisoExito && (
        <div className="shrink-0 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{avisoExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setAvisoExito(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Toast Alert / Banner de Error (shrink-0) */}
      {avisoError && (
        <div className="shrink-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{avisoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAvisoError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Encabezado Superior ESTÁTICO Y FIJO (shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-0.5">
            GESTIÓN DE LA CARTA
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#482813] tracking-tight">
            Productos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Administre los productos de la carta, sus categorías, precios y disponibilidad en el sistema.
          </p>
        </div>

        <button
          ref={nuevoBtnRef}
          type="button"
          onClick={() => handleAbrirNuevo(nuevoBtnRef.current)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white font-semibold text-sm shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda ESTÁTICA Y FIJA (shrink-0) */}
      <div className="shrink-0 bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        {/* Search Input with Debounce 300ms (RV-22) */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            maxLength={50}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por nombre de producto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors"
          />
        </div>

        {/* Filter Category */}
        <div className="w-full sm:w-48">
          <select
            value={filtroCategoria}
            onChange={(e) => {
              setFiltroCategoria(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por categoría"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Desayuno">Desayunos</option>
            <option value="Almuerzo">Almuerzos</option>
            <option value="Otro">Otros</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="w-full sm:w-40">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por estado"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Contenedor Blanco de la Tabla: Ocupa el espacio restante */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
        {/* Error de carga (MSG-67) */}
        {errorCarga ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-medium text-neutral-700">{errorCarga}</p>
            <button
              type="button"
              onClick={cargarProductos}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : cargando ? (
          /* Estado de Carga con cabecera y skeleton */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="shrink-0 px-6 py-2.5 bg-amber-50/60 border-b border-amber-100/80 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-neutral-700">Cargando productos…</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">Actualizando lista</span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        PRODUCTO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        CATEGORÍA
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 text-right border-b border-neutral-200/80">
                        PRECIO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        ESTADO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 text-right border-b border-neutral-200/80">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-100" />
                            <div className="h-4 bg-neutral-200 rounded w-48" />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-28 h-7 bg-neutral-100 rounded-lg" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="h-4 bg-neutral-200 rounded w-16 ml-auto" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-neutral-200 rounded w-16" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="h-8 bg-neutral-100 rounded-lg w-20 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3 animate-pulse"
                  >
                    <div className="h-5 bg-neutral-200 rounded w-40" />
                    <div className="h-4 bg-neutral-100 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : productos.length === 0 ? (
          /* Sin Resultados (MSG-65 o MSG-66) */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto">
              <FilterX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                {hayFiltrosActivos
                  ? 'No se encontraron productos con ese criterio.'
                  : 'No hay productos registrados en la carta.'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {hayFiltrosActivos
                  ? 'Pruebe con otro nombre o quite los filtros. (MSG-66)'
                  : 'Haga clic en "Nuevo producto" para crear el primero. (MSG-65)'}
              </p>
            </div>
            {hayFiltrosActivos ? (
              <button
                type="button"
                onClick={handleQuitarFiltros}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <span>Quitar filtros</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAbrirNuevo(nuevoBtnRef.current)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo producto</span>
              </button>
            )}
          </div>
        ) : (
          /* Tabla y Tarjetas */
          <>
            {/* Contenedor con Scroll Confinado y Barra Personalizada Sutil */}
            <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
              {/* VISTA DESKTOP (>= lg) */}
              <div className="hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        PRODUCTO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        CATEGORÍA
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 text-right border-b border-neutral-200/80">
                        PRECIO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 border-b border-neutral-200/80">
                        ESTADO
                      </th>
                      <th className="sticky top-0 bg-neutral-50/90 backdrop-blur-xs z-10 py-3.5 px-6 text-right border-b border-neutral-200/80">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {productos.map((prod) => {
                      const estaResaltado = productoResaltadoId === prod.id;

                      return (
                        <tr
                          key={prod.id}
                          className={`transition-colors ${
                            estaResaltado
                              ? 'bg-amber-100/60 font-medium'
                              : 'hover:bg-neutral-50/60'
                          }`}
                        >
                          {/* Nombre del Producto */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] text-[#D35400] font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                                <UtensilsCrossed className="w-4 h-4" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-900">
                                  {prod.nombre}
                                </span>
                                {estaResaltado && (
                                  <span className="text-[10px] bg-[#D35400] text-white px-1.5 py-0.5 rounded-full font-bold">
                                    Nuevo
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Categoría Pill estandarizada w-28 h-7 */}
                          <td className="py-4 px-6">
                            <span
                              className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border ${obtenerEstiloCategoria(
                                prod.categoria
                              )} text-center shadow-2xs`}
                            >
                              {prod.categoria}
                            </span>
                          </td>

                          {/* Precio */}
                          <td className="py-4 px-6 text-right font-mono font-semibold text-neutral-900">
                            S/ {prod.precio.toFixed(2)}
                          </td>

                          {/* Estado Indicator */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  prod.activo ? 'bg-emerald-500' : 'bg-neutral-400'
                                }`}
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  prod.activo ? 'text-emerald-700' : 'text-neutral-500'
                                }`}
                              >
                                {prod.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>

                          {/* Acciones: Botones cuadrados compactos (w-8 h-8 / 32x32 px) */}
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Botón Editar */}
                              <button
                                type="button"
                                onClick={(e) => handleAbrirEditar(prod, e.currentTarget)}
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                                title="Editar"
                                aria-label="Editar"
                              >
                                <Edit2 className="w-4 h-4 text-neutral-600" />
                              </button>

                              {/* Botón dinámico Desactivar / Activar */}
                              {prod.activo ? (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleAbrirConfirmacion(prod, 'desactivar', e.currentTarget)
                                  }
                                  title="Desactivar"
                                  aria-label="Desactivar"
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[#B84600] transition-colors shadow-2xs cursor-pointer"
                                >
                                  <PowerOff className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleAbrirConfirmacion(prod, 'activar', e.currentTarget)
                                  }
                                  title="Activar"
                                  aria-label="Activar"
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* VISTA MÓVIL / TABLET (< lg): Tarjetas Responsivas */}
              <div className="lg:hidden p-4 space-y-3">
                {productos.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-base text-neutral-900">
                          {prod.nombre}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Categoría: <strong className="text-neutral-800">{prod.categoria}</strong>
                        </p>
                      </div>

                      <span
                        className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border ${obtenerEstiloCategoria(
                          prod.categoria
                        )} text-center shadow-2xs`}
                      >
                        {prod.categoria}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div className="text-sm">
                        <span className="text-xs text-neutral-500 mr-1.5">Precio:</span>
                        <strong className="text-base font-mono text-[#D35400]">
                          S/ {prod.precio.toFixed(2)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleAbrirEditar(prod, e.currentTarget)}
                          title="Editar"
                          aria-label="Editar"
                          className="px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold inline-flex items-center gap-1.5 min-h-[40px] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) =>
                            handleAbrirConfirmacion(
                              prod,
                              prod.activo ? 'desactivar' : 'activar',
                              e.currentTarget
                            )
                          }
                          title={prod.activo ? 'Desactivar' : 'Activar'}
                          aria-label={prod.activo ? 'Desactivar' : 'Activar'}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                            prod.activo
                              ? 'border-amber-200 bg-amber-50 text-[#D35400] hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {prod.activo ? (
                            <>
                              <PowerOff className="w-3.5 h-3.5" />
                              <span>Desactivar</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5" />
                              <span>Activar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Footer matching UsersPage */}
            <div className="shrink-0 px-6 py-3.5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 bg-white">
              <p>
                Mostrando{' '}
                <span className="font-semibold text-neutral-700">
                  {productos.length}
                </span>{' '}
                de <span className="font-semibold text-neutral-700">{total}</span>{' '}
                productos
              </p>

              <div className="flex items-center gap-3">
                <span className="text-neutral-500">
                  Página <span className="font-semibold text-neutral-700">{pagina}</span> de{' '}
                  <span className="font-semibold text-neutral-700">{totalPaginas}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina <= 1}
                    aria-label="Página anterior"
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    aria-label="Página siguiente"
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modales del CUS04 */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleGuardarProducto}
        producto={productoAEditar}
      />

      <ProductConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmarAccion}
        producto={productoAConfirmar}
        tipo={confirmTipo}
        procesando={procesandoConfirm}
      />
    </div>
  );
};

export default ProductsPage;
