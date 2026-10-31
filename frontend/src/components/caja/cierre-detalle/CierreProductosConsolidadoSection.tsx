import React from 'react';
import { Utensils } from 'lucide-react';
import type { CierreDetalleDto } from '../../../types/caja';

export interface CierreProductosConsolidadoSectionProps {
  detalle: CierreDetalleDto;
}

export const CierreProductosConsolidadoSection: React.FC<CierreProductosConsolidadoSectionProps> = ({
  detalle,
}) => {
  return (
    <div className="space-y-4">
      {/* 4A. Productos de Carta */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface break-inside-avoid shadow-xs">
        <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-accent" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              1. Productos de Carta
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-semibold">
            {detalle.platosVendidos?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0} unidades
          </span>
        </div>

        {detalle.platosVendidos && detalle.platosVendidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-canvas border-b border-line text-xs uppercase font-semibold text-ink-muted tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Plato / Producto</th>
                  <th className="px-4 py-2.5 text-center w-24">Cantidad</th>
                  <th className="px-4 py-2.5 text-right w-28 tabular-nums whitespace-nowrap">Subtotal (S/)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-sm">
                {detalle.platosVendidos.map((p, idx) => (
                  <tr key={p.productoId || `${p.nombre}-${idx}`} className="hover:bg-neutral-50/40 transition-colors border-b border-line-soft">
                    <td className="px-4 py-2.5 font-semibold text-sm text-ink">{p.nombre}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-sm text-neutral-700 tabular-nums">
                      {p.cantidad}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-sm text-ink tabular-nums">
                      S/ {(p.total ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-canvas border-t border-line font-semibold text-xs">
                <tr>
                  <td className="px-4 py-2.5 text-ink">Subtotal Carta</td>
                  <td className="px-4 py-2.5 text-center text-neutral-800 tabular-nums font-semibold">
                    {detalle.platosVendidos.reduce((acc, p) => acc + p.cantidad, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-accent tabular-nums font-bold text-sm">
                    S/ {detalle.platosVendidos.reduce((acc, p) => acc + (p.total ?? 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-neutral-500 italic">
            Sin productos de carta vendidos en este turno.
          </div>
        )}
      </div>

      {/* 4B. Menús Completos */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface break-inside-avoid shadow-xs">
        <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              2. Menús Completos
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-semibold">
            {detalle.menusCompletos?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0} unidades
          </span>
        </div>

        {detalle.menusCompletos && detalle.menusCompletos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-canvas border-b border-line text-xs uppercase font-semibold text-ink-muted tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Menú Completo</th>
                  <th className="px-4 py-2.5 text-center w-24">Cantidad</th>
                  <th className="px-4 py-2.5 text-right w-28 tabular-nums whitespace-nowrap">Subtotal (S/)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-sm">
                {detalle.menusCompletos.map((m, idx) => (
                  <tr key={`${m.menuCompletoId}-${idx}`} className="hover:bg-neutral-50/40 transition-colors border-b border-line-soft">
                    <td className="px-4 py-2.5 font-semibold text-sm text-ink">{m.nombre}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-sm text-neutral-700 tabular-nums">
                      {m.cantidad}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-sm text-ink tabular-nums">
                      S/ {(m.monto ?? m.total ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-canvas border-t border-line font-semibold text-xs">
                <tr>
                  <td className="px-4 py-2.5 text-ink">Subtotal Menús</td>
                  <td className="px-4 py-2.5 text-center text-neutral-800 tabular-nums font-semibold">
                    {detalle.menusCompletos.reduce((acc, m) => acc + m.cantidad, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-accent tabular-nums font-bold text-sm">
                    S/ {detalle.menusCompletos.reduce((acc, m) => acc + (m.monto ?? m.total ?? 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-neutral-500 italic">
            Sin menús completos vendidos en este turno.
          </div>
        )}
      </div>

      {/* 4C. Componentes de Menú */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface break-inside-avoid shadow-xs">
        <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              3. Componentes Elegidos en Menús
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-semibold">
            {detalle.componentes?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0} elecciones
          </span>
        </div>

        {detalle.componentes && detalle.componentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-canvas border-b border-line text-xs uppercase font-semibold text-ink-muted tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Componente / Insumo</th>
                  <th className="px-4 py-2.5 text-center w-28">Rol / Parte</th>
                  <th className="px-4 py-2.5 text-center w-24">Veces Elegida</th>
                  <th className="px-4 py-2.5 text-right w-28 tabular-nums whitespace-nowrap">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-sm">
                {detalle.componentes.map((c, idx) => (
                  <tr key={`${c.productoId}-${idx}`} className="hover:bg-neutral-50/40 transition-colors border-b border-line-soft">
                    <td className="px-4 py-2.5 font-semibold text-sm text-ink">{c.producto}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-xs text-neutral-600">
                      {c.rol}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-sm text-neutral-700 tabular-nums">
                      {c.cantidad}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-xs text-neutral-400 italic">
                      S/ 0.00 (Incluido)
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-canvas border-t border-line font-semibold text-xs">
                <tr>
                  <td className="px-4 py-2.5 text-ink" colSpan={2}>Total Elecciones Componentes</td>
                  <td className="px-4 py-2.5 text-center text-neutral-800 tabular-nums font-semibold">
                    {detalle.componentes.reduce((acc, c) => acc + c.cantidad, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-neutral-500 tabular-nums font-medium text-xs">
                    S/ 0.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-neutral-500 italic">
            Sin componentes de menú elegidos en este turno.
          </div>
        )}
      </div>
    </div>
  );
};

export default CierreProductosConsolidadoSection;
