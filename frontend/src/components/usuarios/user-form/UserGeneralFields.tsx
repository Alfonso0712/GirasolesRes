import React from 'react';
import type { RolUsuario } from '../../../types/usuario';

export interface UserGeneralFieldsProps {
  nombre: string;
  onNombreChange: (val: string) => void;
  nombreInputRef: React.RefObject<HTMLInputElement | null>;
  usuario: string;
  onUsuarioChange: (val: string) => void;
  usuarioInputRef: React.RefObject<HTMLInputElement | null>;
  rol: RolUsuario;
  onRolChange: (val: RolUsuario) => void;
  rolSelectRef: React.RefObject<HTMLSelectElement | null>;
  correo: string;
  onCorreoChange: (val: string) => void;
  correoInputRef: React.RefObject<HTMLInputElement | null>;
  errores: Record<string, string>;
}

export const UserGeneralFields: React.FC<UserGeneralFieldsProps> = ({
  nombre,
  onNombreChange,
  nombreInputRef,
  usuario,
  onUsuarioChange,
  usuarioInputRef,
  rol,
  onRolChange,
  rolSelectRef,
  correo,
  onCorreoChange,
  correoInputRef,
  errores,
}) => {
  return (
    <>
      {/* Nombre Completo */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="form-label-standard !mb-0">
            Nombre completo <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-neutral-500 tabular-nums">
            {nombre.length}/60
          </span>
        </div>
        <input
          ref={nombreInputRef}
          type="text"
          value={nombre}
          maxLength={60}
          onChange={(e) => onNombreChange(e.target.value)}
          onBlur={() => onNombreChange(nombre.trim())}
          placeholder="Ej. Ana Torres"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
            errores.nombre
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
              : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
          }`}
        />
        {errores.nombre && (
          <p className="text-xs text-danger mt-1 font-medium">{errores.nombre}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Usuario */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="form-label-standard !mb-0">
              Nombre de usuario <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-neutral-500 tabular-nums">
              {usuario.length}/30
            </span>
          </div>
          <input
            ref={usuarioInputRef}
            type="text"
            value={usuario}
            maxLength={30}
            onChange={(e) => onUsuarioChange(e.target.value)}
            onBlur={() => onUsuarioChange(usuario.trim().toLowerCase())}
            placeholder="atorres"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
              errores.usuario
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
            }`}
          />
          {errores.usuario && (
            <p className="text-xs text-danger mt-1 font-medium">{errores.usuario}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="form-label-standard">
            Rol en el restaurante <span className="text-rose-500">*</span>
          </label>
          <select
            ref={rolSelectRef}
            value={rol}
            onChange={(e) => onRolChange(e.target.value as RolUsuario)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors bg-surface ${
              errores.rol
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
            }`}
          >
            <option value="Administrador">Administrador</option>
            <option value="Cajero">Cajero</option>
            <option value="Mozo">Mozo</option>
            <option value="Cocinero">Cocinero</option>
          </select>
          {errores.rol && (
            <p className="text-xs text-danger mt-1 font-medium">{errores.rol}</p>
          )}
        </div>
      </div>

      {/* Correo electrónico */}
      <div>
        <label className="form-label-standard">
          Correo electrónico{' '}
          {rol === 'Administrador' ? (
            <span className="text-rose-500">* (obligatorio para Administrador)</span>
          ) : (
            <span className="text-neutral-500 font-normal">(opcional)</span>
          )}
        </label>
        <input
          ref={correoInputRef}
          type="email"
          value={correo}
          maxLength={100}
          onChange={(e) => onCorreoChange(e.target.value)}
          onBlur={() => onCorreoChange(correo.trim().toLowerCase())}
          placeholder="ana.torres@girasoles.com"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
            errores.correo
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
              : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
          }`}
        />
        {errores.correo && (
          <p className="text-xs text-danger mt-1 font-medium">{errores.correo}</p>
        )}
      </div>
    </>
  );
};
