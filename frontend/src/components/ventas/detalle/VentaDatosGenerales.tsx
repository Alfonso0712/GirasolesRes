import React from 'react';
import type { VentaDetalle } from '../../../types/venta';

export interface VentaDatosGeneralesProps {
  venta: VentaDetalle;
}

export const VentaDatosGenerales: React.FC<VentaDatosGeneralesProps> = ({ venta }) => {
  return (
    <>
      {/* Tarjeta de Datos Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/70 text-xs">
        <div>
          <span className="text-xs font-semibold uppercase text-neutral-500 block">Fecha y Hora</span>
          <span className="font-semibold text-neutral-800 tabular-nums">{venta.fechaHoraFormateada}</span>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-neutral-500 block">Pedido N.º</span>
          <span className="font-semibold text-neutral-800 tabular-nums">#{venta.pedidoNumero}</span>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-neutral-500 block">Destino</span>
          <span className="font-semibold text-neutral-800">
            {venta.tipo} {venta.mesa ? `· ${venta.mesa}` : ''}
          </span>
          {venta.referencia && (
            <span className="text-xs text-neutral-500 block truncate" title={venta.referencia}>
              Ref: {venta.referencia}
            </span>
          )}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-neutral-500 block">Cajero(a)</span>
          <span className="font-semibold text-neutral-800">{venta.cajero}</span>
        </div>
      </div>

      {/* Receptor Fiscal (SUNAT / RENIEC) */}
      {(venta.numDocReceptor || venta.razonSocialReceptor) && (
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Datos del Receptor Fiscal ({venta.tipoDocReceptor || (venta.numDocReceptor?.length === 11 ? 'RUC' : 'DNI')})
            </span>
            <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
              {venta.comprobante.startsWith('F') ? 'Factura' : venta.comprobante.startsWith('B') ? 'Boleta' : 'Comprobante'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-neutral-800">
            <div>
              <span className="text-neutral-500 font-medium">N.º Documento: </span>
              <span className="tabular-nums font-bold text-neutral-900">{venta.numDocReceptor}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Nombre / Razón Social: </span>
              <span className="font-semibold text-neutral-900">{venta.razonSocialReceptor || 'No especificado'}</span>
            </div>
          </div>
          {venta.direccionReceptor && (
            <div className="pt-1 text-xs text-neutral-700">
              <span className="text-neutral-500 font-medium">Dirección Fiscal: </span>
              <span>{venta.direccionReceptor}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
