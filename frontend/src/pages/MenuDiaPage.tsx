import React, { useState } from 'react';
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
  ArrowRight,
  Flame,
  CupSoda,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Grid
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import type { CandidatoMenu } from '../types/menuDia';
import { CATEGORIA_LABELS } from '../types/producto';
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

type TabMenu =
  | 'almuerzos'
  | 'extras'
  | 'desayunos'
  | 'combinados'
  | 'bebidas'
  | 'otros'
  | 'disponibilidad'
  | 'todos';

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
    handleSeleccionarVarios,
    handleDesmarcarVarios,
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

  // Pestaña activa (por defecto Almuerzos)
  const [tabActiva, setTabActiva] = useState<TabMenu>('almuerzos');

  // Estado para secciones en modo Acordeón ("todos")
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<Record<string, boolean>>({
    desayunos: true,
    almuerzos: true,
    extras: true,
    combinados: true,
    bebidas: true,
    otros: true,
    disponibilidad: true
  });

  const toggleSeccion = (seccion: string) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

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
          No tiene permiso para acceder a este módulo. Esta pantalla está reservada para administración y cocina.
        </p>
      </div>
    );
  }

  // Agrupamiento de candidatos por categoría
  const candidatosDesayunos = candidatos.filter((c) => c.categoria === 'Desayuno');
  const candidatosAlmuerzos = candidatos.filter((c) => c.categoria === 'Almuerzo');
  const candidatosExtras = candidatos.filter(
    (c) =>
      c.categoria === 'PlatosExtras' ||
      c.categoria === 'Platos Extras' ||
      c.categoria === 'Platos Extras / A la Carta'
  );
  const candidatosCombinados = candidatos.filter((c) => c.categoria === 'Combinados');
  const candidatosBebidas = candidatos.filter(
    (c) => c.categoria === 'Bebidas' || c.categoria === 'Bebidas y Refrescos'
  );
  const candidatosOtros = candidatos.filter((c) => c.categoria === 'Otro' || c.categoria === 'Otros');
  const noHayCandidatosActivos = candidatos.length === 0;

  // Contadores de selección en tiempo real
  const cantDesayunos = desayunoSeleccionado !== null ? 1 : 0;
  const cantAlmuerzos = candidatosAlmuerzos.filter((c) => platosSeleccionados.has(c.id)).length;
  const cantExtras = candidatosExtras.filter((c) => platosSeleccionados.has(c.id)).length;
  const cantCombinados = candidatosCombinados.filter((c) => platosSeleccionados.has(c.id)).length;
  const cantBebidas = candidatosBebidas.filter((c) => platosSeleccionados.has(c.id)).length;
  const cantOtros = candidatosOtros.filter((c) => platosSeleccionados.has(c.id)).length;
  const totalSeleccionados = cantDesayunos + platosSeleccionados.size;

  // Toggle de selección masiva por categoría
  const toggleSeleccionCategoria = (items: CandidatoMenu[]) => {
    const ids = items.map((i) => i.id);
    if (ids.length === 0) return;
    const todosSeleccionados = ids.every((id) => platosSeleccionados.has(id));
    if (todosSeleccionados) {
      handleDesmarcarVarios(ids);
    } else {
      handleSeleccionarVarios(ids);
    }
  };

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

  // Configuración de pestañas
  const tabsNav: {
    id: TabMenu;
    label: string;
    count: number;
    total: number;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'almuerzos',
      label: 'Almuerzos y Segundos',
      count: cantAlmuerzos,
      total: candidatosAlmuerzos.length,
      icon: UtensilsCrossed,
      accentColor: 'border-orange-500'
    },
    {
      id: 'extras',
      label: 'Platos Extras / A la Carta',
      count: cantExtras,
      total: candidatosExtras.length,
      icon: Sparkles,
      accentColor: 'border-rose-500'
    },
    {
      id: 'desayunos',
      label: 'Desayunos',
      count: cantDesayunos,
      total: candidatosDesayunos.length,
      icon: Coffee,
      accentColor: 'border-amber-500'
    },
    {
      id: 'combinados',
      label: 'Combinados',
      count: cantCombinados,
      total: candidatosCombinados.length,
      icon: Flame,
      accentColor: 'border-purple-500'
    },
    {
      id: 'bebidas',
      label: 'Bebidas y Refrescos',
      count: cantBebidas,
      total: candidatosBebidas.length,
      icon: CupSoda,
      accentColor: 'border-emerald-500'
    },
    {
      id: 'otros',
      label: 'Otros y Guarniciones',
      count: cantOtros,
      total: candidatosOtros.length,
      icon: Layers,
      accentColor: 'border-sky-500'
    }
  ];

  if (menu && menu.definido && menu.platos.length > 0) {
    tabsNav.push({
      id: 'disponibilidad',
      label: 'Disponibilidad en Servicio',
      count: menu.platos.length,
      total: menu.platos.length,
      icon: CheckCircle2,
      accentColor: 'border-emerald-600'
    });
  }

  // Renderizadores de secciones individuales
  const renderSeccionDesayunos = () => (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D35400] flex items-center justify-center border border-amber-200">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-800">
              Desayuno del Día
            </h3>
            <p className="text-xs text-neutral-500">
              Selección única y opcional. Define el desayuno especial ofrecido hoy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            {cantDesayunos > 0 ? '1 seleccionado' : 'Sin desayuno seleccionado'}
          </span>
          {desayunoSeleccionado && (
            <button
              type="button"
              onClick={() => handleSeleccionarDesayuno(null)}
              className="text-xs text-[#D35400] hover:text-[#B84600] font-semibold cursor-pointer underline"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Opción Ninguno */}
        <label
          className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all min-h-[44px] ${
            desayunoSeleccionado === null
              ? 'bg-neutral-100/80 border-neutral-300 text-neutral-900 font-semibold shadow-2xs'
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
          <span className="text-xs sm:text-sm">Sin desayuno especial hoy</span>
        </label>

        {/* Lista de desayunos activos */}
        {candidatosDesayunos.map((des) => {
          const esSeleccionado = desayunoSeleccionado === des.id;

          return (
            <label
              key={des.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all min-h-[44px] ${
                esSeleccionado
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs font-semibold ring-1 ring-amber-300'
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
              <span className="text-xs font-mono font-semibold text-neutral-700 shrink-0">
                S/ {des.precio.toFixed(2)}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );

  const renderSeccionMultiples = (
    titulo: string,
    descripcion: string,
    Icono: React.ComponentType<{ className?: string }>,
    items: CandidatoMenu[],
    cantSeleccionados: number,
    colorIcono: string = 'text-[#D35400] bg-amber-50 border-amber-200'
  ) => {
    const todosSeleccionados = items.length > 0 && items.every((i) => platosSeleccionados.has(i.id));

    return (
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorIcono}`}>
              <Icono className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-800">
                {titulo}
              </h3>
              <p className="text-xs text-neutral-500">{descripcion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                cantSeleccionados > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
            >
              {cantSeleccionados} de {items.length} seleccionados
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => toggleSeleccionCategoria(items)}
                className="inline-flex items-center gap-1.5 text-xs text-[#D35400] hover:text-[#B84600] font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-50/60 transition-colors"
              >
                {todosSeleccionados ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Desmarcar todos</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Seleccionar todos</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
            No hay productos registrados en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((plato) => {
              const estaMarcado = platosSeleccionados.has(plato.id);

              return (
                <label
                  key={plato.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all min-h-[44px] ${
                    estaMarcado
                      ? 'bg-amber-50/70 border-amber-300 text-neutral-900 shadow-2xs font-semibold ring-1 ring-amber-300/60'
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
                  <span className="text-xs font-mono font-semibold text-neutral-600 shrink-0">
                    S/ {plato.precio.toFixed(2)}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const renderSeccionDisponibilidad = () => {
    if (!menu || !menu.definido || menu.platos.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
          Aún no hay platos en el menú del día actual. Defina y guarde la selección para gestionar la disponibilidad.
        </div>
      );
    }

    const disponiblesCount = menu.platos.filter((p) => !p.agotado).length;
    const agotadosCount = menu.platos.filter((p) => p.agotado).length;

    return (
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
              Disponibilidad Actual en el Servicio
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Platos ofrecidos a mozos y cajeros hoy. Marque agotado cuando se termine la preparación.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {disponiblesCount} disponibles
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              {agotadosCount} agotados
            </span>
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
                      estaResaltado ? 'bg-amber-100/60 font-medium' : 'hover:bg-neutral-50/60'
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
                      {CATEGORIA_LABELS[plato.categoria] || plato.categoria}
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
                            plato.agotado ? 'text-amber-800' : 'text-emerald-700'
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
                          {plato.agotado ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {menu.platos.map((plato) => (
            <div
              key={plato.productoId}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                plato.agotado ? 'bg-neutral-50 border-neutral-200 opacity-90' : 'bg-white border-neutral-200/80 shadow-2xs'
              }`}
            >
              <div>
                <h4 className="font-semibold text-sm text-neutral-900">{plato.nombre}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-500">
                    {CATEGORIA_LABELS[plato.categoria] || plato.categoria}
                  </span>
                  <span className="text-xs font-mono font-semibold text-neutral-800">
                    S/ {plato.precio.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAbrirDisponibilidadModal(plato)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
                  plato.agotado
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-[#B84600] border-amber-200'
                }`}
              >
                {plato.agotado ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                <span>{plato.agotado ? 'Reactivar' : 'Agotar'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 gap-3 sm:gap-4">
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
          <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">
            {esCocinero ? 'COCINA Y SERVICIO' : 'GESTIÓN DE LA CARTA'}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
              Menú del Día
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#D35400]" />
              <span className="capitalize">{fechaHoyFormateada}</span>
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {esCocinero
              ? 'Consulte los platos de la carta de hoy y actualice su disponibilidad en tiempo real.'
              : 'Defina los platos disponibles de la carta peruana para el servicio de hoy de manera ágil.'}
          </p>
        </div>

        {/* Indicador de estado del menú en la cabecera */}
        {menu && (
          <div className="shrink-0 flex items-center gap-2">
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
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto border border-amber-200">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-sans font-bold text-neutral-800 mb-1">
                    Menú no disponible
                  </h3>
                  <p className="text-sm text-neutral-600">
                    No hay menú definido para hoy. La administradora debe definirlo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="shrink-0 px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    Mostrando <strong className="text-neutral-800">{menu.platos.length}</strong> platos en el menú de hoy
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Toque el botón para cambiar disponibilidad
                  </span>
                </div>

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
                              <h4 className="font-sans font-bold text-base text-neutral-900">
                                {plato.nombre}
                              </h4>
                              {estaResaltado && (
                                <span className="text-[10px] bg-[#D35400] text-white px-2 py-0.5 rounded-full font-bold">
                                  Actualizado
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">
                              {CATEGORIA_LABELS[plato.categoria] || plato.categoria}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                          <span
                            className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border shadow-2xs ${
                              plato.agotado
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {plato.agotado ? 'Agotado' : 'Disponible'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAbrirDisponibilidadModal(plato)}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                              plato.agotado
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                          >
                            {plato.agotado ? (
                              <>
                                <Power className="w-4 h-4" />
                                <span>Marcar disponible</span>
                              </>
                            ) : (
                              <>
                                <PowerOff className="w-4 h-4" />
                                <span>Marcar agotado</span>
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
             VISTA DEL ADMINISTRADOR: NAVEGACIÓN EN TABS Y ACORDEÓN (CUS05)
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
                    Registre productos antes de definir el menú.
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
                {/* Banner de menú no definido para hoy */}
                {menu && !menu.definido && (
                  <div className="shrink-0 p-3 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#D35400] shrink-0" />
                      <span className="font-medium">
                        Todavía no definió el menú de hoy. Seleccione los productos en cada pestaña y pulse{' '}
                        <strong>Guardar menú del día</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    BARRA SUPERIOR DE TABS / PESTAÑAS (SHRINK-0)
                    Evita el scroll vertical excesivo y navega al instante
                   ======================================================== */}
                <div className="shrink-0 bg-neutral-50/90 border-b border-neutral-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto [&::-webkit-scrollbar]:h-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {tabsNav.map((tab) => {
                      const Icono = tab.icon;
                      const esActiva = tabActiva === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTabActiva(tab.id)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                            esActiva
                              ? 'bg-white text-[#D35400] border-amber-300 shadow-2xs ring-1 ring-amber-300/60'
                              : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 border-transparent'
                          }`}
                        >
                          <Icono className={`w-4 h-4 ${esActiva ? 'text-[#D35400]' : 'text-neutral-500'}`} />
                          <span>{tab.label}</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              tab.count > 0
                                ? esActiva
                                  ? 'bg-[#D35400] text-white'
                                  : 'bg-amber-100 text-[#B84600]'
                                : 'bg-neutral-200/80 text-neutral-500'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón de alternancia a Vista Completa (Acordeón) */}
                  <div className="shrink-0 pl-2 border-l border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setTabActiva(tabActiva === 'todos' ? 'almuerzos' : 'todos')}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                        tabActiva === 'todos'
                          ? 'bg-[#482813] text-white border-[#482813] shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                      title={tabActiva === 'todos' ? 'Volver a pestañas individuales' : 'Ver todas las categorías en acordeón'}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>{tabActiva === 'todos' ? 'Por Pestañas' : 'Vista Completa'}</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================
                    ÁREA DE CONTENIDO CON SCROLL CONFINADO (FLEX-1)
                   ======================================================== */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
                  {/* CASO A: TAB INDIVIDUAL */}
                  {tabActiva === 'desayunos' && renderSeccionDesayunos()}

                  {tabActiva === 'almuerzos' &&
                    renderSeccionMultiples(
                      'Almuerzos y Segundos',
                      'Menú del día estándar, sopas y entradas criollas',
                      UtensilsCrossed,
                      candidatosAlmuerzos,
                      cantAlmuerzos,
                      'text-orange-600 bg-orange-50 border-orange-200'
                    )}

                  {tabActiva === 'extras' &&
                    renderSeccionMultiples(
                      'Platos Extras / A la Carta',
                      'Lomo saltado, ceviches, bistec, caldos criollos y platos a la carta',
                      Sparkles,
                      candidatosExtras,
                      cantExtras,
                      'text-rose-600 bg-rose-50 border-rose-200'
                    )}

                  {tabActiva === 'combinados' &&
                    renderSeccionMultiples(
                      'Combinados',
                      'Dúos marinos, chaufa con chicharrón y platos compuestos',
                      Flame,
                      candidatosCombinados,
                      cantCombinados,
                      'text-purple-600 bg-purple-50 border-purple-200'
                    )}

                  {tabActiva === 'bebidas' &&
                    renderSeccionMultiples(
                      'Bebidas y Refrescos',
                      'Gaseosas personales/familiares, aguas y jarras artesanales (500ml y 1L)',
                      CupSoda,
                      candidatosBebidas,
                      cantBebidas,
                      'text-emerald-600 bg-emerald-50 border-emerald-200'
                    )}

                  {tabActiva === 'otros' &&
                    renderSeccionMultiples(
                      'Otros y Guarniciones',
                      'Porciones adicionales, arroz, papas y guarniciones de la casa',
                      Layers,
                      candidatosOtros,
                      cantOtros,
                      'text-sky-600 bg-sky-50 border-sky-200'
                    )}

                  {tabActiva === 'disponibilidad' && renderSeccionDisponibilidad()}

                  {/* CASO B: MODO ACORDEÓN / VISTA COMPLETA */}
                  {tabActiva === 'todos' && (
                    <div className="space-y-4">
                      {/* Acordeón: Desayunos */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('desayunos')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Coffee className="w-4 h-4 text-[#D35400]" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Desayunos
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-[#B84600]">
                              {cantDesayunos} seleccionados
                            </span>
                          </div>
                          {seccionesAbiertas.desayunos ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.desayunos && <div className="p-4">{renderSeccionDesayunos()}</div>}
                      </div>

                      {/* Acordeón: Almuerzos */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('almuerzos')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Almuerzos y Segundos
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                              {cantAlmuerzos} seleccionados
                            </span>
                          </div>
                          {seccionesAbiertas.almuerzos ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.almuerzos && (
                          <div className="p-4">
                            {renderSeccionMultiples(
                              'Almuerzos y Segundos',
                              'Menú del día estándar, sopas y entradas criollas',
                              UtensilsCrossed,
                              candidatosAlmuerzos,
                              cantAlmuerzos,
                              'text-orange-600 bg-orange-50 border-orange-200'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acordeón: Platos Extras */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('extras')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-rose-600" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Platos Extras / A la Carta
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              {cantExtras} seleccionados
                            </span>
                          </div>
                          {seccionesAbiertas.extras ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.extras && (
                          <div className="p-4">
                            {renderSeccionMultiples(
                              'Platos Extras / A la Carta',
                              'Lomo saltado, ceviches, bistec, caldos criollos y platos a la carta',
                              Sparkles,
                              candidatosExtras,
                              cantExtras,
                              'text-rose-600 bg-rose-50 border-rose-200'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acordeón: Combinados */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('combinados')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Flame className="w-4 h-4 text-purple-600" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Combinados
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              {cantCombinados} seleccionados
                            </span>
                          </div>
                          {seccionesAbiertas.combinados ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.combinados && (
                          <div className="p-4">
                            {renderSeccionMultiples(
                              'Combinados',
                              'Dúos marinos, chaufa con chicharrón y platos compuestos',
                              Flame,
                              candidatosCombinados,
                              cantCombinados,
                              'text-purple-600 bg-purple-50 border-purple-200'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acordeón: Bebidas */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('bebidas')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <CupSoda className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Bebidas y Refrescos
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {cantBebidas} seleccionadas
                            </span>
                          </div>
                          {seccionesAbiertas.bebidas ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.bebidas && (
                          <div className="p-4">
                            {renderSeccionMultiples(
                              'Bebidas y Refrescos',
                              'Gaseosas personales/familiares, aguas y jarras artesanales (500ml y 1L)',
                              CupSoda,
                              candidatosBebidas,
                              cantBebidas,
                              'text-emerald-600 bg-emerald-50 border-emerald-200'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acordeón: Otros */}
                      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleSeccion('otros')}
                          className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-sky-600" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                              Otros y Guarniciones
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                              {cantOtros} seleccionados
                            </span>
                          </div>
                          {seccionesAbiertas.otros ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        {seccionesAbiertas.otros && (
                          <div className="p-4">
                            {renderSeccionMultiples(
                              'Otros y Guarniciones',
                              'Porciones adicionales, arroz, papas y guarniciones de la casa',
                              Layers,
                              candidatosOtros,
                              cantOtros,
                              'text-sky-600 bg-sky-50 border-sky-200'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acordeón: Disponibilidad (si el menú está definido) */}
                      {menu && menu.definido && menu.platos.length > 0 && (
                        <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => toggleSeccion('disponibilidad')}
                            className="w-full px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                                Disponibilidad en Servicio
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {menu.platos.length} platos en carta
                              </span>
                            </div>
                            {seccionesAbiertas.disponibilidad ? (
                              <ChevronUp className="w-4 h-4 text-neutral-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-neutral-500" />
                            )}
                          </button>
                          {seccionesAbiertas.disponibilidad && (
                            <div className="p-4">{renderSeccionDisponibilidad()}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========================================================
                    BARRA DE GUARDADO PERMANENTE Y FIJA AL PIE (SHRINK-0)
                    Siempre visible sin importar en qué pestaña se navegue
                   ======================================================== */}
                <div className="shrink-0 p-4 sm:px-6 bg-white border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    {/* Contador total en carta */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-500">Total en carta:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-[#B84600] border border-amber-200 text-xs font-bold font-mono">
                        {totalSeleccionados} {totalSeleccionados === 1 ? 'producto' : 'productos'}
                      </span>
                      {desayunoSeleccionado && (
                        <span className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md font-medium">
                          + 1 desayuno
                        </span>
                      )}
                    </div>

                    {tieneCambiosSinGuardar && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#D35400]" />
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
                          <span>Guardando menú…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Guardar menú del día</span>
                        </>
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
