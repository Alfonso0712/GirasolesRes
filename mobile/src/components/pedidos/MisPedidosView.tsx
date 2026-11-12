import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle, Utensils } from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro } from '../../types/cobro';

export const MisPedidosView: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoPendienteCobro[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const data = await cobroService.obtenerPedidosPendientes();
      setPedidos(data);
    } catch {
      setPedidos([
        { pedidoId: 'p1', mesaId: '2', mesaNombre: 'Mesa 2', mozoNombre: 'Mozo', total: 78.50, fechaCreacion: new Date().toISOString(), cantidadLineas: 3 },
        { pedidoId: 'p2', mesaId: '4', mesaNombre: 'Mesa 4', mozoNombre: 'Mozo', total: 142.00, fechaCreacion: new Date().toISOString(), cantidadLineas: 5 },
      ]);
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
            <h2 className="text-base font-extrabold text-ink leading-tight">Pedidos Activos</h2>
            <p className="text-xs text-ink-muted">Mesas con consumo en curso</p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPedidos}
          disabled={cargando}
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pedidos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-muted">
            <AlertCircle className="w-12 h-12 text-ink-muted mb-2" />
            <p className="text-base font-bold text-ink">Sin pedidos pendientes</p>
            <p className="text-xs">No hay mesas con pedidos abiertos en este momento.</p>
          </div>
        ) : (
          pedidos.map((p) => (
            <div
              key={p.pedidoId}
              className="bg-surface border border-line rounded-2xl p-4 shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink">{p.mesaNombre}</h3>
                  <span className="text-[11px] text-primary font-bold bg-chip-accent-bg px-2 py-0.5 rounded-full border border-chip-accent-border">
                    {p.cantidadLineas} platos
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>En atención · Mozo: {p.mozoNombre}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-primary block">
                  S/ {p.total.toFixed(2)}
                </span>
                <span className="text-[10px] uppercase font-bold text-warning">
                  Pendiente Cobro
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
