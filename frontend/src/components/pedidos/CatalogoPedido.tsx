import React, { useMemo } from 'react';
import { Search, Utensils, UtensilsCrossed } from 'lucide-react';
import { Button } from '../ui';
import { CategoriaChips } from './CategoriaChips';
import { MenuCompletoCard } from './MenuCompletoCard';
import { ProductoCard } from './ProductoCard';
import { formatCategoriaLabel } from '../../utils/formatCategory';
import { ROLES_COMPONENTE } from '../../types/producto';
import type { MenuCompletoDia } from '../../types/menuDia';
import type { ProductoMenuPedido, LineaBorrador } from '../../types/pedido';

const CATALOGO_GRID_CLASS =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3';

const ROLES_COMPONENTE_SET = new Set<string>(
  ROLES_COMPONENTE.map((r) => r.valor.toLowerCase())
);

/**
 * Filtra únicamente categorías y productos de carta, excluyendo los componentes
 * de menú (BebidaDesayuno, PlatoDesayuno, Sopa, Entrada, Segundo).
 */
export function esCategoriaDeCarta(categoria?: string | null, rol?: string | null): boolean {
  if (rol && rol.trim() !== '') return false;
  if (!categoria) return false;
  return !ROLES_COMPONENTE_SET.has(categoria.trim().toLowerCase());
}

export interface CatalogoPedidoProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  campoContextual: React.ReactNode;
  cargando: boolean;
  menuDefinido: boolean;
  esAdmin?: boolean;
  textoMenuNoDefinidoAdmin?: string;
  textoMenuNoDefinidoOperador?: string;
  onNavigateToMenuDia?: () => void;
  categorias: string[];
  categoriaActiva: string;
  onCategoriaActivaChange: (cat: string) => void;
  menusCompletos: MenuCompletoDia[];
  onArmarMenuCompleto: (menu: MenuCompletoDia) => void;
  catalogoFiltrado: ProductoMenuPedido[];
  lineasBorrador: LineaBorrador[];
  onAgregarProducto: (prod: ProductoMenuPedido) => void;
  onDisminuirProducto: (prodId: string) => void;
}

export const CatalogoPedido: React.FC<CatalogoPedidoProps> = ({
  busqueda,
  onBusquedaChange,
  campoContextual,
  cargando,
  menuDefinido,
  esAdmin = false,
  textoMenuNoDefinidoAdmin = 'Para habilitar la toma de pedidos, primero debe configurar y publicar el menú del día de hoy.',
  textoMenuNoDefinidoOperador = 'No es posible registrar comandas hasta que el menú diario esté activo.',
  onNavigateToMenuDia,
  categorias,
  categoriaActiva,
  onCategoriaActivaChange,
  menusCompletos,
  onArmarMenuCompleto,
  catalogoFiltrado,
  lineasBorrador,
  onAgregarProducto,
  onDisminuirProducto,
}) => {
  const categoriasCarta = useMemo(
    () => categorias.filter((cat) => esCategoriaDeCarta(cat)),
    [categorias]
  );

  const menusFiltrados = useMemo(() => {
    if (categoriaActiva !== 'Todas' && categoriaActiva !== 'Menús Completos') {
      return [];
    }
    const q = busqueda.trim().toLowerCase();
    if (!q) return menusCompletos;
    return menusCompletos.filter((m) => m.nombre.toLowerCase().includes(q));
  }, [menusCompletos, categoriaActiva, busqueda]);

  const productosPorCategoria = useMemo(() => {
    if (categoriaActiva === 'Menús Completos') {
      return {} as Record<string, ProductoMenuPedido[]>;
    }
    const agrupados: Record<string, ProductoMenuPedido[]> = {};
    catalogoFiltrado
      .filter((prod) => esCategoriaDeCarta(prod.categoria, prod.rol))
      .forEach((prod) => {
        if (!agrupados[prod.categoria]) {
          agrupados[prod.categoria] = [];
        }
        agrupados[prod.categoria].push(prod);
      });
    return agrupados;
  }, [catalogoFiltrado, categoriaActiva]);

  const sinResultados =
    menusFiltrados.length === 0 && Object.keys(productosPorCategoria).length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
      {/* Barra de Búsqueda + Campo Contextual */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar plato o bebida..."
            aria-label="Buscar plato o bebida"
            className="w-full min-h-[42px] pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-surface text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 text-sm cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        <div className="w-full sm:w-48 xl:w-64 shrink-0">{campoContextual}</div>
      </div>

      {/* Chips de Categorías */}
      <CategoriaChips
        categorias={categoriasCarta}
        categoriaActiva={categoriaActiva}
        onSelectCategoria={onCategoriaActivaChange}
      />

      {/* Grilla con Scroll Interno Confinado */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto min-h-0 pr-1 pt-1 scroll-thin">
        {cargando ? (
          <div className={CATALOGO_GRID_CLASS}>
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
                  {textoMenuNoDefinidoAdmin}
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
                <p className="text-xs text-amber-800 mt-1">{textoMenuNoDefinidoOperador}</p>
              </div>
            )}
          </div>
        ) : sinResultados ? (
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
          <div className="space-y-6 pb-4">
            {/* Bloque de Menús Completos de Hoy */}
            {menusFiltrados.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-accent mb-2.5 flex items-center gap-2 font-sans">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Menús completos de hoy</span>
                  <div className="h-px bg-amber-200 flex-1" />
                </h3>
                <div className={CATALOGO_GRID_CLASS}>
                  {menusFiltrados.map((menu) => {
                    const cantEnBorrador = lineasBorrador
                      .filter((l) => l.menuCompletoId === menu.id)
                      .reduce((acc, cur) => acc + cur.cantidad, 0);

                    return (
                      <MenuCompletoCard
                        key={menu.id}
                        menu={menu}
                        cantEnBorrador={cantEnBorrador}
                        onArmarMenu={onArmarMenuCompleto}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloques de Productos Agrupados por Categoría */}
            {Object.entries(productosPorCategoria).map(([cat, prods]) => (
              <div key={cat}>
                <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-500 mb-2.5 flex items-center gap-2 font-sans">
                  <span>{formatCategoriaLabel(cat)}</span>
                  <div className="h-px bg-neutral-200 flex-1" />
                </h3>
                <div className={CATALOGO_GRID_CLASS}>
                  {prods.map((prod) => {
                    const cantEnBorrador = lineasBorrador
                      .filter((l) => l.productoId === prod.id)
                      .reduce((acc, cur) => acc + cur.cantidad, 0);

                    return (
                      <ProductoCard
                        key={prod.id}
                        id={prod.id}
                        nombre={prod.nombre}
                        categoria={prod.categoria}
                        mostrarCategoria={false}
                        precio={prod.precio}
                        cantEnBorrador={cantEnBorrador}
                        esAgotado={Boolean(prod.agotado)}
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

export default CatalogoPedido;
