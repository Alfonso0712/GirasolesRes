import React, { useState, useEffect } from 'react';
import { CalendarCheck, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import type { ProductoItem } from '../../types/pedido';

export const MenuDiaView: React.FC = () => {
  const [platos, setPlatos] = useState<ProductoItem[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarPlatos = async () => {
    setCargando(true);
    try {
      const data = await pedidoService.obtenerCatalogo();
      setPlatos(data.filter((p) => p.esMenuDelDia || p.categoria === 'Menú del Día'));
    } catch {
      setPlatos([
        { id: '1', nombre: 'Menú Ejecutivo: Lomo Saltado + Sopa', precio: 16.00, categoria: 'Menú del Día', disponible: true, esMenuDelDia: true },
        { id: '2', nombre: 'Menú Económico: Seco de Pollo + Entrada', precio: 14.00, categoria: 'Menú del Día', disponible: true, esMenuDelDia: true },
      ]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlatos();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Menú del Día</h2>
            <p className="text-xs text-ink-muted">Platos y opciones preparadas para hoy</p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPlatos}
          disabled={cargando}
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {platos.map((p) => (
          <div
            key={p.id}
            className="bg-surface border border-line rounded-2xl p-4 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chip-accent-bg text-primary flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{p.nombre}</h3>
                <span className="text-xs font-black text-primary">S/ {p.precio.toFixed(2)}</span>
              </div>
            </div>

            <span className="text-xs font-bold text-success bg-success-bg border border-success-border px-2.5 py-0.5 rounded-full">
              Disponible
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
