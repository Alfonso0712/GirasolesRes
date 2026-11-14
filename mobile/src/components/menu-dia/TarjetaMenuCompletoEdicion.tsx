import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CandidatoMenuDto } from '../../types/menuDia';
import {
  MSG_219,
  type MenuCompletoCatalogoItem,
} from '../../utils/menuDia';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { formatCurrency } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';

export interface TarjetaMenuCompletoEdicionProps {
  menu: MenuCompletoCatalogoItem;
  habilitado: boolean;
  opcionesSeleccionadasSet: ReadonlySet<string>;
  candidatos: readonly CandidatoMenuDto[];
  onToggle: (menuId: number) => void;
}

export const TarjetaMenuCompletoEdicion: React.FC<TarjetaMenuCompletoEdicionProps> = ({
  menu,
  habilitado,
  opcionesSeleccionadasSet,
  candidatos,
  onToggle,
}) => {
  const { triggerLight } = useHaptics();

  const partesDetalle = menu.partes.map((parte) => {
    const opcionesDeParte = candidatos.filter(
      (c) =>
        c.tipo === 'Componente' &&
        c.rol != null &&
        parte.rolesPermitidos.includes(c.rol) &&
        opcionesSeleccionadasSet.has(c.id)
    );
    return {
      ...parte,
      opcionesNombres: opcionesDeParte.map((o) => o.nombre),
    };
  });

  const primeraParteSinOpciones = partesDetalle.find(
    (p) => p.opcionesNombres.length === 0
  );
  const avisoMsg219 =
    habilitado && primeraParteSinOpciones
      ? MSG_219(menu.nombre, primeraParteSinOpciones.nombre)
      : null;

  return (
    <Card
      accent={habilitado ? (avisoMsg219 ? 'warning' : 'success') : 'none'}
      padding="md"
      className={habilitado ? '' : 'opacity-85'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-ink leading-snug break-words">
              {menu.nombre}
            </h3>
            <span className="text-base font-black text-accent tabular-nums">
              {formatCurrency(menu.precio)}
            </span>
          </div>
          <p className="text-xs font-semibold text-ink-muted mt-1">
            {menu.resumenPartes}
          </p>
        </div>

        <Switch
          checked={habilitado}
          onChange={() => {
            triggerLight();
            onToggle(menu.id);
          }}
          aria-label={`Habilitar ${menu.nombre}`}
        />
      </div>

      {/* Detalle de partes obligatorias */}
      <div className="mt-3 pt-3 border-t border-line space-y-2">
        {partesDetalle.map((parte) => (
          <div key={parte.id} className="text-xs">
            <span className="font-bold text-ink block">
              Parte: {parte.nombre}
            </span>
            {parte.opcionesNombres.length === 0 ? (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-warning-bg text-badge-warning-text border border-warning-border font-semibold">
                Falta elegir opciones
              </span>
            ) : (
              <span className="text-ink-muted block mt-0.5 break-words">
                {parte.opcionesNombres.length} opción(es):{' '}
                {parte.opcionesNombres.join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {avisoMsg219 && (
        <div
          role="alert"
          className="mt-3 p-3 rounded-xl bg-warning-bg border border-warning-border text-badge-warning-text text-xs font-semibold flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="break-words">{avisoMsg219}</span>
        </div>
      )}
    </Card>
  );
};
