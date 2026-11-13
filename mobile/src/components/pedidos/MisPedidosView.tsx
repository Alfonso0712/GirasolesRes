import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Utensils } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import type { PedidoItemDto } from '../../types/pedido';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../utils/format';

export const MisPedidosView: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoItemDto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await pedidoService.listarPedidos({ soloMios: true });
      setPedidos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar sus pedidos registrados';
      setError(msg);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Pedidos Registrados</h2>
            <p className="text-xs text-ink-muted">Consumo en curso en salón</p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPedidos}
          disabled={cargando}
          aria-label="Actualizar pedidos"
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-accent' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarPedidos}
            className="my-4"
          />
        )}

        {!error && !cargando && pedidos.length === 0 && (
          <EmptyState
            icon={Utensils}
            titulo="Sin pedidos registrados"
            subtitulo="No tiene pedidos registrados en este turno."
          />
        )}

        {pedidos.map((p) => {
          const mesaOReferencia = p.mesa || p.referencia || `Pedido #${p.numero}`;
          return (
            <div
              key={p.id}
              className="bg-surface border border-line rounded-2xl p-4 shadow-xs flex items-center justify-between select-none"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink">{mesaOReferencia}</h3>
                  <span className="text-xs text-accent font-bold bg-chip-accent-bg px-2 py-0.5 rounded-full border border-chip-accent-border">
                    #{p.numero}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hora: {p.hora || 'En curso'} · Atendido por: {p.registradoPor}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-accent block tabular-nums">
                  {formatCurrency(p.total)}
                </span>
                <span className="text-xs uppercase font-semibold text-warning">
                  {p.estado}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
