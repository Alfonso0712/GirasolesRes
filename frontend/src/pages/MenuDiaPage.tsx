import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Power,
  Calendar,
  Sparkles,
  CupSoda,
  CheckSquare,
  Square,
  Soup,
  Salad,
  ChefHat,
  Save,
  RefreshCw
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { CandidatoMenu } from '../types/menuDia';
import {
  useMenuDiaManagement,
  type ItemDisponibilidad
} from '../hooks/useMenuDiaManagement';
import { MenuDisponibilidadConfirmModal } from '../components/MenuDisponibilidadConfirmModal';
import { DiscardChangesModal } from '../components/DiscardChangesModal';

export interface MenuDiaPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onNavigateToProductos?: () => void;
}

type TabMenuPrincipal = 'opciones' | 'menus' | 'carta' | 'disponibilidad';

export const MenuDiaPage: React.FC<MenuDiaPageProps> = ({
  session,
  onLogout
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
    tienePermiso
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
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
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
  const cartaAlmuerzos = cartaActiva.filter((c) => c.categoria === 'Almuerzo' || c.categoria === 'PlatosExtras' || c.categoria === 'Platos Extras');
  const cartaCombinados = cartaActiva.filter((c) => c.categoria === 'Combinados');
  const cartaBebidas = cartaActiva.filter((c) => c.categoria === 'Bebidas' || c.categoria === 'Bebidas y Refrescos');
  const cartaOtros = cartaActiva.filter((c) => c.categoria === 'Otro' || c.categoria === 'Otros');

  // Fecha legible
  const fechaHoyFormateada = (() => {
    try {
      const hoy = new Date();
      return hoy.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha actual';
    }
  })();

  // Resumen de disponibilidad consolidada
  const itemsDisponibilidad: ItemDisponibilidad[] = [
    ...(menu?.opciones?.map((o) => ({
      productoId: o.productoId,
      nombre: o.nombre,
      tipo: 'Componente' as const,
      clasificacion: o.rol,
      agotado: o.agotado
    })) || []),
    ...(menu?.platos?.map((p) => ({
      productoId: p.productoId,
      nombre: p.nombre,
      tipo: 'Carta' as const,
      clasificacion: p.categoria,
      precio: p.precio,
      agotado: p.agotado
    })) || [])
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
      return item.precio != null ? `Carta · S/ ${item.precio.toFixed(2)}` : 'Carta';
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
    <div className="flex-1 overflow-y-auto w-full relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 ${esAdmin && tabActiva !== 'disponibilidad' && tieneCambiosSinGuardar ? 'pb-28' : 'pb-8'} space-y-2.5 sm:space-y-3`}>
        {/* CABECERA PRINCIPAL (Single-Row Action Header) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2.5 mb-1 border-b border-neutral-200">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#2C1A0E]">
            Menú del Día
          </h1>
          <span className="text-xs text-neutral-600 font-medium capitalize flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-neutral-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {fechaHoyFormateada}
          </span>
          {menu?.definido ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Menú definido
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Menú no definido hoy
            </span>
          )}
        </div>

        {/* CONTROLES ADMINISTRADOR */}
        {esAdmin && tabActiva !== 'disponibilidad' && (
          <div className="flex items-center gap-3 flex-wrap">
            {tieneCambiosSinGuardar && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                Cambios sin guardar
              </span>
            )}

            {tieneCambiosSinGuardar && (
              <button
                type="button"
                onClick={() => setDiscardModalOpen(true)}
                disabled={guardando}
                className="px-4 py-2 text-xs font-bold text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl transition-colors cursor-pointer min-h-[42px]"
              >
                Descartar cambios
              </button>
            )}

            <button
              type="button"
              onClick={handleGuardarMenu}
              disabled={guardando}
              className="px-5 py-2 text-xs font-bold text-white bg-[#D35400] hover:bg-[#B84600] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer min-h-[42px]"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GUARDAR MENÚ DEL DÍA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AVISOS DE VALIDACIÓN Y RETROALIMENTACIÓN */}
      {errorValidacionGuardar && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorValidacionGuardar}</div>
        </div>
      )}

      {avisoExito && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{avisoExito}</span>
        </div>
      )}

      {avisoError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{avisoError}</span>
        </div>
      )}

      {/* PESTAÑAS PRINCIPALES */}
      <div className="border-b border-neutral-200 flex flex-wrap gap-2 sm:gap-3 no-scrollbar">
        {esAdmin && (
          <>
            <button
              type="button"
              onClick={() => setTabActiva('opciones')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                tabActiva === 'opciones'
                  ? 'border-[#D35400] text-[#D35400]'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Opciones del día</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-[#D35400] font-bold">
                {opcionesSeleccionadas.size}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabActiva('menus')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                tabActiva === 'menus'
                  ? 'border-[#D35400] text-[#D35400]'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menús completos</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 font-bold">
                {menusCompletosHabilitados.size}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabActiva('carta')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                tabActiva === 'carta'
                  ? 'border-[#D35400] text-[#D35400]'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Productos de carta</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 font-bold">
                {platosCartaSeleccionados.size}
              </span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setTabActiva('disponibilidad')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tabActiva === 'disponibilidad'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>Disponibilidad / Agotados</span>
          {menu?.definido && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
              {itemsDisponibilidad.length}
            </span>
          )}
        </button>
      </div>

      {cargando ? (
        <div className="py-20 text-center text-neutral-500">
          <div className="w-8 h-8 border-3 border-[#D35400] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Cargando menú del día y productos activos…</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OPCIONES DEL DÍA (COMPONENTES POR ROL) */}
          {tabActiva === 'opciones' && esAdmin && (
            <div className="space-y-6">

              {/* SECCIÓN 1: BEBIDAS DE DESAYUNO */}
              <SeccionComponentesRol
                titulo="Bebidas de Desayuno"
                icon={CupSoda}
                items={compBebidasDesayuno}
                seleccionados={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />

              {/* SECCIÓN 2: PLATOS DE DESAYUNO */}
              <SeccionComponentesRol
                titulo="Platos de Desayuno"
                icon={ChefHat}
                items={compPlatosDesayuno}
                seleccionados={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />

              {/* SECCIÓN 3: SOPAS */}
              <SeccionComponentesRol
                titulo="Sopas del Día"
                icon={Soup}
                items={compSopas}
                seleccionados={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />

              {/* SECCIÓN 4: ENTRADAS */}
              <SeccionComponentesRol
                titulo="Entradas del Día"
                icon={Salad}
                items={compEntradas}
                seleccionados={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />

              {/* SECCIÓN 5: SEGUNDOS */}
              <SeccionComponentesRol
                titulo="Segundos del Día"
                icon={UtensilsCrossed}
                items={compSegundos}
                seleccionados={opcionesSeleccionadas}
                onToggle={handleToggleOpcion}
                onSelectAll={handleSeleccionarVariosOpciones}
                onDeselectAll={handleDesmarcarVariosOpciones}
              />
            </div>
          )}

          {/* TAB 2: MENÚS COMPLETOS */}
          {tabActiva === 'menus' && esAdmin && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. DESAYUNO COMPLETO */}
                <CardMenuCompletoDia
                  id={1}
                  nombre="Desayuno completo"
                  precio={7.0}
                  incluye="Pan"
                  habilitado={menusCompletosHabilitados.has(1)}
                  onToggle={() => handleToggleMenuCompleto(1)}
                  partes={[
                    {
                      nombre: 'Bebida',
                      opciones: compBebidasDesayuno
                        .filter((c) => opcionesSeleccionadas.has(c.id))
                        .map((c) => c.nombre)
                    },
                    {
                      nombre: 'Plato',
                      opciones: compPlatosDesayuno
                        .filter((c) => opcionesSeleccionadas.has(c.id))
                        .map((c) => c.nombre)
                    }
                  ]}
                />

                {/* 2. ALMUERZO COMPLETO */}
                <CardMenuCompletoDia
                  id={2}
                  nombre="Almuerzo completo"
                  precio={8.0}
                  incluye="Refresco del día"
                  habilitado={menusCompletosHabilitados.has(2)}
                  onToggle={() => handleToggleMenuCompleto(2)}
                  partes={[
                    {
                      nombre: 'Sopa o entrada',
                      opciones: [...compSopas, ...compEntradas]
                        .filter((c) => opcionesSeleccionadas.has(c.id))
                        .map((c) => c.nombre)
                    },
                    {
                      nombre: 'Segundo',
                      opciones: compSegundos
                        .filter((c) => opcionesSeleccionadas.has(c.id))
                        .map((c) => c.nombre)
                    }
                  ]}
                />

                {/* 3. SOLO SEGUNDO */}
                <CardMenuCompletoDia
                  id={3}
                  nombre="Solo segundo"
                  precio={7.0}
                  incluye="Refresco del día"
                  habilitado={menusCompletosHabilitados.has(3)}
                  onToggle={() => handleToggleMenuCompleto(3)}
                  partes={[
                    {
                      nombre: 'Segundo',
                      opciones: compSegundos
                        .filter((c) => opcionesSeleccionadas.has(c.id))
                        .map((c) => c.nombre)
                    }
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTOS DE CARTA */}
          {tabActiva === 'carta' && esAdmin && (
            <div className="space-y-6">
              {/* SELECTOR DE CATEGORÍA DE CARTA */}
              <div className="flex gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
                {[
                  { id: 'Desayuno', label: 'Desayunos de carta', count: cartaDesayunos.filter((c) => platosCartaSeleccionados.has(c.id)).length, total: cartaDesayunos.length },
                  { id: 'Almuerzo', label: 'Platos / Extras', count: cartaAlmuerzos.filter((c) => platosCartaSeleccionados.has(c.id)).length, total: cartaAlmuerzos.length },
                  { id: 'Combinados', label: 'Combinados', count: cartaCombinados.filter((c) => platosCartaSeleccionados.has(c.id)).length, total: cartaCombinados.length },
                  { id: 'Bebidas', label: 'Bebidas', count: cartaBebidas.filter((c) => platosCartaSeleccionados.has(c.id)).length, total: cartaBebidas.length },
                  { id: 'Otros', label: 'Otros', count: cartaOtros.filter((c) => platosCartaSeleccionados.has(c.id)).length, total: cartaOtros.length }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCatCartaActiva(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      catCartaActiva === cat.id
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {cat.label} ({cat.count}/{cat.total})
                  </button>
                ))}
              </div>

              {/* GRILLA DE PRODUCTOS DE CARTA SEGÚN CATEGORÍA SELECCIONADA */}
              <SeccionCartaCategoria
                categoriaNombre={catCartaActiva}
                items={
                  catCartaActiva === 'Desayuno'
                    ? cartaDesayunos
                    : catCartaActiva === 'Almuerzo'
                    ? cartaAlmuerzos
                    : catCartaActiva === 'Combinados'
                    ? cartaCombinados
                    : catCartaActiva === 'Bebidas'
                    ? cartaBebidas
                    : cartaOtros
                }
                seleccionados={platosCartaSeleccionados}
                onToggle={handleTogglePlatoCarta}
                onSelectAll={handleSeleccionarVariosCarta}
                onDeselectAll={handleDesmarcarVariosCarta}
              />
            </div>
          )}

          {/* TAB 4: DISPONIBILIDAD EN SERVICIO */}
          {tabActiva === 'disponibilidad' && (
            <div className="space-y-6">

              {/* MENÚS COMPLETOS: ESTADO DE DISPONIBILIDAD */}
              {menu?.menusCompletos && menu.menusCompletos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Estado de Menús Completos en Servicio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {menu.menusCompletos.map((mc) => (
                      <div
                        key={mc.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between ${
                          mc.disponible
                            ? 'bg-white border-neutral-200'
                            : 'bg-amber-50/80 border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-bold text-neutral-900 text-sm">
                            {mc.nombre}
                          </span>
                          {mc.disponible ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Disponible
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                              No disponible hoy
                            </span>
                          )}
                        </div>

                        {!mc.disponible && mc.motivoNoDisponible && (
                          <p className="text-xs text-amber-900 mt-2 font-medium">
                            {mc.motivoNoDisponible}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FILTROS Y BÚSQUEDA */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <input
                  type="text"
                  placeholder="Buscar plato o componente…"
                  value={busquedaDisp}
                  onChange={(e) => setBusquedaDisp(e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                />

                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['Todos', 'Componente', 'Carta', 'Agotados'] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setFiltroTipoDisp(tipo)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        filtroTipoDisp === tipo
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTA / TABLA DE ÍTEMS EN SERVICIO */}
              {itemsDispFiltrados.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  No se encontraron ítems en el menú con ese criterio.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {itemsDispFiltrados.map((item) => {
                    const esResaltado = platoResaltadoId === item.productoId;
                    return (
                      <div
                        key={item.productoId}
                        className={`p-4 rounded-2xl border bg-white flex flex-col justify-between min-h-[140px] transition-all ${
                          item.agotado
                            ? 'border-neutral-300 bg-neutral-50/70 opacity-80'
                            : 'border-neutral-200 hover:border-neutral-300 shadow-2xs'
                        } ${esResaltado ? 'ring-2 ring-[#D35400]' : ''}`}
                      >
                        <div className="flex flex-col items-start gap-1.5 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.tipo === 'Componente'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {formatearBadgeClasificacion(item)}
                          </span>
                          <h4 className="font-semibold text-sm sm:text-base text-neutral-900 leading-snug break-words w-full">
                            {item.nombre}
                          </h4>
                        </div>

                        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              item.agotado ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.agotado ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {item.agotado ? 'Agotado' : 'Disponible'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAbrirDisponibilidadModal(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[38px] ${
                              item.agotado
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'bg-neutral-100 hover:bg-rose-50 text-neutral-800 hover:text-rose-700 border border-neutral-200'
                            }`}
                          >
                            {item.agotado ? 'Habilitar' : 'Marcar agotado'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>

      {/* BARRA INFERIOR FIJA (STICKY FOOTER): SOLO SE MUESTRA CUANDO HAY CAMBIOS SIN GUARDAR Y FUERA DE DISPONIBILIDAD */}
      {esAdmin && tabActiva !== 'disponibilidad' && tieneCambiosSinGuardar && (
        <div className="sticky bottom-0 z-50 w-full bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3.5 mt-auto">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {tieneCambiosSinGuardar ? (
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D35400] animate-ping shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900">
                      Tiene cambios pendientes sin publicar
                    </p>
                    <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                      Haga clic en Guardar para actualizar las opciones y menús disponibles hoy.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>El menú actual está publicado y guardado.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              {tieneCambiosSinGuardar && (
                <button
                  type="button"
                  onClick={() => setDiscardModalOpen(true)}
                  disabled={guardando}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl transition-colors cursor-pointer min-h-[42px]"
                >
                  Descartar cambios
                </button>
              )}

              <button
                type="button"
                onClick={handleGuardarMenu}
                disabled={guardando}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#D35400] hover:bg-[#B84600] rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer min-h-[42px]"
              >
                {guardando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>GUARDAR MENÚ DEL DÍA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

/* COMPONENTE AUXILIAR: SECCIÓN DE COMPONENTES POR ROL */
interface SeccionComponentesRolProps {
  titulo: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CandidatoMenu[];
  seleccionados: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

const SeccionComponentesRol: React.FC<SeccionComponentesRolProps> = ({
  titulo,
  icon: Icon,
  items,
  seleccionados,
  onToggle,
  onSelectAll,
  onDeselectAll
}) => {
  const ids = items.map((i) => i.id);
  const seleccionadosCount = items.filter((i) => seleccionados.has(i.id)).length;
  const todosSeleccionados = items.length > 0 && seleccionadosCount === items.length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
      <div className="px-5 xl:px-6 py-4 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-orange-100 text-[#D35400] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-neutral-900 text-sm sm:text-base xl:text-lg">
              {titulo}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs sm:text-sm xl:text-base font-semibold text-neutral-600 mr-1 sm:mr-2">
            {seleccionadosCount} de {items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              todosSeleccionados ? onDeselectAll(ids) : onSelectAll(ids)
            }
            className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs sm:text-sm xl:text-base font-bold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer"
          >
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 xl:p-6">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-neutral-400 italic">
            No hay componentes registrados con este rol. Regístrelos en Carta y Menú &gt; Productos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {items.map((item) => {
              const estaSeleccionado = seleccionados.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  aria-pressed={estaSeleccionado}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer min-h-[56px] ${
                    estaSeleccionado
                      ? 'border-[#D35400] bg-orange-50/50 text-[#D35400] shadow-xs ring-1 ring-[#D35400]'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {estaSeleccionado ? (
                        <CheckSquare className="w-5 h-5 text-[#D35400]" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#2C1A0E] leading-snug break-words">
                      {item.nombre}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* COMPONENTE AUXILIAR: TARJETA DE MENÚ COMPLETO (CUS04.5 / RV-161) */
interface CardMenuCompletoDiaProps {
  id: number;
  nombre: string;
  precio: number;
  incluye: string;
  habilitado: boolean;
  onToggle: () => void;
  partes: {
    nombre: string;
    opciones: string[];
  }[];
}

const CardMenuCompletoDia: React.FC<CardMenuCompletoDiaProps> = ({
  nombre,
  precio,
  incluye,
  habilitado,
  onToggle,
  partes
}) => {
  // Comprobar si cada parte tiene opciones seleccionadas (RV-161)
  const partesConFalta = partes.filter((p) => p.opciones.length === 0);
  const cumpleRV161 = partesConFalta.length === 0;

  return (
    <div
      className={`rounded-2xl border p-5 xl:p-6 flex flex-col justify-between transition-all ${
        habilitado
          ? 'bg-white border-[#D35400] shadow-sm'
          : 'bg-neutral-50/80 border-neutral-200 opacity-80'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-sans font-bold text-neutral-900 text-base xl:text-lg">
              {nombre}
            </h3>
            <span className="text-lg xl:text-xl font-sans font-bold tabular-nums whitespace-nowrap text-[#D35400]">
              S/ {precio.toFixed(2)}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={habilitado}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D35400]"></div>
          </label>
        </div>

        <p className="text-xs text-neutral-500 mb-4">
          Incluye: <strong>{incluye}</strong>
        </p>

        {/* RESUMEN DE PARTES Y OPCIONES */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          {partes.map((p) => (
            <div key={p.nombre} className="text-xs">
              <span className="font-bold text-neutral-700 block mb-1">
                Parte: {p.nombre}
              </span>
              {p.opciones.length === 0 ? (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                  Falta elegir opciones
                </span>
              ) : (
                <span className="text-[11px] text-neutral-600 block line-clamp-2">
                  {p.opciones.length} opción(es): {p.opciones.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {habilitado && !cumpleRV161 && (
        <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            {nombre} necesita al menos una opción en &quot;
            {partesConFalta[0]?.nombre}&quot;. Seleccione opciones o quite el menú de hoy.
          </span>
        </div>
      )}
    </div>
  );
};

/* COMPONENTE AUXILIAR: SECCIÓN DE PRODUCTOS DE CARTA POR CATEGORÍA */
interface SeccionCartaCategoriaProps {
  categoriaNombre: string;
  items: CandidatoMenu[];
  seleccionados: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

const SeccionCartaCategoria: React.FC<SeccionCartaCategoriaProps> = ({
  categoriaNombre,
  items,
  seleccionados,
  onToggle,
  onSelectAll,
  onDeselectAll
}) => {
  const ids = items.map((i) => i.id);
  const seleccionadosCount = items.filter((i) => seleccionados.has(i.id)).length;
  const todosSeleccionados = items.length > 0 && seleccionadosCount === items.length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
      <div className="px-5 xl:px-6 py-4 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-sans font-bold text-neutral-900 text-sm sm:text-base xl:text-lg">
            Categoría: {categoriaNombre}
          </h3>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs sm:text-sm xl:text-base font-semibold text-neutral-600 mr-1 sm:mr-2">
            {seleccionadosCount} de {items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              todosSeleccionados ? onDeselectAll(ids) : onSelectAll(ids)
            }
            className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs sm:text-sm xl:text-base font-bold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer"
          >
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 xl:p-6">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-neutral-400 italic">
            No hay productos registrados en esta categoría de carta.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {items.map((item) => {
              const estaSeleccionado = seleccionados.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  aria-pressed={estaSeleccionado}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer min-h-[56px] ${
                    estaSeleccionado
                      ? 'border-[#D35400] bg-orange-50/50 text-[#D35400] shadow-xs ring-1 ring-[#D35400]'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {estaSeleccionado ? (
                        <CheckSquare className="w-5 h-5 text-[#D35400]" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#2C1A0E] leading-snug break-words">
                      {item.nombre}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums whitespace-nowrap shrink-0 pl-2 text-neutral-700">
                    S/ {item.precio?.toFixed(2) ?? '0.00'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
