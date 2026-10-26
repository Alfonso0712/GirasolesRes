import React from 'react';
import { Search, Utensils, UtensilsCrossed, Plus } from 'lucide-react';
import { Button } from '../ui';
import { MenuItemSelectableCard } from './MenuItemSelectableCard';
import type { MesaItem } from '../../types/mesa';
import type { MenuCompletoDia } from '../../types/menuDia';
import type { ProductoMenuPedido, LineaBorrador } from '../../types/pedido';

interface PedidoCatalogoPanelProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  modo: 'nuevo' | 'ampliacion';
  mesaSeleccionada: MesaItem | null;
  opcionesMesas: MesaItem[];
  onMesaSeleccionadaChange: (mesa: MesaItem | null) => void;
  cargando: boolean;
  menuDefinido: boolean;
  esAdmin?: boolean;
  onNavigateToMenuDia?: () => void;
  categorias: string[];
  categoriaActiva: string;
  onCategoriaActivaChange: (cat: string) => void;
  menusCompletos: MenuCompletoDia[];
  onArmarMenuCompleto: (menu: MenuCompletoDia) => void;
  catalogoFiltrado: ProductoMenuPedido[];
  productosPorCategoria: Record<string, ProductoMenuPedido[]>;
  lineasBorrador: LineaBorrador[];
  onAgregarProducto: (prod: ProductoMenuPedido) => void;
  onDisminuirProducto: (prodId: string) => void;
}

export const PedidoCatalogoPanel: React.FC<PedidoCatalogoPanelProps> = ({
  busqueda,
  onBusquedaChange,
  modo,
  mesaSeleccionada,
  opcionesMesas,
  onMesaSeleccionadaChange,
  cargando,
  menuDefinido,
  esAdmin = false,
  onNavigateToMenuDia,
  categorias,
  categoriaActiva,
  onCategoriaActivaChange,
  menusCompletos,
  onArmarMenuCompleto,
  catalogoFiltrado,
  productosPorCategoria,
  lineasBorrador,
  onAgregarProducto,
  onDisminuirProducto
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
      {/* Barra de Filtros y Búsqueda */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar plato o bebida..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 text-sm"
            >
              ×
            </button>
          )}
        </div>

        {/* Selector de Mesa Libre */}
        {modo === 'nuevo' ? (
          <div className="w-full sm:w-60 shrink-0">
            <select
              value={mesaSeleccionada?.id || ''}
              onChange={(e) => {
                const m = opcionesMesas.find((item) => String(item.id).toLowerCase() === e.target.value.toLowerCase());
                onMesaSeleccionadaChange(m || null);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-surface text-ink font-medium focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer shadow-2xs"
            >
              <option value="">-- Seleccione Mesa Libre --</option>
              {opcionesMesas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} (Libre)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="w-full sm:w-60 shrink-0 flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span className="truncate">Mesa: {mesaSeleccionada?.nombre || 'Mesa'}</span>
          </div>
        )}
      </div>

      {/* Pastillas de Categorías */}
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scroll-thin">
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoriaActivaChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
              categoriaActiva === cat
                ? 'bg-sidebar text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-ink-muted hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla con Scroll Interno Confinado */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 scroll-thin">
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 animate-pulse h-28 flex flex-col justify-between"
              >
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                <div className="h-8 bg-neutral-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : !menuDefinido ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto border border-amber-200 mb-4 shadow-2xs">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-sans font-bold text-ink mb-2">
              El menú del día aún no está definido
            </h3>
            {esAdmin ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Para habilitar la toma de pedidos en las mesas del salón, primero debe configurar y publicar el menú del día de hoy.
                </p>
                {onNavigateToMenuDia && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={onNavigateToMenuDia}
                    className="mx-auto !w-auto px-6 py-2.5 text-xs font-bold shadow-md cursor-pointer"
                  >
                    Ir a definir Menú del Día
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm text-center">
                <p className="font-semibold text-amber-950">
                  Solicite a la administradora que publique el menú de hoy para comenzar a tomar pedidos
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  No es posible abrir comandas hasta que el menú diario esté activo.
                </p>
              </div>
            )}
          </div>
        ) : catalogoFiltrado.length === 0 && (categoriaActiva !== 'Menús Completos' && menusCompletos.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
            <Utensils className="w-12 h-12 stroke-[1.5] mb-3 text-neutral-300" />
            <p className="text-sm font-semibold text-neutral-600">
              No hay productos disponibles en esta sección
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              {busqueda
                ? 'No se encontraron platos que coincidan con la búsqueda.'
                : 'Avise a la administración para habilitar productos en la carta o menú del día.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bloque de Menús Completos de Hoy */}
            {menusCompletos.length > 0 &&
              (categoriaActiva === 'Todas' || categoriaActiva === 'Menús Completos') &&
              (!busqueda || menusCompletos.some((m) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))) && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-accent mb-2.5 flex items-center gap-2 font-sans">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Menús Completos de Hoy</span>
                  <div className="h-px bg-amber-200 flex-1" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {menusCompletos
                    .filter((m) => !busqueda || m.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                    .map((menu) => (
                      <div
                        key={menu.id}
                        className="bg-canvas border border-amber-300/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-accent transition-all shadow-2xs hover:shadow-sm"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-xs sm:text-sm text-ink line-clamp-1">
                              {menu.nombre}
                            </h4>
                            <span className="font-bold text-xs sm:text-sm text-accent tabular-nums whitespace-nowrap">
                              S/ {menu.precio.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-ink-muted mt-1 line-clamp-2">
                            Incluye: {menu.incluye}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => onArmarMenuCompleto(menu)}
                          className="w-full mt-3 py-1.5 text-xs font-bold bg-accent hover:bg-orange-600 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Armar menú</span>
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Bloque de Platos de la Carta y Menú del Día */}
            {Object.entries(productosPorCategoria).map(([cat, prods]) => (
              <div key={cat}>
                <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-500 mb-2.5 flex items-center gap-2 font-sans">
                  <span>{cat}</span>
                  <div className="h-px bg-neutral-200 flex-1" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {prods.map((prod) => {
                    const cantEnBorrador = lineasBorrador
                      .filter((l) => l.productoId === prod.id)
                      .reduce((acc, cur) => acc + cur.cantidad, 0);
                    const esAgotado = Boolean(prod.agotado);

                    return (
                      <MenuItemSelectableCard
                        key={prod.id}
                        id={prod.id}
                        nombre={prod.nombre}
                        categoria={prod.categoria}
                        precio={prod.precio}
                        cantEnBorrador={cantEnBorrador}
                        esAgotado={esAgotado}
                        onAgregar={() => onAgregarProducto(prod)}
                        onDisminuir={() => onDisminuirProducto(prod.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
