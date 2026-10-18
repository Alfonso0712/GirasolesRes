import React from 'react';
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  PowerOff,
  Power,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import { useMenuDiaManagement } from '../hooks/useMenuDiaManagement';
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

export const MenuDiaPage: React.FC<MenuDiaPageProps> = ({
  session,
  onLogout,
  onNavigateToProductos
}) => {
  const {
    menu,
    candidatos,
    cargando,
    guardando,
    errorCarga,
    cargarDatos,
    desayunoSeleccionado,
    platosSeleccionados,
    handleTogglePlato,
    handleSeleccionarDesayuno,
    handleGuardarMenu,
    tieneCambiosSinGuardar,
    errorValidacionGuardar,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    platoResaltadoId,
    dispModalOpen,
    setDispModalOpen,
    platoAConfirmar,
    nuevoEstadoAgotado,
    procesandoDisp,
    handleAbrirDisponibilidadModal,
    handleConfirmarDisponibilidad,
    discardModalOpen,
    setDiscardModalOpen,
    handleDescartarCambios,
    esCocinero,
    tienePermiso
  } = useMenuDiaManagement({ session, onLogout });

  // Si no tiene rol autorizado (Administrador o Cocinero, RN-31/RN-32/RNF-16)
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
          No tiene permiso para usar esta función. (MSG-39). Esta pantalla está reservada para administración y cocina.
        </p>
      </div>
    );
  }

  // Agrupamiento de candidatos por categoría
  const candidatosDesayunos = candidatos.filter((c) => c.categoria === 'Desayuno');
  const candidatosAlmuerzos = candidatos.filter((c) => c.categoria === 'Almuerzo');
  const candidatosOtros = candidatos.filter((c) => c.categoria === 'Otro');
  const noHayCandidatosActivos = candidatos.length === 0;

  // Formateo de fecha de Lima
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
            {esCocinero ? 'COCINA Y SERVICIO' : 'GESTIÓN DE LA CARTA'}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
              Menú del Día
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#D35400]" />
              <span className="capitalize">{fechaHoyFormateada}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            {esCocinero
              ? 'Consulte los platos de la carta de hoy y actualice su disponibilidad en tiempo real.'
              : 'Defina el desayuno y los platos disponibles para el servicio de hoy, o gestione su disponibilidad.'}
          </p>
        </div>

        {/* Indicador de estado del menú en la cabecera */}
        {menu && (
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${
                menu.definido
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 shadow-2xs'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  menu.definido ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              {menu.definido ? 'Menú definido para hoy' : 'Menú no definido aún'}
            </span>
          </div>
        )}
      </div>

      {/* Contenedor Principal Confinado (Zero Global Scroll) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
        {errorCarga ? (
          /* Error de carga (MSG-80) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-medium text-neutral-700">{errorCarga}</p>
            <button
              type="button"
              onClick={() => cargarDatos(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : cargando ? (
          /* Estado de Carga / Skeleton */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="shrink-0 px-6 py-2.5 bg-amber-50/60 border-b border-amber-100/80 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-neutral-700">Cargando menú del día…</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">Sincronizando productos</span>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
              <div className="h-40 bg-neutral-50 rounded-xl animate-pulse" />
              <div className="h-40 bg-neutral-50 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : esCocinero ? (
          /* ========================================================
             VISTA DEL COCINERO (Vista 5.3): Minimalismo Total (Nielsen 8)
             ======================================================== */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {!menu || !menu.definido ? (
              /* Sin menú definido (Cocinero, MSG-78) */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto border border-amber-200">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-sans font-bold text-neutral-800 mb-1">
                    Menú no disponible
                  </h3>
                  <p className="text-sm text-neutral-600">
                    No hay menú definido para hoy. La administradora debe definirlo. (MSG-78)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Cabecera sutil de lista */}
                <div className="shrink-0 px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    Mostrando <strong className="text-neutral-800">{menu.platos.length}</strong> platos en el menú de hoy
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Toque el botón para cambiar disponibilidad
                  </span>
                </div>

                {/* Lista táctil para cocina (RNF-15: botones de al menos 44 px, tarjetas de una columna) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
                  {menu.desayuno && (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D35400] flex items-center justify-center shrink-0">
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D35400]">
                            Desayuno del día
                          </span>
                          <h4 className="font-sans font-bold text-base text-neutral-900">
                            {menu.desayuno.nombre}
                          </h4>
                        </div>
                      </div>
                      <span className="w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        Disponible
                      </span>
                    </div>
                  )}

                  {menu.platos.map((plato) => {
                    const estaResaltado = platoResaltadoId === plato.productoId;

                    return (
                      <div
                        key={plato.productoId}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                          estaResaltado
                            ? 'bg-amber-100/60 border-amber-300 scale-[1.01]'
                            : plato.agotado
                            ? 'bg-neutral-50/90 border-neutral-200 opacity-90'
                            : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                              plato.agotado
                                ? 'bg-neutral-100 text-neutral-400 border-neutral-200'
                                : 'bg-[#FFF3E0] text-[#D35400] border-amber-200/80'
                            }`}
                          >
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-sans font-bold text-base sm:text-lg ${
                                  plato.agotado
                                    ? 'text-neutral-500 line-through'
                                    : 'text-neutral-900'
                                }`}
                              >
                                {plato.nombre}
                              </h4>
                              {estaResaltado && (
                                <span className="text-[10px] bg-[#D35400] text-white px-2 py-0.5 rounded-full font-bold">
                                  Actualizado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-neutral-500 font-medium">
                                {plato.categoria}
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-xs font-mono font-semibold text-neutral-700">
                                S/ {plato.precio.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Estado e Interacción de un solo toque (RNF-15 / Shneiderman 2) */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                          {/* Insignia RV-50 */}
                          <span
                            className={`w-28 h-8 inline-flex items-center justify-center rounded-xl text-xs font-semibold border gap-1.5 shadow-2xs ${
                              plato.agotado
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                plato.agotado ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            {plato.agotado ? 'Agotado' : 'Disponible'}
                          </span>

                          {/* Botón táctil grande (>= 44px) */}
                          <button
                            type="button"
                            onClick={() => handleAbrirDisponibilidadModal(plato)}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] shadow-sm ${
                              plato.agotado
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-100 hover:bg-amber-200 text-[#B84600] border border-amber-200'
                            }`}
                          >
                            {plato.agotado ? (
                              <>
                                <Power className="w-4 h-4" />
                                <span>Marcar como Disponible</span>
                              </>
                            ) : (
                              <>
                                <PowerOff className="w-4 h-4" />
                                <span>Marcar como Agotado</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             VISTA DEL ADMINISTRADOR (Vistas 5.1 y 5.2): Definición y Disponibilidad
             ======================================================== */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {noHayCandidatosActivos ? (
              /* Sin productos activos (MSG-69) */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto border border-amber-200">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-sans font-bold text-neutral-800 mb-1">
                    No hay productos activos
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Registre productos antes de definir el menú. (MSG-69)
                  </p>
                  {onNavigateToProductos && (
                    <button
                      type="button"
                      onClick={onNavigateToProductos}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Ir a Productos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Banner de menú no definido para hoy (MSG-71) */}
                {menu && !menu.definido && (
                  <div className="shrink-0 p-3.5 bg-amber-50/80 border-b border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-[#D35400] shrink-0" />
                    <span className="font-medium">
                      Todavía no definió el menú de hoy. Seleccione los productos y pulse GUARDAR MENÚ. (MSG-71)
                    </span>
                  </div>
                )}

                {/* Área de Trabajo con Scroll Confinado */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
                  {/* SECCIÓN 1: Desayuno del Día (RV-44: Selección única y opcional) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-[#D35400]" />
                        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-700">
                          DESAYUNO DEL DÍA <span className="text-xs font-normal text-neutral-400 lowercase">(opcional)</span>
                        </h3>
                      </div>
                      {desayunoSeleccionado && (
                        <button
                          type="button"
                          onClick={() => handleSeleccionarDesayuno(null)}
                          className="text-xs text-[#D35400] hover:text-[#B84600] font-semibold cursor-pointer"
                        >
                          Limpiar selección
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Opción Ninguno */}
                      <label
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all min-h-[44px] ${
                          desayunoSeleccionado === null
                            ? 'bg-neutral-100/70 border-neutral-300 text-neutral-800'
                            : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="desayuno"
                          checked={desayunoSeleccionado === null}
                          onChange={() => handleSeleccionarDesayuno(null)}
                          className="w-4 h-4 text-[#D35400] focus:ring-amber-300 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium">Sin desayuno especial hoy</span>
                      </label>

                      {/* Lista de desayunos activos */}
                      {candidatosDesayunos.map((des) => {
                        const esSeleccionado = desayunoSeleccionado === des.id;

                        return (
                          <label
                            key={des.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all min-h-[44px] ${
                              esSeleccionado
                                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-semibold'
                                : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="desayuno"
                                checked={esSeleccionado}
                                onChange={() => handleSeleccionarDesayuno(des.id)}
                                className="w-4 h-4 text-[#D35400] focus:ring-amber-300 cursor-pointer"
                              />
                              <span className="text-xs sm:text-sm">{des.nombre}</span>
                            </div>
                            <span className="text-xs font-mono font-semibold text-neutral-600">
                              S/ {des.precio.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  {/* SECCIÓN 2: Platos Disponibles (Almuerzos y Otros, selección múltiple, RV-43) */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#D35400]" />
                        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-700">
                          PLATOS DE LA CARTA DE HOY <span className="text-xs font-normal text-neutral-400 lowercase">(selección múltiple)</span>
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-500 font-medium">
                        {platosSeleccionados.size} seleccionados
                      </span>
                    </div>

                    {/* Almuerzos */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                        Almuerzos y Segundos
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {candidatosAlmuerzos.map((plato) => {
                          const estaMarcado = platosSeleccionados.has(plato.id);

                          return (
                            <label
                              key={plato.id}
                              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all min-h-[44px] ${
                                estaMarcado
                                  ? 'bg-amber-50/70 border-amber-300 text-neutral-900 shadow-2xs font-semibold'
                                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={estaMarcado}
                                  onChange={() => handleTogglePlato(plato.id)}
                                  className="w-4 h-4 text-[#D35400] rounded-sm focus:ring-amber-300 cursor-pointer"
                                />
                                <span className="text-xs sm:text-sm">{plato.nombre}</span>
                              </div>
                              <span className="text-xs font-mono font-semibold text-neutral-600">
                                S/ {plato.precio.toFixed(2)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Otros (Bebidas, Guarniciones) */}
                    {candidatosOtros.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                          Bebidas y Otros
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {candidatosOtros.map((plato) => {
                            const estaMarcado = platosSeleccionados.has(plato.id);

                            return (
                              <label
                                key={plato.id}
                                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all min-h-[44px] ${
                                  estaMarcado
                                    ? 'bg-amber-50/70 border-amber-300 text-neutral-900 shadow-2xs font-semibold'
                                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={estaMarcado}
                                    onChange={() => handleTogglePlato(plato.id)}
                                    className="w-4 h-4 text-[#D35400] rounded-sm focus:ring-amber-300 cursor-pointer"
                                  />
                                  <span className="text-xs sm:text-sm">{plato.nombre}</span>
                                </div>
                                <span className="text-xs font-mono font-semibold text-neutral-600">
                                  S/ {plato.precio.toFixed(2)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* SECCIÓN 3: Vista 5.2 - Lista de Disponibilidad Activa (Si el menú está guardado) */}
                  {menu && menu.definido && menu.platos.length > 0 && (
                    <section className="space-y-3 pt-4 border-t border-neutral-200/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
                            Disponibilidad Actual en el Servicio
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Platos ofrecidos a mozos y cajeros hoy. Marque agotado cuando se termine la preparación.
                          </p>
                        </div>
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden lg:block rounded-xl border border-neutral-200/80 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-200/80">
                              <th className="py-3 px-6">PLATO</th>
                              <th className="py-3 px-6">CATEGORÍA</th>
                              <th className="py-3 px-6 text-right">PRECIO</th>
                              <th className="py-3 px-6">ESTADO</th>
                              <th className="py-3 px-6 text-right">DISPONIBILIDAD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-sm">
                            {menu.platos.map((plato) => {
                              const estaResaltado = platoResaltadoId === plato.productoId;

                              return (
                                <tr
                                  key={plato.productoId}
                                  className={`transition-colors ${
                                    estaResaltado
                                      ? 'bg-amber-100/60 font-medium'
                                      : 'hover:bg-neutral-50/60'
                                  }`}
                                >
                                  <td className="py-3.5 px-6 font-semibold text-neutral-900">
                                    <div className="flex items-center gap-2">
                                      <span>{plato.nombre}</span>
                                      {estaResaltado && (
                                        <span className="text-[10px] bg-[#D35400] text-white px-1.5 py-0.5 rounded-full font-bold">
                                          Actualizado
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-6 text-neutral-600 text-xs">
                                    {plato.categoria}
                                  </td>
                                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-neutral-800">
                                    S/ {plato.precio.toFixed(2)}
                                  </td>
                                  <td className="py-3.5 px-6">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          plato.agotado ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                      />
                                      <span
                                        className={`text-xs font-semibold ${
                                          plato.agotado
                                            ? 'text-amber-800'
                                            : 'text-emerald-700'
                                        }`}
                                      >
                                        {plato.agotado ? 'Agotado' : 'Disponible'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-6 text-right">
                                    <div className="relative inline-flex items-center justify-end group">
                                      <button
                                        type="button"
                                        onClick={() => handleAbrirDisponibilidadModal(plato)}
                                        title={plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                                        aria-label={plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center border shadow-2xs transition-all cursor-pointer ${
                                          plato.agotado
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                            : 'bg-amber-50 text-[#B84600] border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                                        }`}
                                      >
                                        {plato.agotado ? (
                                          <Power className="w-4 h-4" />
                                        ) : (
                                          <PowerOff className="w-4 h-4" />
                                        )}
                                      </button>

                                      {/* Tooltip flotante */}
                                      <div
                                        role="tooltip"
                                        className="pointer-events-none absolute bottom-full mb-1.5 right-0 z-30 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                      >
                                        {plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                                        <div className="absolute top-full right-3 border-4 border-transparent border-t-neutral-900" />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards for Availability */}
                      <div className="lg:hidden space-y-2.5">
                        {menu.platos.map((plato) => (
                          <div
                            key={plato.productoId}
                            className="p-3.5 rounded-xl border border-neutral-200/90 bg-white flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <h5 className="font-sans font-bold text-sm text-neutral-900">
                                {plato.nombre}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-neutral-500">{plato.categoria}</span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-[11px] font-mono font-semibold text-neutral-700">
                                  S/ {plato.precio.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="relative inline-flex items-center group">
                              <button
                                type="button"
                                onClick={() => handleAbrirDisponibilidadModal(plato)}
                                title={plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                                aria-label={plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                                className={`w-9 h-9 rounded-full inline-flex items-center justify-center border shadow-2xs transition-all cursor-pointer min-h-[36px] min-w-[36px] ${
                                  plato.agotado
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                    : 'bg-amber-50 text-[#B84600] border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                                }`}
                              >
                                {plato.agotado ? (
                                  <Power className="w-4 h-4" />
                                ) : (
                                  <PowerOff className="w-4 h-4" />
                                )}
                              </button>

                              {/* Tooltip flotante */}
                              <div
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full mb-1.5 right-0 z-30 whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              >
                                {plato.agotado ? 'Marcar como disponible' : 'Marcar como agotado'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* BARRA DE GUARDADO INFERIOR ESTÁTICA (shrink-0, border-t) */}
                <div className="shrink-0 p-4 sm:px-6 bg-white border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {tieneCambiosSinGuardar && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#D35400] animate-pulse" />
                        Cambios sin guardar
                      </span>
                    )}

                    {errorValidacionGuardar && (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorValidacionGuardar}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    {tieneCambiosSinGuardar && (
                      <button
                        type="button"
                        onClick={() => setDiscardModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
                      >
                        Descartar cambios
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleGuardarMenu}
                      disabled={guardando}
                      className="px-6 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                    >
                      {guardando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Guardando… (RV-47)</span>
                        </>
                      ) : (
                        <span>Guardar menú del día</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES DEL CUS05 */}
      <MenuDisponibilidadConfirmModal
        isOpen={dispModalOpen}
        onClose={() => setDispModalOpen(false)}
        onConfirm={handleConfirmarDisponibilidad}
        plato={platoAConfirmar}
        nuevoEstadoAgotado={nuevoEstadoAgotado}
        procesando={procesandoDisp}
      />

      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onConfirm={handleDescartarCambios}
      />
    </div>
  );
};

export default MenuDiaPage;
