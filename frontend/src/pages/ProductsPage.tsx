import React, { useRef, useState } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import type { UserSession } from '../types/auth';
import { useProductsManagement } from '../hooks/useProductsManagement';
import {
  ProductTable,
  ProductFilterBar,
  MenusCompletosTab,
  useMenusCompletosTab,
  ProductsToasts,
  ProductsTabsNav,
  ProductsModals,
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

  // Lógica de Menús Completos modularizada (CUS04.5)
  const {
    menusCompletos,
    cargandoMenus,
    errorMenus,
    modalPrecioOpen,
    setModalPrecioOpen,
    menuParaPrecio,
    nuevoPrecioStr,
    setNuevoPrecioStr,
    guardandoPrecio,
    errorPrecio,
    setErrorPrecio,
    modalEstadoMenuOpen,
    setModalEstadoMenuOpen,
    menuParaEstado,
    guardandoEstadoMenu,
    cargarMenusCompletos,
    handleAbrirModalPrecio,
    handleGuardarPrecioMenu,
    handleAbrirModalEstadoMenu,
    handleConfirmarEstadoMenu,
  } = useMenusCompletosTab({
    token: session.token,
    esAdmin,
    pestañaActiva,
    setAvisoExito,
    setAvisoError,
  });

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
        {/* Toasts / Alertas de Retroalimentación */}
        <ProductsToasts
          avisoExito={avisoExito}
          onCloseExito={() => setAvisoExito(null)}
          avisoError={avisoError}
          onCloseError={() => setAvisoError(null)}
        />

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
        <ProductsTabsNav
          pestañaActiva={pestañaActiva}
          onTabChange={setPestañaActiva}
          totalProductos={total}
        />

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

        {/* Modales del CUS04 y CUS04.5 */}
        <ProductsModals
          formModalOpen={formModalOpen}
          onCloseForm={() => setFormModalOpen(false)}
          onSubmitForm={handleGuardarProducto}
          productoAEditar={productoAEditar}
          confirmModalOpen={confirmModalOpen}
          onCloseConfirm={() => setConfirmModalOpen(false)}
          onConfirmAccion={handleConfirmarAccion}
          productoAConfirmar={productoAConfirmar}
          confirmTipo={confirmTipo}
          procesandoConfirm={procesandoConfirm}
          modalPrecioOpen={modalPrecioOpen}
          onClosePrecio={() => setModalPrecioOpen(false)}
          menuParaPrecio={menuParaPrecio}
          nuevoPrecioStr={nuevoPrecioStr}
          onPrecioChange={(val) => {
            setNuevoPrecioStr(val);
            if (errorPrecio) setErrorPrecio(null);
          }}
          errorPrecio={errorPrecio}
          guardandoPrecio={guardandoPrecio}
          onSubmitPrecio={handleGuardarPrecioMenu}
          modalEstadoMenuOpen={modalEstadoMenuOpen}
          onCloseEstadoMenu={() => setModalEstadoMenuOpen(false)}
          menuParaEstado={menuParaEstado}
          guardandoEstadoMenu={guardandoEstadoMenu}
          onConfirmEstadoMenu={handleConfirmarEstadoMenu}
        />
      </PageContainer>
    </div>
  );
};

export default ProductsPage;
