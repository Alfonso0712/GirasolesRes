import React from 'react';
import { Edit2, PowerOff, Power, Trash2 } from 'lucide-react';
import {
  DataTable,
  TableHead,
  TableBody,
  StatusBadge,
  IconActionButton,
} from '../ui';
import { obtenerIniciales } from '../../utils/avatar';
import type { UsuarioItem } from '../../types/usuario';

export interface UsersTableProps {
  usuarios: UsuarioItem[];
  cargando: boolean;
  errorCarga: string | null;
  onRetry: () => void;
  tieneFiltros: boolean;
  onQuitarFiltros: () => void;
  usuarioResaltadoId: string | null;
  currentUsername: string;
  onAbrirEditar: (usuario: UsuarioItem, e: React.MouseEvent<HTMLButtonElement>) => void;
  onAbrirConfirmacion: (usuario: UsuarioItem, tipo: 'activar' | 'desactivar' | 'eliminar', e: React.MouseEvent<HTMLButtonElement>) => void;
}

const obtenerEstiloRol = (rol: string) => {
  switch (rol) {
    case 'Administrador':
      return 'bg-amber-50 text-amber-900 border-amber-200/90';
    case 'Cajero':
      return 'bg-emerald-50 text-emerald-900 border-emerald-200/90';
    case 'Mozo':
      return 'bg-role-mozo-bg text-role-mozo-text border-role-mozo-border';
    case 'Cocinero':
      return 'bg-role-cocinero-bg text-role-cocinero-text border-role-cocinero-border';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
};

export const UsersTable: React.FC<UsersTableProps> = ({
  usuarios,
  cargando,
  errorCarga,
  onRetry,
  tieneFiltros,
  onQuitarFiltros,
  usuarioResaltadoId,
  currentUsername,
  onAbrirEditar,
  onAbrirConfirmacion,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRetry}
      isEmpty={usuarios.length === 0}
      emptyTitle="No se encontraron usuarios"
      emptyMessage={
        tieneFiltros
          ? 'No hay usuarios que coincidan con los filtros aplicados. Pruebe con otro nombre o quite los filtros.'
          : 'Aún no se han registrado usuarios en el sistema.'
      }
      emptyActionLabel={tieneFiltros ? 'Quitar filtros' : undefined}
      onEmptyAction={tieneFiltros ? onQuitarFiltros : undefined}
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
          const esPropiaCuenta = u.usuario.toLowerCase() === currentUsername.toLowerCase();

          return (
            <tr
              key={u.id}
              className={`transition-colors border-b border-line-soft ${
                esResaltado
                  ? 'bg-amber-100/60 font-medium'
                  : 'hover:bg-neutral-50/70'
              }`}
            >
              {/* Nombre */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-tint text-accent font-semibold text-xs flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                    {obtenerIniciales(u.nombre)}
                  </div>
                  <span className="font-semibold text-ink text-sm break-words">
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
                    onClick={(e) => onAbrirEditar(u, e)}
                  />

                  {/* Botón Estado (Activar / Desactivar) */}
                  {u.activo ? (
                    <IconActionButton
                      icon={PowerOff}
                      label="Desactivar usuario"
                      variant="deactivate"
                      disabled={esPropiaCuenta}
                      disabledReason="No puede desactivar ni eliminar su propia cuenta."
                      onClick={(e) => onAbrirConfirmacion(u, 'desactivar', e)}
                    />
                  ) : (
                    <IconActionButton
                      icon={Power}
                      label="Activar usuario"
                      variant="activate"
                      onClick={(e) => onAbrirConfirmacion(u, 'activar', e)}
                    />
                  )}

                  {/* Botón Eliminar */}
                  <IconActionButton
                    icon={Trash2}
                    label="Eliminar usuario"
                    variant="delete"
                    disabled={esPropiaCuenta}
                    disabledReason="No puede desactivar ni eliminar su propia cuenta."
                    onClick={(e) => onAbrirConfirmacion(u, 'eliminar', e)}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </TableBody>
    </DataTable>
  );
};
