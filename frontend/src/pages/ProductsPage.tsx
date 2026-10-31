import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  BookOpen,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { MenuCompletoItem } from '../types/menuCompleto';
import {
  getMenusCompletosService,
  actualizarPrecioMenuCompletoService,
  cambiarEstadoMenuCompletoService,
} from '../services/menuCompletoService';
import { useProductsManagement } from '../hooks/useProductsManagement';
import {
  ProductFormModal,
  ProductConfirmModal,
  MenuPrecioModal,
  MenuEstadoModal,
  ProductTable,
  ProductFilterBar,
  MenusCompletosTab,
} from '../components/productos';
import { TablePagination } from '../components/ui';
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
    handleConfirmarAccion,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudieron cargar los menús completos.';
      setErrorMenus(msg);
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
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo actualizar el precio del menú completo.';
      setErrorPrecio(msg);
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
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo cambiar el estado del menú completo.';
      setAvisoError(msg);
    } finally {
      setGuardandoEstadoMenu(false);
    }
  };

  // RN-23: Si un no-administrador intenta acceder por URL o prop
  if (!esAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50/50">
        <div className="max-w-md w-full bg-surface rounded-2xl border border-rose-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-danger flex items-center justify-center mx-auto mb-4">
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
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
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
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs hover:shadow transition-all shrink-0 cursor-pointer min-h-[40px]"
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
                ? 'border-accent text-accent'
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
                ? 'border-accent text-accent'
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
            <ProductFilterBar
              busqueda={busqueda}
              onBusquedaChange={(val) => {
                setBusqueda(val);
                setPagina(1);
              }}
              filtroTipo={filtroTipo}
              onFiltroTipoChange={(val) => {
                setFiltroTipo(val);
                setPagina(1);
              }}
              filtroCategoria={filtroCategoria}
              onFiltroCategoriaChange={(val) => {
                setFiltroCategoria(val);
                setPagina(1);
              }}
              filtroEstado={filtroEstado}
              onFiltroEstadoChange={(val) => {
                setFiltroEstado(val);
                setPagina(1);
              }}
            />

            {/* Contenedor de la Tabla con DataTable */}
            <ProductTable
              productos={productos}
              cargando={cargando}
              errorCarga={errorCarga}
              onRetry={cargarProductos}
              hayFiltrosActivos={hayFiltrosActivos}
              onQuitarFiltros={handleQuitarFiltros}
              productoResaltadoId={productoResaltadoId}
              onAbrirEditar={handleAbrirEditar}
              onAbrirConfirmacion={handleAbrirConfirmacion}
            />

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
          <MenusCompletosTab
            errorMenus={errorMenus}
            cargandoMenus={cargandoMenus}
            menusCompletos={menusCompletos}
            onReintentar={cargarMenusCompletos}
            onAbrirModalPrecio={handleAbrirModalPrecio}
            onAbrirModalEstadoMenu={handleAbrirModalEstadoMenu}
          />
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
        <MenuPrecioModal
          isOpen={modalPrecioOpen}
          onClose={() => setModalPrecioOpen(false)}
          menu={menuParaPrecio}
          nuevoPrecioStr={nuevoPrecioStr}
          onPrecioChange={(val) => {
            setNuevoPrecioStr(val);
            if (errorPrecio) setErrorPrecio(null);
          }}
          errorPrecio={errorPrecio}
          guardando={guardandoPrecio}
          onSubmit={handleGuardarPrecioMenu}
        />

        {/* Modal para Confirmar Cambio de Estado de Menú Completo (MSG-218) */}
        <MenuEstadoModal
          isOpen={modalEstadoMenuOpen}
          onClose={() => setModalEstadoMenuOpen(false)}
          menu={menuParaEstado}
          guardando={guardandoEstadoMenu}
          onConfirm={handleConfirmarEstadoMenu}
        />
      </PageContainer>
    </div>
  );
};

export default ProductsPage;
