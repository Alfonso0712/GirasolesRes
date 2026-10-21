import React from 'react';
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
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
  DataTable,
  TableHead,
  TableBody,
} from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
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
      <PageContainer>
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

        {/* 3. Tabla Principal con DataTable */}
        <DataTable
          loading={cargando}
          error={errorCarga}
          onRetry={cargarUsuarios}
          isEmpty={usuarios.length === 0}
          emptyTitle="No se encontraron usuarios"
          emptyMessage={
            tieneFiltros
              ? 'No hay usuarios que coincidan con los filtros aplicados. Pruebe con otro nombre o quite los filtros.'
              : 'Aún no se han registrado usuarios en el sistema.'
          }
          emptyActionLabel={tieneFiltros ? 'Quitar filtros' : undefined}
          onEmptyAction={tieneFiltros ? handleQuitarFiltros : undefined}
          minWidth="min-w-[700px]"
        >
          <TableHead>
            <tr>
              <th scope="col" className="py-3.5 px-4">Nombre</th>
              <th scope="col" className="py-3.5 px-4">Usuario</th>
              <th scope="col" className="py-3.5 px-4">Rol</th>
              <th scope="col" className="py-3.5 px-4">Estado</th>
              <th scope="col" className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </TableHead>
          <TableBody>
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
                                variant="edit"
                                onClick={(e) => handleAbrirEditar(u, e)}
                              />

                              {/* Botón Estado (Activar / Desactivar) */}
                              {u.activo ? (
                                <IconActionButton
                                  icon={PowerOff}
                                  label="Desactivar usuario"
                                  variant="deactivate"
                                  disabled={esPropiaCuenta}
                                  disabledReason="No puede desactivar su propia cuenta"
                                  onClick={(e) => handleAbrirConfirmacion(u, 'desactivar', e)}
                                />
                              ) : (
                                <IconActionButton
                                  icon={Power}
                                  label="Activar usuario"
                                  variant="activate"
                                  onClick={(e) => handleAbrirConfirmacion(u, 'activar', e)}
                                />
                              )}

                              {/* Botón Eliminar */}
                              <IconActionButton
                                icon={Trash2}
                                label="Eliminar usuario"
                                variant="delete"
                                disabled={esPropiaCuenta}
                                disabledReason="No puede eliminar su propia cuenta"
                                onClick={(e) => handleAbrirConfirmacion(u, 'eliminar', e)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
          </TableBody>
        </DataTable>

        {/* 4. Paginación Unificada */}
        <TablePagination
          currentPage={pagina}
          totalPages={totalPaginas}
          totalItems={total}
          itemsPerPage={tamano}
          entityName="usuarios"
          onPageChange={setPagina}
        />

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
      </PageContainer>
    </div>
  );
};

export default UsersPage;
