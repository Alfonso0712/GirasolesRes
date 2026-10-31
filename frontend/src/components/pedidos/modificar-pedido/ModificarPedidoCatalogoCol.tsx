import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ProductoMenuPedido } from '../../../types/pedido';

export interface ModificarPedidoCatalogoColProps {
  catalogoProductos: ProductoMenuPedido[];
  onAgregarProducto: (prod: ProductoMenuPedido) => void;
}

export const ModificarPedidoCatalogoCol: React.FC<ModificarPedidoCatalogoColProps> = ({
  catalogoProductos,
  onAgregarProducto,
}) => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const categorias = Array.from(new Set(catalogoProductos.map((p) => p.categoria)));
  const productosFiltrados = catalogoProductos.filter((p) => {
    const matchCat = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;
    const matchBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusqueda;
  });

  return (
    <div className="flex flex-col border border-neutral-200 rounded-2xl p-4 bg-surface min-h-0 overflow-hidden">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
        Agregar Productos Disponibles
      </span>

      {/* Filtros de catálogo */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar plato o bebida…"
          className="flex-1 text-xs p-2 rounded-xl border border-neutral-300 focus:border-accent focus:outline-none"
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="text-xs p-2 rounded-xl border border-neutral-300 focus:border-accent focus:outline-none cursor-pointer"
        >
          <option value="todos">Todas</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Lista scrolleable de catálogo */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {productosFiltrados.map((prod) => (
          <div
            key={prod.id}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              prod.agotado
                ? 'border-neutral-200 bg-neutral-100/70 text-neutral-500'
                : 'border-neutral-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div>
              <div className="font-semibold text-neutral-900">{prod.nombre}</div>
              <div className="text-neutral-500 tabular-nums">
                S/ {prod.precio.toFixed(2)} · {prod.categoria}
              </div>
            </div>

            {prod.agotado ? (
              <span className="text-xs font-bold text-danger bg-rose-50 px-2 py-0.5 rounded-md">
                Agotado
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAgregarProducto(prod)}
                className="py-1 px-3 rounded-lg bg-amber-500/10 text-accent hover:bg-primary hover:text-white font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
