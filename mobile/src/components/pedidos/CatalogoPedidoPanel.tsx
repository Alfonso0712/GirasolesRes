import React from 'react';
import { Search, UtensilsCrossed, Utensils } from 'lucide-react';
import type { LineaBorrador, ProductoMenuPedidoDto } from '../../types/pedido';
import type { MenuCompletoDiaDto } from '../../types/menuDia';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { TarjetaMenuCatalogo } from './TarjetaMenuCatalogo';
import { TarjetaProductoCatalogo } from './TarjetaProductoCatalogo';

export interface FiltrosCatalogoPanel {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  categorias: string[];
  categoriaActiva: string;
  onSelectCategoria: (categoria: string) => void;
}

export interface EstadoCatalogoPanel {
  cargando: boolean;
  catalogoVacio: boolean;
  errorCarga: string | null;
  onReintentar: () => void;
  esMozo?: boolean;
  lineas: LineaBorrador[];
}

export interface AccionesCatalogoPanel {
  onArmarMenu: (menu: MenuCompletoDiaDto) => void;
  onAgregarProducto: (producto: ProductoMenuPedidoDto) => void;
  onModificarCantidad: (lineaId: string, delta: number) => void;
}

export interface CatalogoPedidoPanelProps {
  variante: 'mesa' | 'llevar';
  cabeceraExtra?: React.ReactNode;
  filtros: FiltrosCatalogoPanel;
  estado: EstadoCatalogoPanel;
  menus: MenuCompletoDiaDto[];
  productos: ProductoMenuPedidoDto[];
  acciones: AccionesCatalogoPanel;
}

const BarraFiltrosCatalogo: React.FC<{
  variante: 'mesa' | 'llevar';
  cabeceraExtra?: React.ReactNode;
  filtros: FiltrosCatalogoPanel;
}> = ({ variante, cabeceraExtra, filtros }) => {
  const claseBarra =
    variante === 'mesa'
      ? 'bg-surface border-b border-line px-4 py-2 shrink-0 space-y-2'
      : 'bg-surface border-b border-line px-4 py-2.5 shrink-0 space-y-2';

  return (
    <div className={claseBarra}>
      {cabeceraExtra}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" aria-hidden="true" />
        <input
          type="text"
          value={filtros.busqueda}
          onChange={(e) => filtros.onBusquedaChange(e.target.value)}
          placeholder="Buscar plato o bebida..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-hidden focus:border-primary text-ink"
        />
      </div>
      <FilterChipBar
        chips={filtros.categorias.map((cat) => ({ id: cat, label: cat }))}
        activeId={filtros.categoriaActiva}
        onSelect={filtros.onSelectCategoria}
      />
    </div>
  );
};

const SeccionMenusCatalogo: React.FC<{
  menus: MenuCompletoDiaDto[];
  esMozo?: boolean;
  onArmar: (menu: MenuCompletoDiaDto) => void;
}> = ({ menus, esMozo, onArmar }) =>
  menus.length > 0 ? (
    <div className="space-y-2 mb-3">
      <div className="flex items-center gap-1.5 px-1 pt-1">
        <Utensils className="w-4 h-4 text-accent" />
        <span className="text-xs font-black text-ink uppercase tracking-wider">Menús Completos del Día</span>
      </div>
      {menus.map((m) => (
        <TarjetaMenuCatalogo key={m.id} menu={m} esMozo={esMozo} onArmar={onArmar} />
      ))}
    </div>
  ) : null;

/**
 * Panel compartido izquierdo de búsqueda, filtros por categoría y tarjetas de catálogo.
 */
export const CatalogoPedidoPanel: React.FC<CatalogoPedidoPanelProps> = ({
  variante,
  cabeceraExtra,
  filtros,
  estado,
  menus,
  productos,
  acciones,
}) => {
  const subtituloVacio = variante === 'mesa'
    ? 'No se encontraron productos disponibles en el catálogo para esta selección.'
    : 'No se encontraron productos disponibles en el catálogo para llevar.';
  const sinResultados = !estado.errorCarga && !estado.cargando && productos.length === 0 && menus.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <BarraFiltrosCatalogo variante={variante} cabeceraExtra={cabeceraExtra} filtros={filtros} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-32 md:pb-6">
        {estado.errorCarga && <ErrorState mensaje={estado.errorCarga} onRetry={estado.onReintentar} className="my-4" />}
        {estado.cargando && estado.catalogoVacio && <SkeletonList count={5} />}
        {sinResultados && <EmptyState icon={UtensilsCrossed} titulo="No hay productos disponibles" subtitulo={subtituloVacio} />}
        <SeccionMenusCatalogo menus={menus} esMozo={estado.esMozo} onArmar={acciones.onArmarMenu} />
        {productos.map((prod) => (
          <TarjetaProductoCatalogo key={prod.id} producto={prod} lineaActual={estado.lineas.find((l) => l.productoId === prod.id)} variante={variante} esMozo={estado.esMozo} onAgregar={acciones.onAgregarProducto} onModificarCantidad={acciones.onModificarCantidad} />
        ))}
      </div>
    </div>
  );
};
