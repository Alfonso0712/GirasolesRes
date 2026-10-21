import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Edit2,
  PowerOff,
  Power,
  UtensilsCrossed,
  Layers,
  BookOpen,
  Coffee,
  Soup,
  Sparkles,
  X,
  Loader2,
  DollarSign
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import {
  CATEGORIAS_PRODUCTO,
  CATEGORIA_BADGE_LABELS,
  ROL_LABELS
} from '../types/producto';
import type { MenuCompletoItem } from '../types/menuCompleto';
import {
  getMenusCompletosService,
  actualizarPrecioMenuCompletoService,
  cambiarEstadoMenuCompletoService
} from '../services/menuCompletoService';
import { useProductsManagement } from '../hooks/useProductsManagement';
import { ProductFormModal } from '../components/productos';
import { ProductConfirmModal } from '../components/productos';
import { StatusBadge, IconActionButton, TablePagination, DataTable, TableHead, TableBody } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';

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
    filtroTipo,
    setFiltroTipo,
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

  // Pestañas principales: "Catálogo de productos y componentes" vs "Menús completos (CUS04.5)"
  const [pestañaActiva, setPestañaActiva] = useState<'catalogo' | 'menus_completos'>('catalogo');

  // Estados de Menús Completos (CUS04.5)
  const [menusCompletos, setMenusCompletos] = useState<MenuCompletoItem[]>([]);
  const [cargandoMenus, setCargandoMenus] = useState(false);
  const [errorMenus, setErrorMenus] = useState<string | null>(null);

  // Modal para modificar precio de menú completo (RV-160)
  const [modalPrecioOpen, setModalPrecioOpen] = useState(false);
  const [menuParaPrecio, setMenuParaPrecio] = useState<MenuCompletoItem | null>(null);
  const [nuevoPrecioStr, setNuevoPrecioStr] = useState('');
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);

  // Modal para cambiar estado de menú completo (MSG-218)
  const [modalEstadoMenuOpen, setModalEstadoMenuOpen] = useState(false);
  const [menuParaEstado, setMenuParaEstado] = useState<MenuCompletoItem | null>(null);
  const [guardandoEstadoMenu, setGuardandoEstadoMenu] = useState(false);

  // Carga de menús completos desde el backend
  const cargarMenusCompletos = useCallback(async () => {
    if (!esAdmin) return;
    setCargandoMenus(true);
    setErrorMenus(null);
    try {
      const data = await getMenusCompletosService(false, session.token);
      setMenusCompletos(data || []);
    } catch (err: any) {
      setErrorMenus(err.message || 'No se pudieron cargar los menús completos.');
    } finally {
      setCargandoMenus(false);
    }
  }, [esAdmin, session.token]);

  useEffect(() => {
    if (pestañaActiva === 'menus_completos') {
      cargarMenusCompletos();
    }
  }, [pestañaActiva, cargarMenusCompletos]);

  // Manejador para abrir modal de precio de menú completo
  const handleAbrirModalPrecio = (menu: MenuCompletoItem) => {
    setMenuParaPrecio(menu);
    setNuevoPrecioStr(menu.precio.toFixed(2));
    setErrorPrecio(null);
    setModalPrecioOpen(true);
  };

  // Guardar nuevo precio de menú completo (RV-160)
  const handleGuardarPrecioMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuParaPrecio || guardandoPrecio) return;

    const precioNum = parseFloat(nuevoPrecioStr.trim().replace(',', '.'));
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorPrecio('El precio debe ser un número mayor a cero.');
      return;
    }
    if (precioNum > 999.99 || parseFloat(precioNum.toFixed(2)) !== precioNum) {
      setErrorPrecio('El precio no puede superar S/ 999.99 y acepta hasta dos decimales.');
      return;
    }

    setGuardandoPrecio(true);
    setErrorPrecio(null);

    try {
      await actualizarPrecioMenuCompletoService(
        menuParaPrecio.id,
        { precio: precioNum },
        session.token
      );
      setModalPrecioOpen(false);
      setAvisoExito('Menú completo actualizado correctamente.');
      await cargarMenusCompletos();
    } catch (err: any) {
      setErrorPrecio(err.message || 'No se pudo actualizar el precio del menú completo.');
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // Manejador para abrir modal de confirmación de estado de menú completo
  const handleAbrirModalEstadoMenu = (menu: MenuCompletoItem) => {
    setMenuParaEstado(menu);
    setModalEstadoMenuOpen(true);
  };

  // Confirmar cambio de estado de menú completo
  const handleConfirmarEstadoMenu = async () => {
    if (!menuParaEstado || guardandoEstadoMenu) return;

    setGuardandoEstadoMenu(true);
    try {
      await cambiarEstadoMenuCompletoService(
        menuParaEstado.id,
        { activo: !menuParaEstado.activo },
        session.token
      );
      setModalEstadoMenuOpen(false);
      setAvisoExito('Menú completo actualizado correctamente.');
      await cargarMenusCompletos();
    } catch (err: any) {
      setAvisoError(err.message || 'No se pudo cambiar el estado del menú completo.');
    } finally {
      setGuardandoEstadoMenu(false);
    }
  };

  // Estandarización de badges de categoría (w-28 h-7 exactos)
  const obtenerEstiloCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Desayuno':
        return 'bg-amber-50 text-amber-900 border-amber-200/90';
      case 'Almuerzo':
        return 'bg-orange-50 text-orange-900 border-orange-200/90';
      case 'PlatosExtras':
      case 'Platos Extras':
      case 'Platos Extras / A la Carta':
        return 'bg-rose-50 text-rose-900 border-rose-200/90';
      case 'Combinados':
        return 'bg-purple-50 text-purple-900 border-purple-200/90';
      case 'Bebidas':
      case 'Bebidas y Refrescos':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200/90';
      case 'Otro':
      case 'Otros':
        return 'bg-sky-50 text-sky-900 border-sky-200/90';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  // RN-23: Si un no-administrador intenta acceder por URL o prop
  if (!esAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50/50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Acceso Restringido</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Solo los usuarios con rol <strong className="text-neutral-900">Administrador</strong> tienen autorización para gestionar la carta del restaurante.
          </p>
        </div>
      </div>
    );
  }

  const totalPaginas = Math.ceil(total / tamano) || 1;
  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    filtroCategoria !== 'Todas' ||
    filtroEstado !== 'Todos' ||
    filtroTipo !== 'Todos';

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <PageContainer>
      {/* Toast / Alerta de Éxito (H-01 / RV-28) */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="shrink-0 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{avisoExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setAvisoExito(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Toast / Alerta de Error Temporal */}
      {avisoError && (
        <div
          role="alert"
          aria-live="assertive"
          className="shrink-0 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{avisoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAvisoError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 1. Encabezado Unificado */}
      <PageHeader
        title="Carta y Menús"
        subtitle="Administre productos de carta, componentes y los menús completos del restaurante."
        count={total}
        countLabel="ítems registrados"
        actions={
          pestañaActiva === 'catalogo' && (
            <button
              ref={nuevoBtnRef}
              type="button"
              onClick={() => handleAbrirNuevo(nuevoBtnRef.current)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#C74E00] hover:bg-[#B84500] text-white font-semibold text-xs shadow-2xs hover:shadow transition-all shrink-0 cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo producto</span>
            </button>
          )
        }
      />

      {/* Navegación por pestañas (Tabs): Catálogo vs Menús Completos */}
      <div className="shrink-0 border-b border-neutral-200 flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setPestañaActiva('catalogo')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            pestañaActiva === 'catalogo'
              ? 'border-[#D35400] text-[#B84500]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Productos y Componentes</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-600 tabular-nums">
            {total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva('menus_completos')}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            pestañaActiva === 'menus_completos'
              ? 'border-[#D35400] text-[#B84500]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Menús completos</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-semibold">
            3 configurados
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA 1: CATÁLOGO DE PRODUCTOS Y COMPONENTES                */}
      {/* ============================================================== */}
      {pestañaActiva === 'catalogo' && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <div className="shrink-0 bg-white rounded-2xl border border-neutral-200/80 px-3.5 py-2 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                maxLength={50}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar por nombre de producto o componente..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors"
              />
            </div>

            {/* Filter Tipo (Carta vs Componente) */}
            <div className="w-full sm:w-auto min-w-[170px]">
              <select
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setPagina(1);
                }}
                aria-label="Filtrar por tipo"
                className="w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Carta">Productos de carta</option>
                <option value="Componente">Componentes de menú</option>
              </select>
            </div>

            {/* Filter Category */}
            <div className="w-full sm:w-auto min-w-[170px]">
              <select
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                  setPagina(1);
                }}
                disabled={filtroTipo === 'Componente'}
                aria-label="Filtrar por categoría"
                className={`w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer ${
                  filtroTipo === 'Componente' ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''
                }`}
              >
                <option value="Todas">Todas las categorías</option>
                {CATEGORIAS_PRODUCTO.map((cat) => (
                  <option key={cat.valor} value={cat.valor}>
                    {cat.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="w-full sm:w-auto min-w-[170px]">
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setPagina(1);
                }}
                aria-label="Filtrar por estado"
                className="w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Contenedor de la Tabla con DataTable */}
          <DataTable
            loading={cargando}
            error={errorCarga}
            onRetry={cargarProductos}
            isEmpty={productos.length === 0}
            emptyTitle="No se encontraron productos o componentes"
            emptyMessage={
              hayFiltrosActivos
                ? 'No hay registros que coincidan con los filtros aplicados. Pruebe con otro nombre o quite los filtros.'
                : 'Aún no se han registrado productos ni componentes en el sistema.'
            }
            emptyActionLabel={hayFiltrosActivos ? 'Quitar filtros' : undefined}
            onEmptyAction={hayFiltrosActivos ? handleQuitarFiltros : undefined}
            minWidth="min-w-[800px]"
          >
            <TableHead>
              <tr>
                <th scope="col" className="py-3 px-4">PRODUCTO / COMPONENTE</th>
                <th scope="col" className="py-3 px-4">TIPO</th>
                <th scope="col" className="py-3 px-4">ROL / CATEGORÍA</th>
                <th scope="col" className="py-3 px-4 text-right">PRECIO</th>
                <th scope="col" className="py-3 px-4">ESTADO</th>
                <th scope="col" className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </TableHead>
            <TableBody>
                        {productos.map((prod) => {
                          const estaResaltado = prod.id === productoResaltadoId;
                          const esComponente = prod.tipo === 'Componente';

                          return (
                            <tr
                              key={prod.id}
                              className={`transition-colors border-b border-[#F0EBE6] hover:bg-neutral-50/60 ${
                                estaResaltado
                                  ? 'bg-amber-50/70 ring-2 ring-inset ring-[#D35400]/40'
                                  : ''
                              }`}
                            >
                              <td className="py-3 px-4 font-medium text-neutral-900">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      esComponente
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-[#B84500] border border-amber-200'
                                    }`}
                                  >
                                    {esComponente ? (
                                      <Layers className="w-4 h-4" />
                                    ) : (
                                      <UtensilsCrossed className="w-4 h-4" />
                                    )}
                                  </div>
                                  <span className="font-semibold text-[#2C1A0E] text-sm break-words">
                                    {prod.nombre}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    esComponente
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-neutral-100 text-neutral-800'
                                  }`}
                                >
                                  {esComponente ? 'Componente' : 'Carta'}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                {esComponente ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/90">
                                    Rol: {ROL_LABELS[prod.rol || ''] || prod.rol || 'Segundo'}
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border ${obtenerEstiloCategoria(
                                      prod.categoria || 'Otro'
                                    )} text-center shadow-2xs`}
                                  >
                                    {CATEGORIA_BADGE_LABELS[prod.categoria || ''] ||
                                      prod.categoria ||
                                      'Otro'}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right font-medium">
                                {prod.precio != null ? (
                                  <span className="text-[#2C1A0E] font-semibold text-sm tabular-nums whitespace-nowrap">
                                    S/ {prod.precio.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-stone-500 italic">
                                    En menú completo
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <StatusBadge
                                  status={prod.activo}
                                  activeLabel="Activo"
                                  inactiveLabel="Inactivo"
                                />
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="inline-flex items-center justify-center gap-1.5">
                                  <IconActionButton
                                    icon={Edit2}
                                    label="Editar producto o componente"
                                    onClick={(e) => handleAbrirEditar(prod, e.currentTarget)}
                                  />

                                  {prod.activo ? (
                                    <IconActionButton
                                      icon={PowerOff}
                                      label="Desactivar producto"
                                      variant="warning"
                                      onClick={(e) =>
                                        handleAbrirConfirmacion(
                                          prod,
                                          'desactivar',
                                          e.currentTarget
                                        )
                                      }
                                    />
                                  ) : (
                                    <IconActionButton
                                      icon={Power}
                                      label="Activar producto"
                                      variant="success"
                                      onClick={(e) =>
                                        handleAbrirConfirmacion(
                                          prod,
                                          'activar',
                                          e.currentTarget
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
            </TableBody>
          </DataTable>

          {/* Paginación Unificada */}
          <TablePagination
            currentPage={pagina}
            totalPages={totalPaginas}
            totalItems={total}
            itemsPerPage={tamano}
            entityName="ítems"
            onPageChange={setPagina}
          />
        </>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: MENÚS COMPLETOS                                     */}
      {/* ============================================================== */}
      {pestañaActiva === 'menus_completos' && (
        <div className="space-y-4">
          {errorMenus ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <p className="text-sm text-neutral-700 font-medium">{errorMenus}</p>
              <button
                type="button"
                onClick={cargarMenusCompletos}
                className="mt-3 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : cargandoMenus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
              {menusCompletos.map((m) => {
                const icono =
                  m.id === 1 ? (
                    <Coffee className="w-5 h-5 text-amber-700" />
                  ) : m.id === 2 ? (
                    <UtensilsCrossed className="w-5 h-5 text-orange-700" />
                  ) : (
                    <Soup className="w-5 h-5 text-rose-700" />
                  );

                return (
                  <div
                    key={m.id}
                    className={`bg-white rounded-2xl border p-6 xl:p-7 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                      m.activo ? 'border-neutral-200/90' : 'border-neutral-200 bg-neutral-50/70 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] border border-amber-900/10 flex items-center justify-center">
                            {icono}
                          </div>
                          <div>
                            <h3 className="font-sans font-bold text-base sm:text-lg lg:text-xl text-[#2C1A0E] leading-snug break-words">
                              {m.nombre}
                            </h3>
                            <span className="text-xs text-neutral-500 font-medium">
                              Fórmula #{m.id}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            m.activo
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}
                        >
                          {m.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {/* Precio */}
                      <div className="mt-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Precio actual
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-[#B84500]">S/</span>
                          <span className="text-2xl font-sans font-bold tabular-nums whitespace-nowrap text-[#B84500]">
                            {m.precio.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Incluye adicional */}
                      {m.incluye && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-lg font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Incluye: {m.incluye}</span>
                        </div>
                      )}

                      {/* Desglose de Partes que lo componen */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Componentes requeridos ({m.partes.length})
                        </p>
                        <div className="space-y-1.5">
                          {m.partes.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50/80 border border-neutral-100 text-neutral-700"
                            >
                              <span className="font-semibold flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs">
                                  {p.orden}
                                </span>
                                {p.nombre}
                              </span>
                              <span className="text-xs text-neutral-500 tabular-nums">
                                {p.rolesPermitidos.map((r) => ROL_LABELS[r] || r).join(' o ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Acciones del menú completo */}
                    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAbrirModalPrecio(m)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#D35400]"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-[#B84500]" />
                        <span>Modificar precio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirModalEstadoMenu(m)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          m.activo
                            ? 'bg-amber-50 text-[#B84500] border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {m.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {/* Modal para Modificar Precio de Menú Completo (CUS04.5 / RV-160) */}
      {modalPrecioOpen && menuParaPrecio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B84500] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-sans font-bold text-base text-[#482813]">
                  Modificar Precio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPrecioOpen(false)}
                className="modal-close-btn" aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarPrecioMenu} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Menú completo:</p>
                <p className="font-bold text-sm text-neutral-900">{menuParaPrecio.nombre}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Precio anterior: S/ {menuParaPrecio.precio.toFixed(2)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="nuevo-precio-menu"
                  className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
                >
                  Nuevo Precio (S/) <span className="text-[#B84500]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-semibold text-sm">
                    S/
                  </span>
                  <input
                    id="nuevo-precio-menu"
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    value={nuevoPrecioStr}
                    onChange={(e) => {
                      setNuevoPrecioStr(e.target.value);
                      if (errorPrecio) setErrorPrecio(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-sans font-medium focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 outline-none"
                    disabled={guardandoPrecio}
                  />
                </div>
                {errorPrecio && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errorPrecio}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  Mayor a S/ 0.00 y no superior a S/ 999.99.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPrecioOpen(false)}
                  disabled={guardandoPrecio}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPrecio}
                  className="px-4 py-2 rounded-xl bg-[#C74E00] hover:bg-[#B84600] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {guardandoPrecio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando…</span>
                    </>
                  ) : (
                    'Guardar precio'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Cambio de Estado de Menú Completo (MSG-218) */}
      {modalEstadoMenuOpen && menuParaEstado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 text-center">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
                menuParaEstado.activo ? 'bg-amber-50 text-[#B84500]' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {menuParaEstado.activo ? <PowerOff className="w-6 h-6" /> : <Power className="w-6 h-6" />}
            </div>

            <h3 className="font-sans font-bold text-lg text-[#2C1A0E] mb-2">
              {menuParaEstado.activo ? '¿Desactivar menú completo?' : '¿Activar menú completo?'}
            </h3>

            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              {menuParaEstado.activo
                ? `¿Desactivar el menú completo "${menuParaEstado.nombre}"? No se podrá pedir hasta activarlo, pero se conservará su historial.`
                : `¿Activar nuevamente "${menuParaEstado.nombre}" para que esté disponible en los pedidos de salón y para llevar?`}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setModalEstadoMenuOpen(false)}
                disabled={guardandoEstadoMenu}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEstadoMenu}
                disabled={guardandoEstadoMenu}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                  menuParaEstado.activo ? 'bg-[#C74E00] hover:bg-[#B84600]' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {guardandoEstadoMenu
                  ? 'Guardando…'
                  : menuParaEstado.activo
                  ? 'Sí, desactivar'
                  : 'Sí, activar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </PageContainer>
    </div>
  );
};

export default ProductsPage;

