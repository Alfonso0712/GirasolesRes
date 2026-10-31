import React from 'react';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import type { UserSession } from '../types/auth';
import {
  UserFormModal,
  UsersFilterBar,
  UsersTable,
} from '../components/usuarios';
import {
  ConfirmModal,
  TablePagination,
} from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
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


  if (!esAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-danger rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
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
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
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
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-2xs hover:shadow transition-all shrink-0 cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo usuario</span>
            </button>
          }
        />

        {/* 2. Barra de Filtros y Búsqueda */}
        <UsersFilterBar
          busqueda={busqueda}
          onBusquedaChange={(val) => {
            setBusqueda(val);
            setPagina(1);
          }}
          filtroRol={filtroRol}
          onFiltroRolChange={(val) => {
            setFiltroRol(val);
            setPagina(1);
          }}
          filtroEstado={filtroEstado}
          onFiltroEstadoChange={(val) => {
            setFiltroEstado(val);
            setPagina(1);
          }}
          tieneFiltros={tieneFiltros}
          onQuitarFiltros={handleQuitarFiltros}
        />

        {/* 3. Tabla Principal */}
        <UsersTable
          usuarios={usuarios}
          cargando={cargando}
          errorCarga={errorCarga}
          onRetry={cargarUsuarios}
          tieneFiltros={tieneFiltros}
          onQuitarFiltros={handleQuitarFiltros}
          usuarioResaltadoId={usuarioResaltadoId}
          currentUsername={session.usuario}
          onAbrirEditar={handleAbrirEditar}
          onAbrirConfirmacion={handleAbrirConfirmacion}
        />

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
          usuarioActivo={usuarioAConfirmar?.activo}
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
