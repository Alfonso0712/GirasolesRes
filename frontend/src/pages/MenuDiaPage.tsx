import React, { useState, useMemo } from 'react';
import { ShieldAlert, Calendar } from 'lucide-react';
import type { UserSession } from '../types/auth';
import {
  useMenuDiaManagement,
  type ItemDisponibilidad,
} from '../hooks/useMenuDiaManagement';
import {
  MenuDiaDisponibilidadTab,
  MenuDiaStickyFooter,
  MenuDiaOpcionesTab,
  MenuDiaMenusCompletosTab,
  MenuDiaCartaTab,
  MenuDiaTabsNav,
  MenuDiaAvisos,
  MenuDiaModals,
  formatearBadgeClasificacion,
  agruparCandidatos,
  type TabMenuPrincipal,
} from '../components/menu-dia';
import { StatusBadge } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import { formatFechaLarga } from '../utils/formatters';

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

  // Agrupamiento de candidatos: Componentes y Carta
  const {
    compBebidasDesayuno,
    compPlatosDesayuno,
    compSopas,
    compEntradas,
    compSegundos,
    cartaDesayunos,
    cartaAlmuerzos,
    cartaCombinados,
    cartaBebidas,
    cartaOtros,
  } = useMemo(() => agruparCandidatos(candidatos), [candidatos]);

  // Fecha legible
  const fechaHoyFormateada = formatFechaLarga();

  // Resumen de disponibilidad consolidada
  const itemsDisponibilidad: ItemDisponibilidad[] = useMemo(() => [
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
  ], [menu]);

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
        <MenuDiaAvisos
          errorValidacionGuardar={errorValidacionGuardar}
          avisoExito={avisoExito}
          avisoError={avisoError}
        />

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

      {/* MODALES DE DISPONIBILIDAD Y DESCARTE */}
      <MenuDiaModals
        dispModalOpen={dispModalOpen}
        onCloseDisp={() => setDispModalOpen(false)}
        onConfirmDisp={handleConfirmarDisponibilidad}
        itemAConfirmar={itemAConfirmar}
        nuevoEstadoAgotado={nuevoEstadoAgotado}
        procesandoDisp={procesandoDisp}
        discardModalOpen={discardModalOpen}
        onCloseDiscard={() => setDiscardModalOpen(false)}
        onConfirmDiscard={handleDescartarCambios}
      />
    </div>
  );
};

export default MenuDiaPage;
