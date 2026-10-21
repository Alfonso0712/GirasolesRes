import React from 'react';
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Edit2,
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import { UserFormModal } from '../components/usuarios';
import {
  ConfirmModal,
  StatusBadge,
  IconActionButton,
  TablePagination,
} from '../components/ui';
import { PageHeader } from '../components/layout';
import { obtenerIniciales } from '../utils/avatar';
import { useUsersManagement } from '../hooks/useUsersManagement';

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
    handleDesactivarDirectoDesdeModal,
  } = useUsersManagement({ session, onLogout });

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

  if (!esAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
          Acceso restringido
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto text-sm">
          No tiene permiso para acceder a este módulo. Comuníquese con la administración si requiere acceso.
        </p>
      </div>
    );
  }

  const totalPaginas = Math.ceil(total / tamano) || 1;
  const tieneFiltros = Boolean(busqueda.trim() || filtroRol !== 'Todos' || filtroEstado !== 'Todos');

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 text-[#482813]">
        {/* Banner de Éxito */}
        {avisoExito && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm shadow-2xs animate-in fade-in slide-in-from-top-2">
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

        {/* Banner de Error */}
        {avisoError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm shadow-2xs animate-in fade-in slide-in-from-top-2">
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

        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Usuarios"
          breadcrumb={['Administración', 'Usuarios']}
          subtitle="Administre el personal, sus roles y los accesos al sistema."
          count={total}
          countLabel="usuarios registrados"
          actions={
            <button
              type="button"
              onClick={handleAbrirNuevo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#C74E00] hover:bg-[#B84500] text-white font-semibold text-xs shadow-2xs hover:shadow transition-all shrink-0 cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo usuario</span>
            </button>
          }
        />

        {/* 2. Barra de Filtros y Búsqueda */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center">
          {/* Búsqueda por Nombre o Usuario */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              maxLength={50}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nombre o usuario..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 bg-neutral-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-[#C74E00] focus:ring-2 focus:ring-[#C74E00]/20 min-h-[40px] transition-all"
            />
          </div>

          {/* Filtro Rol */}
          <div className="w-full sm:w-52">
            <select
              value={filtroRol}
              onChange={(e) => {
                setFiltroRol(e.target.value);
                setPagina(1);
              }}
              aria-label="Filtrar por rol"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white hover:border-neutral-300 focus:outline-hidden focus:border-[#C74E00] focus:ring-2 focus:ring-[#C74E00]/20 min-h-[40px] transition-colors cursor-pointer"
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Cajero">Cajero</option>
              <option value="Mozo">Mozo</option>
              <option value="Cocinero">Cocinero</option>
            </select>
          </div>

          {/* Filtro Estado */}
          <div className="w-full sm:w-52">
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              aria-label="Filtrar por estado"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-white hover:border-neutral-300 focus:outline-hidden focus:border-[#C74E00] focus:ring-2 focus:ring-[#C74E00]/20 min-h-[40px] transition-colors cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {tieneFiltros && (
            <button
              type="button"
              onClick={handleQuitarFiltros}
              className="text-xs font-semibold text-[#B84500] hover:text-[#C74E00] p-2 rounded-xl hover:bg-amber-50 cursor-pointer whitespace-nowrap transition-colors"
            >
              Quitar filtros
            </button>
          )}
        </div>

        {/* 3. Contenedor de la Tabla */}
        <div className="w-full bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          {errorCarga ? (
            <div className="p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-medium text-neutral-700">{errorCarga}</p>
              <button
                type="button"
                onClick={cargarUsuarios}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C74E00] text-white text-xs font-semibold hover:bg-[#B84500] transition-colors cursor-pointer min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          ) : cargando ? (
            <div className="p-6 space-y-3">
              <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
              <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
              <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-12 text-center space-y-3 text-neutral-500">
              <p className="text-sm font-semibold text-neutral-800">
                No se encontraron usuarios con ese criterio.
              </p>
              <p className="text-xs text-neutral-500">
                Pruebe con otro nombre o quite los filtros aplicados.
              </p>
              {tieneFiltros && (
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
              {/* Tabla Desktop */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-[#FAF7F4] text-[#7C6F66] text-xs uppercase font-semibold tracking-wider border-b border-[#E5E0DB]">
                    <tr>
                      <th className="py-3.5 px-4">Nombre</th>
                      <th className="py-3.5 px-4">Usuario</th>
                      <th className="py-3.5 px-4">Rol</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-center">Acciones</th>
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
                              : 'hover:bg-neutral-50/70'
                          }`}
                        >
                          {/* Nombre */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] text-[#B84500] font-semibold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                                {obtenerIniciales(u.nombre)}
                              </div>
                              <span className="font-semibold text-[#2C1A0E] text-sm break-words">
                                {u.nombre}
                              </span>
                            </div>
                          </td>

                          {/* Usuario */}
                          <td className="py-3 px-4 text-neutral-500 font-normal text-xs">
                            @{u.usuario}
                          </td>

                          {/* Rol Pill */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg text-xs font-semibold py-1 px-2.5 border ${obtenerEstiloRol(
                                u.rol
                              )} text-center shadow-2xs whitespace-nowrap`}
                            >
                              {u.rol}
                            </span>
                          </td>

                          {/* Estado con StatusBadge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <StatusBadge
                              status={u.activo}
                              activeLabel="Activo"
                              inactiveLabel="Inactivo"
                            />
                          </td>

                          {/* Acciones con IconActionButton */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              {/* Botón Editar */}
                              <IconActionButton
                                icon={Edit2}
                                label="Editar usuario"
                                onClick={(e) => handleAbrirEditar(u, e)}
                              />

                              {/* Botón Estado (Activar / Desactivar) */}
                              {u.activo ? (
                                <IconActionButton
                                  icon={PowerOff}
                                  label="Desactivar usuario"
                                  variant="warning"
                                  disabled={esPropiaCuenta}
                                  disabledReason="No puede desactivar su propia cuenta"
                                  onClick={(e) => handleAbrirConfirmacion(u, 'desactivar', e)}
                                />
                              ) : (
                                <IconActionButton
                                  icon={Power}
                                  label="Activar usuario"
                                  variant="success"
                                  onClick={(e) => handleAbrirConfirmacion(u, 'activar', e)}
                                />
                              )}

                              {/* Botón Eliminar */}
                              <IconActionButton
                                icon={Trash2}
                                label="Eliminar usuario"
                                variant="danger"
                                disabled={esPropiaCuenta}
                                disabledReason="No puede eliminar su propia cuenta"
                                onClick={(e) => handleAbrirConfirmacion(u, 'eliminar', e)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil / Tablet Cards */}
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
                          <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] text-[#B84500] font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                            {obtenerIniciales(u.nombre)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-sm">{u.nombre}</p>
                            <p className="text-xs text-neutral-500">@{u.usuario}</p>
                          </div>
                        </div>

                        <StatusBadge
                          status={u.activo}
                          activeLabel="Activo"
                          inactiveLabel="Inactivo"
                        />
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
                          <IconActionButton
                            icon={Edit2}
                            label="Editar usuario"
                            onClick={(e) => handleAbrirEditar(u, e)}
                          />

                          {u.activo ? (
                            <IconActionButton
                              icon={PowerOff}
                              label="Desactivar usuario"
                              variant="warning"
                              disabled={esPropiaCuenta}
                              disabledReason="No puede desactivar su propia cuenta"
                              onClick={(e) => handleAbrirConfirmacion(u, 'desactivar', e)}
                            />
                          ) : (
                            <IconActionButton
                              icon={Power}
                              label="Activar usuario"
                              variant="success"
                              onClick={(e) => handleAbrirConfirmacion(u, 'activar', e)}
                            />
                          )}

                          <IconActionButton
                            icon={Trash2}
                            label="Eliminar usuario"
                            variant="danger"
                            disabled={esPropiaCuenta}
                            disabledReason="No puede eliminar su propia cuenta"
                            onClick={(e) => handleAbrirConfirmacion(u, 'eliminar', e)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 4. Paginación Unificada */}
          <TablePagination
            currentPage={pagina}
            totalPages={totalPaginas}
            totalItems={total}
            itemsPerPage={tamano}
            entityName="usuarios"
            onPageChange={setPagina}
          />
        </div>

        {/* Modal de Creación y Edición */}
        <UserFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          usuarioAEditar={usuarioAEditar}
          onSave={handleGuardarUsuario}
        />

        {/* Modal de Confirmación */}
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
