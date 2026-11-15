import React from 'react';
import { Send } from 'lucide-react';
import type { LineaBorrador } from '../../types/pedido';
import { Button } from '../ui/Button';
import { formatCurrency, pluralizar } from '../../utils/format';
import { FilaLineaComanda } from './FilaLineaComanda';

export interface ContenidoComandaConfig {
  variante: 'mesa' | 'llevar';
  lineas: LineaBorrador[];
  total: number;
  totalItems: number;
  errorEnvio: string | null;
  enviando: boolean;
  sinConexion: boolean;
}

export interface ContenidoComandaExtra {
  esMozo?: boolean;
  esAmpliacion?: boolean;
  referencia?: string;
}

export interface ContenidoComandaAcciones {
  onModificarCantidad: (lineaId: string, delta: number) => void;
  onEditarNota: (linea: LineaBorrador) => void;
  onEnviar: () => void;
}

export interface ContenidoComandaProps {
  config: ContenidoComandaConfig;
  extra: ContenidoComandaExtra;
  acciones: ContenidoComandaAcciones;
}

const BloqueResumenLlevar: React.FC<{ referencia: string }> = ({ referencia }) => (
  <div className="p-3 bg-canvas border border-line rounded-xl text-xs space-y-1">
    <div className="flex justify-between items-center gap-2">
      <span className="text-ink-muted shrink-0">Cliente / Referencia:</span>
      <span className="font-bold text-ink text-right min-w-0">{referencia.trim() || 'No indicada'}</span>
    </div>
    {referencia.trim().length < 2 && (
      <p className="text-danger text-xs font-medium">
        Debe indicar una referencia de cliente entre 2 y 30 caracteres.
      </p>
    )}
  </div>
);

const BloqueTotalComanda: React.FC<{ esMozo: boolean; total: number; totalItems: number }> = ({
  esMozo,
  total,
  totalItems,
}) =>
  !esMozo ? (
    <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
      <span className="text-sm font-bold text-ink-muted">Total a Pagar</span>
      <span className="text-xl font-black text-accent tabular-nums">{formatCurrency(total)}</span>
    </div>
  ) : (
    <div className="p-3 rounded-xl bg-canvas border border-line flex justify-between items-center">
      <span className="text-xs font-bold text-ink-muted">Cantidad total de ítems</span>
      <span className="text-sm font-black text-ink">{pluralizar(totalItems, 'producto', 'productos')}</span>
    </div>
  );

function esBotonDeshabilitado(config: ContenidoComandaConfig, referencia?: string): boolean {
  if (config.variante === 'mesa') {
    return config.enviando || config.sinConexion;
  }
  const refTrim = (referencia || '').trim();
  return refTrim.length < 2 || refTrim.length > 30 || config.sinConexion;
}

function textoBotonEnviar(esMesa: boolean, sinConexion: boolean, esAmpliacion: boolean): string {
  if (esMesa) {
    if (sinConexion) return 'Sin conexión para enviar';
    return esAmpliacion ? 'Enviar Ampliación a Cocina' : 'Enviar Pedido a Cocina';
  }
  return sinConexion ? 'Sin conexión para registrar' : 'Confirmar Pedido para Llevar';
}

/**
 * Contenido reutilizable del resumen de orden para el panel lateral y la hoja móvil.
 */
export const ContenidoComanda: React.FC<ContenidoComandaProps> = ({ config, extra, acciones }) => {
  const esMesa = config.variante === 'mesa';
  const deshabilitado = esBotonDeshabilitado(config, extra.referencia);
  const claseLista = esMesa ? 'divide-y divide-line' : 'divide-y divide-line max-h-[300px] md:max-h-none overflow-y-auto pr-1';

  return (
    <div className="space-y-4">
      {config.errorEnvio && (
        <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold">{config.errorEnvio}</div>
      )}
      {!esMesa && <BloqueResumenLlevar referencia={extra.referencia || ''} />}
      <div className={claseLista}>
        {config.lineas.map((linea) => (
          <FilaLineaComanda key={linea.id} linea={linea} variante={config.variante} esMozo={extra.esMozo} onModificarCantidad={acciones.onModificarCantidad} onEditarNota={acciones.onEditarNota} />
        ))}
      </div>
      <BloqueTotalComanda esMozo={Boolean(extra.esMozo)} total={config.total} totalItems={config.totalItems} />
      <Button fullWidth size="lg" isLoading={config.enviando} disabled={deshabilitado} title={config.sinConexion ? 'Sin conexión a internet' : undefined} onClick={acciones.onEnviar} className="flex items-center justify-center gap-2">
        <Send className="w-5 h-5" />
        <span>{textoBotonEnviar(esMesa, config.sinConexion, Boolean(extra.esAmpliacion))}</span>
      </Button>
    </div>
  );
};
