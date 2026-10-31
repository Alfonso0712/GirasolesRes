import React from 'react';
import {
  Utensils,
  Search,
  X,
  RotateCcw,
  AlertCircle,
  WifiOff,
} from 'lucide-react';
import type { ProductoCartaPublica } from '../../services/landingService';
import type { MenuDiaResponse } from '../../types/menuDia';
import { formatCategoriaLabel } from '../../utils/formatCategory';

export const CATEGORIAS_FILTRO = [
  { id: 'Todas', label: 'Todos los platos', icon: null },
  { id: 'Desayuno', label: 'Desayunos', icon: '☕' },
  { id: 'Almuerzo', label: 'Almuerzos & Extras', icon: '🍲' },
  { id: 'PlatosExtras', label: 'Platos a la Carta', icon: '🥩' },
  { id: 'Combinados', label: 'Combinados', icon: '🍛' },
  { id: 'Bebidas', label: 'Bebidas & Jarras', icon: '🍹' },
];

export interface LandingCartaSectionProps {
  productos: ProductoCartaPublica[];
  productosFiltrados: ProductoCartaPublica[];
  productosAgotadosSet: Set<string>;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
  busqueda: string;
  setBusqueda: (q: string) => void;
  cargando: boolean;
  errorBackend: boolean;
  menuDia: MenuDiaResponse | null;
  onCargarDatos: () => void;
}

export const LandingCartaSection: React.FC<LandingCartaSectionProps> = ({
  productos,
  productosFiltrados,
  productosAgotadosSet,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  busqueda,
  setBusqueda,
  cargando,
  errorBackend,
  menuDia,
  onCargarDatos,
}) => {
  return (
    <section id="carta" className="py-16 lg:py-24 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título y Buscador */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5 text-amber-700" /> Carta en Vivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3A2211] mt-2">
              Nuestra Carta del Día
            </h2>
            <p className="text-stone-600 mt-1 text-sm sm:text-base">
              Platos disponibles definidos para el menú de hoy. Si un plato se agota en cocina, se refleja
              aquí al instante.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre (ej. Lomo, Café)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF7F4] border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros por Categoría */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_FILTRO.map((cat) => {
              const activo = categoriaSeleccionada === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activo
                      ? 'bg-[#3A2211] text-white shadow-xs'
                      : 'bg-[#FAF7F4] hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-semibold text-stone-500 tabular-nums">
            {cargando
              ? 'Cargando carta...'
              : `Mostrando ${productosFiltrados.length} ${
                  productosFiltrados.length === 1 ? 'producto' : 'productos'
                }`}
          </span>
        </div>

        {/* Grid de Platos */}
        {cargando && productos.length === 0 ? (
          <div className="py-20 text-center">
            <RotateCcw className="w-8 h-8 animate-spin mx-auto text-[#D35400] mb-3" />
            <p className="text-sm font-semibold text-stone-600">
              Cargando carta en tiempo real desde el restaurante...
            </p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-[#FAF7F4] rounded-2xl border border-stone-200 p-8">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="font-bold text-base text-[#3A2211]">
              {menuDia && !menuDia.definido
                ? 'El menú del día aún no ha sido definido para hoy'
                : 'No se encontraron platos'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {menuDia && !menuDia.definido
                ? 'Nuestro equipo de cocina está definiendo la oferta del día. Consulta en unos minutos.'
                : 'Prueba con otro término de búsqueda o selecciona otra categoría.'}
            </p>
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#D35400] text-white text-xs font-bold cursor-pointer hover:bg-[#B84700]"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productosFiltrados.map((item) => {
              const estaAgotado = productosAgotadosSet.has(item.id);
              const precio = item.precio ?? 0;
              const categoriaLabel = formatCategoriaLabel(item.categoria || item.rol || 'Carta');

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {categoriaLabel}
                      </span>

                      {estaAgotado ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          Agotado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Disponible
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#D35400] transition-colors line-clamp-2">
                      {item.nombre}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">Precio</span>
                    <span className="text-base font-extrabold text-[#D35400] tabular-nums">
                      {precio > 0 ? `S/ ${precio.toFixed(2)}` : 'Incluido en menú'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aviso si el servidor no responde */}
        {errorBackend && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                No fue posible sincronizar algunos datos en vivo. Puedes reintentar la conexión.
              </span>
            </div>
            <button
              onClick={onCargarDatos}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition shrink-0 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
