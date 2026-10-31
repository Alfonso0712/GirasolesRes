import React from 'react';
import type { BloqueCajaAdmin, BloqueMenuAdmin, BloqueUltimoCierre } from '../../../types/inicio';

export interface AdminOperacionesColProps {
  cajaRes: any;
  caja: BloqueCajaAdmin | null;
  menuRes: any;
  menu: BloqueMenuAdmin | null;
  ultimoCierreRes: any;
  ultimoCierre: BloqueUltimoCierre | null;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const AdminOperacionesCol: React.FC<AdminOperacionesColProps> = ({
  cajaRes,
  caja,
  menuRes,
  menu,
  ultimoCierreRes,
  ultimoCierre,
  onNavigate,
  renderBloqueError
}) => {
  return (
    <div className="space-y-4 flex flex-col justify-between">
      {/* Tarjeta Caja */}
      {cajaRes?.estado === 'error' ? (
        renderBloqueError('caja')
      ) : (
        <div
          onClick={() => onNavigate('historial-cierres')}
          className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Estado de Caja
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              caja?.estado === 'Abierta'
                ? 'bg-emerald-100 text-emerald-800'
                : caja?.estado === 'Anterior sin cerrar'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-neutral-100 text-neutral-700'
            }`}>
              {caja?.estado ?? 'Desconocido'}
            </span>
          </div>
          {caja?.estado === 'Abierta' ? (
            <div className="text-xs text-neutral-600">
              <p>Abierta por: <strong className="text-neutral-800">{caja.usuario ?? 'Cajero'}</strong> ({caja.desde})</p>
              <p className="mt-0.5">Efectivo esperado: <strong className="text-emerald-700 tabular-nums">S/ {(caja.efectivoEsperado ?? 0).toFixed(2)}</strong></p>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              {caja?.estado === 'Anterior sin cerrar'
                ? 'Caja pendiente de arqueo del día anterior.'
                : 'Aún no se ha registrado apertura de caja hoy.'}
            </p>
          )}
        </div>
      )}

      {/* Tarjeta Menú del Día */}
      {menuRes?.estado === 'error' ? (
        renderBloqueError('menu')
      ) : (
        <div
          onClick={() => onNavigate('menu-dia')}
          className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Menú de Hoy
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              menu?.definido ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {menu?.definido ? 'Definido' : 'Sin definir'}
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            {menu?.definido
              ? `${menu.platos} platos disponibles · ${menu.agotados} agotados`
              : 'El menú no ha sido publicado aún para el servicio de hoy.'}
          </p>
        </div>
      )}

      {/* Tarjeta Último Cierre */}
      {ultimoCierreRes?.estado === 'error' ? (
        renderBloqueError('ultimoCierre')
      ) : (
        <div
          onClick={() => onNavigate('historial-cierres')}
          className="p-4 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Último Cierre de Caja
            </span>
            {ultimoCierre?.resultado && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                ultimoCierre.resultado === 'Cuadra'
                  ? 'bg-emerald-100 text-emerald-800'
                  : ultimoCierre.resultado === 'Sobrante'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {ultimoCierre.resultado}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-600">
            {ultimoCierre?.fecha ? (
              <>
                Fecha: <strong className="text-neutral-800">{ultimoCierre.fecha}</strong>
                {ultimoCierre.diferencia !== undefined && ultimoCierre.diferencia !== 0 && (
                  <span className="block mt-0.5 text-neutral-700">
                    Diferencia: <strong className="tabular-nums">S/ {(ultimoCierre.diferencia ?? 0).toFixed(2)}</strong>
                  </span>
                )}
              </>
            ) : (
              'No hay cierres anteriores registrados.'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
