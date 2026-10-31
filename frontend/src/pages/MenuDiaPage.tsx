import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import {
  useMenuDiaManagement,
  type ItemDisponibilidad,
} from '../hooks/useMenuDiaManagement';
import {
  MenuDisponibilidadConfirmModal,
  MenuDiaDisponibilidadTab,
  MenuDiaStickyFooter,
  MenuDiaOpcionesTab,
  MenuDiaMenusCompletosTab,
  MenuDiaCartaTab,
  MenuDiaTabsNav,
  type TabMenuPrincipal,
} from '../components/menu-dia';
import { DiscardChangesModal, StatusBadge } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import { formatCurrency, formatFechaLarga } from '../utils/formatters';

export interface MenuDiaPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onNavigateToProductos?: () => void;
}

export const MenuDiaPage: React.FC<MenuDiaPageProps> = ({
  session,
  onLogout,
}) => {
  const {
    menu,
    candidatos,
    cargando,
    guardando,
    // Opciones del día
    opcionesSeleccionadas,
    handleToggleOpcion,
    handleSeleccionarVariosOpciones,
    handleDesmarcarVariosOpciones,
    // Menús completos
    menusCompletosHabilitados,
    handleToggleMenuCompleto,
    // Carta
    platosCartaSeleccionados,
    handleTogglePlatoCarta,
    handleSeleccionarVariosCarta,
    handleDesmarcarVariosCarta,
    // Guardar / Descartar
    handleGuardarMenu,
    handleDescartarCambios,
    tieneCambiosSinGuardar,
    errorValidacionGuardar,
    // Avisos
    avisoExito,
    avisoError,
    platoResaltadoId,
    // Modal Disponibilidad
    dispModalOpen,
    setDispModalOpen,
    itemAConfirmar,
    nuevoEstadoAgotado,
    procesandoDisp,
    handleAbrirDisponibilidadModal,
    handleConfirmarDisponibilidad,
    // Modal Descartar
    discardModalOpen,
    setDiscardModalOpen,
    // Permisos
    esAdmin,
    tienePermiso,
  } = useMenuDiaManagement({ session, onLogout });

  const [tabActiva, setTabActiva] = useState<TabMenuPrincipal>(
    session.rol === 'Cocinero' ? 'disponibilidad' : 'opciones'
  );

  // Sub-categoría activa en pestaña Carta
  const [catCartaActiva, setCatCartaActiva] = useState<string>('Desayuno');

  // Filtro de búsqueda en Disponibilidad
  const [busquedaDisp, setBusquedaDisp] = useState('');
  const [filtroTipoDisp, setFiltroTipoDisp] = useState<'Todos' | 'Componente' | 'Carta' | 'Agotados'>('Todos');

  if (!tienePermiso) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-danger rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto text-sm">
          No tiene permiso para acceder a este módulo. Esta pantalla está reservada para administración y cocina.
        </p>
      </div>
    );
  }

  // Agrupamiento de candidatos: Componentes por Rol
  const componentesActivos = candidatos.filter((c) => c.tipo === 'Componente');
  const compBebidasDesayuno = componentesActivos.filter((c) => c.rol === 'BebidaDesayuno');
  const compPlatosDesayuno = componentesActivos.filter((c) => c.rol === 'PlatoDesayuno');
  const compSopas = componentesActivos.filter((c) => c.rol === 'Sopa');
  const compEntradas = componentesActivos.filter((c) => c.rol === 'Entrada');
  const compSegundos = componentesActivos.filter((c) => c.rol === 'Segundo');

  // Agrupamiento de candidatos: Carta por Categoría
  const cartaActiva = candidatos.filter((c) => c.tipo === 'Carta');
  const cartaDesayunos = cartaActiva.filter((c) => c.categoria === 'Desayuno');
  const cartaAlmuerzos = cartaActiva.filter(
    (c) => c.categoria === 'Almuerzo' || c.categoria === 'PlatosExtras' || c.categoria === 'Platos Extras'
  );
  const cartaCombinados = cartaActiva.filter((c) => c.categoria === 'Combinados');
  const cartaBebidas = cartaActiva.filter(
    (c) => c.categoria === 'Bebidas' || c.categoria === 'Bebidas y Refrescos'
  );
  const cartaOtros = cartaActiva.filter((c) => c.categoria === 'Otro' || c.categoria === 'Otros');

  // Fecha legible
  const fechaHoyFormateada = formatFechaLarga();

  // Resumen de disponibilidad consolidada
  const itemsDisponibilidad: ItemDisponibilidad[] = [
    ...(menu?.opciones?.map((o) => ({
      productoId: o.productoId,
      nombre: o.nombre,
      tipo: 'Componente' as const,
      clasificacion: o.rol,
      agotado: o.agotado,
    })) || []),
    ...(menu?.platos?.map((p) => ({
      productoId: p.productoId,
      nombre: p.nombre,
      tipo: 'Carta' as const,
      clasificacion: p.categoria,
      precio: p.precio,
      agotado: p.agotado,
    })) || []),
  ];

  const itemsDispFiltrados = itemsDisponibilidad.filter((item) => {
    if (busquedaDisp.trim()) {
      if (!item.nombre.toLowerCase().includes(busquedaDisp.toLowerCase().trim())) {
        return false;
      }
    }
    if (filtroTipoDisp === 'Componente') return item.tipo === 'Componente';
    if (filtroTipoDisp === 'Carta') return item.tipo === 'Carta';
    if (filtroTipoDisp === 'Agotados') return item.agotado;
    return true;
  });

  const formatearBadgeClasificacion = (item: { tipo: string; clasificacion: string; precio?: number }) => {
    if (item.tipo === 'Carta') {
      return item.precio != null ? `Carta · ${formatCurrency(item.precio)}` : 'Carta';
    }
    const rol = item.clasificacion || '';
    const MAPEO_ROLES: Record<string, string> = {
      BebidaDesayuno: 'Bebida desayuno',
      PlatoDesay: 'Plato desayuno',
      PlatoDesayuno: 'Plato desayuno',
      Sopa: 'Sopa',
      Entrada: 'Entrada',
      Segundo: 'Segundo',
      Postre: 'Postre',
      Refresco: 'Refresco',
      Bebida: 'Bebida',
    };
    if (MAPEO_ROLES[rol]) return MAPEO_ROLES[rol];
    return (
      rol
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()) || 'Opción'
    );
  };

  return (
    <div className="flex-1 overflow-y-auto w-full relative scroll-thin">
      <PageContainer className={esAdmin && tabActiva !== 'disponibilidad' && tieneCambiosSinGuardar ? 'pb-28' : 'pb-8'}>
        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Menú del Día"
          subtitle="Planificación diaria de opciones, menús completos, carta y disponibilidad del servicio."
          badge={
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 font-medium capitalize flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-neutral-200 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {fechaHoyFormateada}
              </span>
              <StatusBadge
                status={Boolean(menu?.definido)}
                activeLabel="Menú definido"
                inactiveLabel="Menú no definido hoy"
              />
            </div>
          }
        />

        {/* AVISOS DE VALIDACIÓN Y RETROALIMENTACIÓN */}
        {errorValidacionGuardar && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
            <div className="flex-1 font-medium">{errorValidacionGuardar}</div>
          </div>
        )}

        {avisoExito && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
            <span className="font-medium">{avisoExito}</span>
          </div>
        )}

        {avisoError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
            <span className="font-medium">{avisoError}</span>
          </div>
        )}

        {/* PESTAÑAS PRINCIPALES */}
        <MenuDiaTabsNav
          esAdmin={esAdmin}
          tabActiva={tabActiva}
          onTabChange={setTabActiva}
          opcionesCount={opcionesSeleccionadas.size}
          menusCount={menusCompletosHabilitados.size}
          cartaCount={platosCartaSeleccionados.size}
          disponibilidadCount={itemsDisponibilidad.length}
          menuDefinido={Boolean(menu?.definido)}
        />

        {cargando ? (
          <div className="py-20 text-center text-neutral-500">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Cargando menú del día y productos activos…</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OPCIONES DEL DÍA (COMPONENTES POR ROL) */}
            {tabActiva === 'opciones' && esAdmin && (
              <MenuDiaOpcionesTab
                compBebidasDesayuno={compBebidasDesayuno}
                compPlatosDesayuno={compPlatosDesayuno}
                compSopas={compSopas}
                compEntradas={compEntradas}
                compSegundos={compSegundos}
                opcionesSeleccionadas={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />
            )}

            {/* TAB 2: MENÚS COMPLETOS */}
            {tabActiva === 'menus' && esAdmin && (
              <MenuDiaMenusCompletosTab
                menusCompletosHabilitados={menusCompletosHabilitados}
                onToggleMenuCompleto={handleToggleMenuCompleto}
                opcionesSeleccionadas={opcionesSeleccionadas}
                compBebidasDesayuno={compBebidasDesayuno}
                compPlatosDesayuno={compPlatosDesayuno}
                compSopas={compSopas}
                compEntradas={compEntradas}
                compSegundos={compSegundos}
              />
            )}

            {/* TAB 3: PRODUCTOS DE CARTA */}
            {tabActiva === 'carta' && esAdmin && (
              <MenuDiaCartaTab
                catCartaActiva={catCartaActiva}
                onSelectCategoria={setCatCartaActiva}
                cartaDesayunos={cartaDesayunos}
                cartaAlmuerzos={cartaAlmuerzos}
                cartaCombinados={cartaCombinados}
                cartaBebidas={cartaBebidas}
                cartaOtros={cartaOtros}
                platosCartaSeleccionados={platosCartaSeleccionados}
                onTogglePlatoCarta={handleTogglePlatoCarta}
                onSelectAllCarta={handleSeleccionarVariosCarta}
                onDeselectAllCarta={handleDesmarcarVariosCarta}
              />
            )}

            {/* TAB 4: DISPONIBILIDAD EN SERVICIO */}
            {tabActiva === 'disponibilidad' && (
              <MenuDiaDisponibilidadTab
                menu={menu}
                busquedaDisp={busquedaDisp}
                setBusquedaDisp={setBusquedaDisp}
                filtroTipoDisp={filtroTipoDisp}
                setFiltroTipoDisp={setFiltroTipoDisp}
                itemsDispFiltrados={itemsDispFiltrados}
                platoResaltadoId={platoResaltadoId}
                handleAbrirDisponibilidadModal={handleAbrirDisponibilidadModal}
                formatearBadgeClasificacion={formatearBadgeClasificacion}
              />
            )}
          </>
        )}
      </PageContainer>

      {/* BARRA INFERIOR FIJA (STICKY FOOTER): SOLO SE MUESTRA CUANDO HAY CAMBIOS SIN GUARDAR Y FUERA DE DISPONIBILIDAD */}
      <MenuDiaStickyFooter
        esAdmin={esAdmin}
        tabActiva={tabActiva}
        tieneCambiosSinGuardar={tieneCambiosSinGuardar}
        guardando={guardando}
        onDiscard={() => setDiscardModalOpen(true)}
        onSave={handleGuardarMenu}
      />

      {/* MODAL DE CONFIRMACIÓN DE DISPONIBILIDAD (CUS05.2 / RV-49) */}
      <MenuDisponibilidadConfirmModal
        isOpen={dispModalOpen}
        onClose={() => setDispModalOpen(false)}
        onConfirm={handleConfirmarDisponibilidad}
        plato={itemAConfirmar}
        nuevoEstadoAgotado={nuevoEstadoAgotado}
        procesando={procesandoDisp}
      />

      {/* MODAL DE DESCARTE DE CAMBIOS (RV-48 / MSG-72) */}
      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={handleDescartarCambios}
      />
    </div>
  );
};

export default MenuDiaPage;
