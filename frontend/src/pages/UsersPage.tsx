import React from 'react';
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
  Trash2
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import { UserFormModal } from '../components/UserFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { obtenerIniciales } from '../utils/avatar';
import { useUsersManagement } from '../hooks/useUsersManagement';
import { StatusBadge } from '../components/StatusBadge';

export interface UsersPageProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ session, onLogout }) => {
  const {
    usuarios,
    total,
    pagina,
    setPagina,
    tamano,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    cargando,
    errorCarga,
    cargarUsuarios,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    usuarioResaltadoId,
    formModalOpen,
    setFormModalOpen,
    usuarioAEditar,
    confirmModalOpen,
    setConfirmModalOpen,
    confirmTipo,
    usuarioAConfirmar,
    procesandoConfirm,
    confirmErrorMovimientos,
    setConfirmErrorMovimientos,
    esAdmin,
    handleQuitarFiltros,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleGuardarUsuario,
    handleAbrirConfirmacion,
    handleConfirmarAccion,
    handleDesactivarDirectoDesdeModal
  } = useUsersManagement({ session, onLogout });

  // Estandarización de estilos para insignias de rol (dimensiones idénticas w-28 h-7)
  const obtenerEstiloRol = (rol: string) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-amber-50 text-amber-900 border-amber-200/90';
      case 'Cajero':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200/90';
      case 'Mozo':
        return 'bg-sky-50 text-sky-900 border-sky-200/90';
      case 'Cocinero':
        return 'bg-orange-50 text-orange-900 border-orange-200/90';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  // RN-07: Si un mozo o no administrador entra por URL
  if (!esAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto text-sm">
          No tiene permiso para acceder a este módulo. Comuníquese con la administradora si requiere acceso.
        </p>
      </div>
    );
  }

  const totalPaginas = Math.ceil(total / tamano) || 1;

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3">
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

      {/* Encabezado Superior ESTÁTICO Y FIJO */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Usuarios
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              {total} usuarios registrados
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Administre el personal, sus roles y el acceso al sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAbrirNuevo}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white font-semibold text-xs shadow-2xs hover:shadow transition-all shrink-0 cursor-pointer min-h-[38px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda ESTÁTICA Y FIJA (shrink-0) */}
      <div className="shrink-0 bg-white rounded-2xl border border-neutral-200/80 px-3.5 py-2 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center">
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
            placeholder="Buscar por nombre o usuario"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors"
          />
        </div>

        {/* Filter Role */}
        <div className="w-full sm:w-48">
          <select
            value={filtroRol}
            onChange={(e) => {
              setFiltroRol(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por rol"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
          >
            <option value="Todos">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Cajero">Cajero</option>
            <option value="Mozo">Mozo</option>
            <option value="Cocinero">Cocinero</option>
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
      <div className="w-full bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Error de carga (MSG-37) */}
        {errorCarga ? (
          <div className="p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-medium text-neutral-700">{errorCarga}</p>
            <button
              type="button"
              onClick={cargarUsuarios}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D35400] text-white text-xs font-semibold hover:bg-[#B84600] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : cargando ? (
          /* Estado de Carga (Sección 7 / Nielsen 1: Texto "Cargando usuarios…" con marcadores de posición) */
          <div className="w-full">
            <div className="px-6 py-2.5 bg-amber-50/60 border-b border-amber-100/80 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-neutral-700">Cargando usuarios…</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">Actualizando lista</span>
            </div>

            <div className="w-full overflow-x-auto">
              {/* Desktop Skeleton Table */}
              <div className="hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E0DB] bg-[#FAF7F4] text-xs font-semibold text-[#7C6F66] uppercase tracking-wider">
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        NOMBRE
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        USUARIO
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        ROL
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        ESTADO
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB] text-right">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE6] animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="hover:bg-neutral-50/40 border-b border-[#F0EBE6]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 shrink-0" />
                            <div className="space-y-1.5">
                              <div className="w-32 h-3.5 bg-neutral-200 rounded" />
                              <div className="w-24 h-2.5 bg-neutral-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-20 h-3 bg-neutral-200 rounded" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-24 h-6 bg-neutral-100 rounded-lg border border-neutral-200/60" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-16 h-3 bg-neutral-200 rounded" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex gap-1.5 justify-end">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Skeleton Cards */}
              <div className="lg:hidden divide-y divide-neutral-100 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-neutral-200 rounded" />
                          <div className="w-20 h-2.5 bg-neutral-100 rounded" />
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-neutral-100 rounded-lg" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="flex-1 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60" />
                      <div className="flex-1 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60" />
                      <div className="flex-1 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : usuarios.length === 0 ? (
          /* Sin Resultados (MSG-36) */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto">
              <FilterX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                No se encontraron usuarios con ese criterio.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Pruebe con otro nombre o quite los filtros.
              </p>
            </div>
            {(busqueda || filtroRol !== 'Todos' || filtroEstado !== 'Todos') && (
              <button
                type="button"
                onClick={handleQuitarFiltros}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <span>Quitar filtros</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contenedor sin Scroll Confinado: Fluye con el scroll principal */}
            <div className="w-full overflow-x-auto">
              {/* Desktop Table matching UsersApp (Vega).png */}
              <div className="hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E0DB] bg-[#FAF7F4] text-xs font-semibold text-[#7C6F66] uppercase tracking-wider">
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        NOMBRE
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        USUARIO
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        ROL
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 border-b border-[#E5E0DB]">
                        ESTADO
                      </th>
                      <th className="sticky top-0 bg-[#FAF7F4] z-10 py-3 px-4 text-right border-b border-[#E5E0DB]">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE6] text-sm">
                  {usuarios.map((u) => {
                    const esResaltado = usuarioResaltadoId === u.id;
                    const esPropiaCuenta = u.usuario.toLowerCase() === session.usuario.toLowerCase();

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors border-b border-[#F0EBE6] ${
                          esResaltado
                            ? 'bg-amber-100/60 font-medium'
                            : 'hover:bg-neutral-50/60'
                        }`}
                      >
                        {/* Nombre con Badge de iniciales */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] text-[#D35400] font-semibold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                              {obtenerIniciales(u.nombre)}
                            </div>
                            <span className="font-semibold text-[#2C1A0E] text-sm break-words">
                              {u.nombre}
                            </span>
                          </div>
                        </td>

                        {/* Usuario */}
                        <td className="py-3 px-4 text-stone-500 font-normal text-xs">
                          @{u.usuario}
                        </td>

                        {/* Rol Pill estandarizada */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border ${obtenerEstiloRol(
                              u.rol
                            )} text-center shadow-2xs`}
                          >
                            {u.rol}
                          </span>
                        </td>

                        {/* Estado Indicator */}
                        <td className="py-3 px-4">
                          <StatusBadge status={u.activo} variant="dot" />
                        </td>

                        {/* Acciones: Botones cuadrados compactos */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Botón Editar */}
                            <button
                              type="button"
                              onClick={(e) => handleAbrirEditar(u, e)}
                              className="w-8 h-8 xl:w-9 xl:h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                              title="Editar usuario"
                              aria-label="Editar usuario"
                            >
                              <Edit2 className="w-4 h-4 xl:w-4.5 xl:h-4.5 text-neutral-600" />
                            </button>

                            {/* Botón dinámico de Estado (Activar / Desactivar) */}
                            {u.activo ? (
                              <button
                                type="button"
                                disabled={esPropiaCuenta}
                                onClick={(e) => handleAbrirConfirmacion(u, 'desactivar', e)}
                                title={
                                  esPropiaCuenta
                                    ? 'No puede desactivar su propia cuenta'
                                    : 'Desactivar usuario'
                                }
                                aria-label={
                                  esPropiaCuenta
                                    ? 'No puede desactivar su propia cuenta'
                                    : 'Desactivar usuario'
                                }
                                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border transition-colors shadow-2xs ${
                                  esPropiaCuenta
                                    ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed'
                                    : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-[#B84600] cursor-pointer'
                                }`}
                              >
                                <PowerOff className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleAbrirConfirmacion(u, 'activar', e)}
                                title="Activar usuario"
                                aria-label="Activar usuario"
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}

                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              disabled={esPropiaCuenta}
                              onClick={(e) => handleAbrirConfirmacion(u, 'eliminar', e)}
                              title={
                                esPropiaCuenta
                                  ? 'No puede eliminar su propia cuenta'
                                  : 'Eliminar usuario'
                              }
                              aria-label={
                                esPropiaCuenta
                                  ? 'No puede eliminar su propia cuenta'
                                  : 'Eliminar usuario'
                              }
                              className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border transition-colors shadow-2xs ${
                                esPropiaCuenta
                                  ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed'
                                  : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards View (Shneiderman 2 Usabilidad Universal con min-h-[38px]) */}
            <div className="lg:hidden divide-y divide-neutral-100">
              {usuarios.map((u) => {
                const esResaltado = usuarioResaltadoId === u.id;
                const esPropiaCuenta = u.usuario.toLowerCase() === session.usuario.toLowerCase();

                return (
                  <div
                    key={u.id}
                    className={`p-4 space-y-3 ${
                      esResaltado ? 'bg-amber-100/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] text-[#D35400] font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                          {obtenerIniciales(u.nombre)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm">{u.nombre}</p>
                          <p className="text-xs text-neutral-500">@{u.usuario}</p>
                        </div>
                      </div>

                      <StatusBadge status={u.activo} variant="dot" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                      <span
                        className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border ${obtenerEstiloRol(
                          u.rol
                        )} text-center shadow-2xs`}
                      >
                        {u.rol}
                      </span>

                      <div className="flex items-center gap-2 font-medium flex-wrap">
                        {/* Botón Editar Móvil con icono + texto */}
                        <button
                          type="button"
                          onClick={(e) => handleAbrirEditar(u, e)}
                          className="h-8 min-h-[38px] px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          title="Editar usuario"
                          aria-label="Editar usuario"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Editar</span>
                        </button>

                        {/* Botón dinámico Estado Móvil con icono + texto */}
                        {u.activo ? (
                          <button
                            type="button"
                            disabled={esPropiaCuenta}
                            onClick={(e) => handleAbrirConfirmacion(u, 'desactivar', e)}
                            title={
                              esPropiaCuenta
                                ? 'No puede desactivar su propia cuenta'
                                : 'Desactivar usuario'
                            }
                            aria-label={
                              esPropiaCuenta
                                ? 'No puede desactivar su propia cuenta'
                                : 'Desactivar usuario'
                            }
                            className={`h-8 min-h-[38px] px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
                              esPropiaCuenta
                                ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed'
                                : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-[#B84600] cursor-pointer'
                            }`}
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Desactivar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleAbrirConfirmacion(u, 'activar', e)}
                            title="Activar usuario"
                            aria-label="Activar usuario"
                            className="h-8 min-h-[38px] px-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>Activar</span>
                          </button>
                        )}

                        {/* Botón Eliminar Móvil con icono + texto */}
                        <button
                          type="button"
                          disabled={esPropiaCuenta}
                          onClick={(e) => handleAbrirConfirmacion(u, 'eliminar', e)}
                          title={
                            esPropiaCuenta
                              ? 'No puede eliminar su propia cuenta'
                              : 'Eliminar usuario'
                          }
                          aria-label={
                            esPropiaCuenta
                              ? 'No puede eliminar su propia cuenta'
                              : 'Eliminar usuario'
                          }
                          className={`h-8 min-h-[38px] px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
                            esPropiaCuenta
                              ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 cursor-not-allowed'
                              : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Footer matching UsersApp (Vega).png */}
          <div className="shrink-0 px-6 py-3.5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 bg-white">
              <p>
                Mostrando{' '}
                <span className="font-semibold text-neutral-700">
                  {usuarios.length}
                </span>{' '}
                de <span className="font-semibold text-neutral-700">{total}</span>{' '}
                usuarios
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
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[38px] min-w-[38px] inline-flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    aria-label="Página siguiente"
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[38px] min-w-[38px] inline-flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Creación y Edición (HU-04, HU-05, RV-11 a RV-20) */}
      <UserFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        usuarioAEditar={usuarioAEditar}
        onSave={handleGuardarUsuario}
      />

      {/* Modal de Confirmación para Desactivar, Activar o Eliminar (HU-06, HU-07, RV-20, MSG-27, 28, 33) */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        tipo={confirmTipo}
        nombreUsuario={usuarioAConfirmar?.nombre || ''}
        loading={procesandoConfirm}
        errorMovimientos={confirmErrorMovimientos}
        onDesactivarDirecto={handleDesactivarDirectoDesdeModal}
        onConfirm={handleConfirmarAccion}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmErrorMovimientos(false);
        }}
      />
      </div>
    </div>
  );
};

export default UsersPage;
