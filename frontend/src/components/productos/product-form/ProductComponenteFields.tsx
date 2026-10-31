import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  type RolComponente,
  ROLES_COMPONENTE,
} from '../../../types/producto';

export interface ProductComponenteFieldsProps {
  rol: RolComponente;
  onRolChange: (rol: RolComponente) => void;
  rolSelectRef: React.RefObject<HTMLSelectElement | null>;
  errores: Record<string, string>;
  guardando: boolean;
}

export const ProductComponenteFields: React.FC<ProductComponenteFieldsProps> = ({
  rol,
  onRolChange,
  rolSelectRef,
  errores,
  guardando,
}) => {
  return (
    <>
      {/* Campo Rol del Componente */}
      <div>
        <label
          htmlFor="prod-rol"
          className="form-label-standard"
        >
          Rol del componente <span className="text-accent">*</span>
        </label>
        <select
          id="prod-rol"
          ref={rolSelectRef}
          value={rol}
          onChange={(e) => onRolChange(e.target.value as RolComponente)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden bg-surface ${
            errores.rol
              ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              : 'border-neutral-200 text-neutral-900 focus:border-accent focus:ring-2 focus:ring-amber-200'
          }`}
          disabled={guardando}
        >
          {ROLES_COMPONENTE.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.etiqueta}
            </option>
          ))}
        </select>
        {ROLES_COMPONENTE.find((r) => r.valor === rol)?.descripcion && !errores.rol && (
          <p className="mt-1 text-xs text-ink-muted">
            {ROLES_COMPONENTE.find((r) => r.valor === rol)?.descripcion}
          </p>
        )}
        {errores.rol && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errores.rol}
          </p>
        )}
      </div>

      {/* Aviso informativo: Sin precio individual */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-950">Componente incluido dentro del menú completo (sin precio individual).</p>
          <p className="mt-0.5 text-emerald-800 leading-relaxed">
            Los componentes no llevan precio: se integran en los menús completos (Desayuno completo, Almuerzo completo o Solo segundo) definidos por la administración.
          </p>
        </div>
      </div>
    </>
  );
};
