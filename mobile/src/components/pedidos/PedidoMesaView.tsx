import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Minus, Trash2, Send, Search, UtensilsCrossed, Utensils, FileText } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import type { ProductoMenuPedidoDto, LineaBorrador } from '../../types/pedido';
import type { MenuDiaResponseDto, MenuCompletoDiaDto } from '../../types/menuDia';
import type { RolUsuario } from '../../types/auth';
import { pedidoService } from '../../services/pedidoService';
import { menuDiaService } from '../../services/menuDiaService';
import { ArmarMenuSheet } from './ArmarMenuSheet';
import { NotaCocinaSheet } from './NotaCocinaSheet';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';

interface PedidoMesaViewProps {
  mesa: MesaItem;
  rol?: RolUsuario;
  onVolver: () => void;
  onPedidoExitoso: (mensaje: string) => void;
}

const ROLES_COMPONENTE_SET = new Set<string>([
  'bebidadesayuno',
  'platodesayuno',
  'sopa',
  'entrada',
  'segundo',
]);

/**
 * RN-140: Los componentes de menú no se pueden ordenar como productos individuales de carta.
 */
function esProductoDeCarta(prod: ProductoMenuPedidoDto): boolean {
  if (prod.rol && prod.rol.trim() !== '') return false;
  if (!prod.categoria) return false;
  return !ROLES_COMPONENTE_SET.has(prod.categoria.trim().toLowerCase());
}

export const PedidoMesaView: React.FC<PedidoMesaViewProps> = ({
  mesa,
  rol = 'Mozo',
  onVolver,
  onPedidoExitoso,
}) => {
  const [catalogo, setCatalogo] = useState<ProductoMenuPedidoDto[]>([]);
  const [menuDia, setMenuDia] = useState<MenuDiaResponseDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaDebounced, setBusquedaDebounced] = useState<string>('');
  const [lineas, setLineas] = useState<LineaBorrador[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState<boolean>(false);
  const [mostrarConfirmDescartar, setMostrarConfirmDescartar] = useState<boolean>(false);
  const [mostrarConfirmEnviar, setMostrarConfirmEnviar] = useState<boolean>(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);
  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDiaDto | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar: mostrarToast } = useToast();

  // Debounce de 250 ms para la búsqueda local en catálogo
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 250);
    return () => clearTimeout(handler);
  }, [busqueda]);

  // Control de navegación y confirmación al descartar pedido en curso
  const solicitarVolver = useCallback(() => {
    if (mostrarConfirmEnviar) {
      setMostrarConfirmEnviar(false);
      return;
    }
    if (lineaParaNota) {
      setLineaParaNota(null);
      return;
    }
    if (menuParaArmar) {
      setMenuParaArmar(null);
      return;
    }
    if (mostrarCarrito) {
      setMostrarCarrito(false);
      return;
    }
    if (mostrarConfirmDescartar) {
      setMostrarConfirmDescartar(false);
      return;
    }
    if (lineas.length > 0) {
      setMostrarConfirmDescartar(true);
    } else {
      onVolver();
    }
  }, [
    mostrarConfirmEnviar,
    lineaParaNota,
    menuParaArmar,
    mostrarCarrito,
    mostrarConfirmDescartar,
    lineas.length,
    onVolver,
  ]);

  useBackHandler(true, () => {
    solicitarVolver();
    return true;
  });

  // Regla RV-154: Prohibición de exposición de importes monetarios al Mozo
  const esMozo = rol === 'Mozo';

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [prods, menu] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(),
        menuDiaService.obtenerMenuHoy().catch(() => null),
      ]);
      setCatalogo(prods || []);
      setMenuDia(menu);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los productos disponibles';
      setErrorCarga(msg);
      setCatalogo([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // Categorías reales dinámicas excluyendo componentes de menú (RN-140)
  const categoriasDinamicas = useMemo(() => {
    const catsSet = new Set<string>();
    catalogo.filter(esProductoDeCarta).forEach((p) => {
      if (p.categoria && p.categoria.trim()) {
        catsSet.add(p.categoria.trim());
      }
    });
    const lista = Array.from(catsSet).sort();
    const tieneMenus = Boolean(menuDia?.definido && (menuDia.menusCompletos?.length ?? 0) > 0);
    return ['Todas', ...(tieneMenus ? ['Menús'] : []), ...lista];
  }, [catalogo, menuDia]);

  // Filtrado de menús completos del día
  const menusFiltrados = useMemo(() => {
    if (!menuDia?.definido || !menuDia.menusCompletos?.length) return [];
    if (categoriaActiva !== 'Todas' && categoriaActiva !== 'Menús') return [];
    if (!busquedaDebounced.trim()) return menuDia.menusCompletos;
    const query = busquedaDebounced.trim().toLowerCase();
    return menuDia.menusCompletos.filter((m) => m.nombre.toLowerCase().includes(query));
  }, [menuDia, categoriaActiva, busquedaDebounced]);

  // Filtrado de productos de carta
  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === 'Menús') {
      return [];
    }
    return catalogo.filter((p) => {
      if (!esProductoDeCarta(p)) return false;
      if (categoriaActiva !== 'Todas' && p.categoria !== categoriaActiva) return false;
      if (busquedaDebounced.trim()) {
        const query = busquedaDebounced.trim().toLowerCase();
        return p.nombre.toLowerCase().includes(query);
      }
      return true;
    });
  }, [catalogo, categoriaActiva, busquedaDebounced]);

  const agregarProducto = (producto: ProductoMenuPedidoDto) => {
    if (producto.agotado) {
      triggerError();
      return;
    }
    const lineaExistente = lineas.find((l) => l.productoId === producto.id);
    if (lineaExistente && lineaExistente.cantidad >= 20) {
      triggerError();
      mostrarToast({
        tipo: 'aviso',
        mensaje: 'La cantidad máxima por línea es 20.',
      });
      return;
    }

    triggerLight();
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.productoId === producto.id);
      if (idx >= 0) {
        const next = [...prev];
        const nuevaCant = next[idx].cantidad + 1;
        next[idx] = {
          ...next[idx],
          cantidad: nuevaCant,
          subtotal: nuevaCant * next[idx].precioUnitario,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: `prod-${producto.id}-${Date.now()}`,
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitario: producto.precio,
          cantidad: 1,
          observacion: '',
          subtotal: producto.precio,
          agotado: producto.agotado,
        },
      ];
    });
  };

  const modificarCantidad = (lineaId: string, delta: number) => {
    const linea = lineas.find((l) => l.id === lineaId);
    if (!linea) return;

    if (delta > 0 && linea.cantidad >= 20) {
      triggerError();
      mostrarToast({
        tipo: 'aviso',
        mensaje: 'La cantidad máxima por línea es 20.',
      });
      return;
    }

    triggerLight();
    setLineas((prev) =>
      prev
        .map((l) => {
          if (l.id === lineaId) {
            const nueva = l.cantidad + delta;
            return nueva > 0
              ? { ...l, cantidad: nueva, subtotal: nueva * l.precioUnitario }
              : null;
          }
          return l;
        })
        .filter(Boolean) as LineaBorrador[]
    );
  };

  const actualizarObservacion = (lineaId: string, observacion: string) => {
    setLineas((prev) =>
      prev.map((l) => (l.id === lineaId ? { ...l, observacion } : l))
    );
  };

  const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const totalItems = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  const solicitarEnvioComanda = () => {
    if (lineas.length === 0) return;
    setErrorEnvio(null);
    setMostrarConfirmEnviar(true);
  };

  const ejecutarEnvioComanda = async () => {
    setEnviando(true);
    setErrorEnvio(null);

    const solicitudId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sol-mesa-${Date.now()}`;

    try {
      const res = await pedidoService.registrarPedidoMesa({
        solicitudId,
        mesaId: mesa.id,
        lineas: lineas.map((l) => ({
          productoId: l.productoId,
          menuCompletoId: l.menuCompletoId,
          elecciones: l.elecciones?.map((e) => ({
            parte: e.parte,
            productoId: e.productoId,
          })),
          cantidad: l.cantidad,
          observacion: l.observacion || undefined,
        })),
      });

      triggerSuccess();
      setMostrarConfirmEnviar(false);
      setMostrarCarrito(false);
      const numPedido = res.numero;
      const msg = esMozo
        ? `Pedido N.º ${numPedido} registrado para ${mesa.nombre}. La comanda se envió a cocina.`
        : `Pedido N.º ${numPedido} registrado para ${mesa.nombre} (${formatCurrency(total)}). La comanda se envió a cocina.`;
      onPedidoExitoso(msg);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al registrar el pedido para la mesa';
      setErrorEnvio(msg);
      setMostrarConfirmEnviar(false);
      if (msg.toLowerCase().includes('agotado') || msg.includes('103')) {
        mostrarToast({
          tipo: 'error',
          mensaje: 'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.',
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado con estado de mesa */}
      <PageHeader
        title={mesa.nombre}
        subtitle="Toma de Pedido de Salón"
        onVolver={solicitarVolver}
        actions={<StatusBadge estado={mesa.ocupacion} />}
        onRefresh={cargarDatos}
        isRefreshing={cargando}
      />

      {/* 2. Buscador y Categorías Horizontales Dinámicas (P-A) */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" aria-hidden="true" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato o bebida..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-hidden focus:border-primary text-ink"
          />
        </div>

        <FilterChipBar
          chips={categoriasDinamicas.map((cat) => ({ id: cat, label: cat }))}
          activeId={categoriaActiva}
          onSelect={(cat) => {
            triggerLight();
            setCategoriaActiva(cat);
          }}
        />
      </div>

      {/* 3. Catálogo de Platos con Categorías Reales */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-32">
        {errorCarga && (
          <ErrorState
            mensaje={errorCarga}
            onRetry={cargarDatos}
            className="my-4"
          />
        )}

        {cargando && catalogo.length === 0 && (
          <SkeletonList count={5} />
        )}

        {!errorCarga && !cargando && productosFiltrados.length === 0 && menusFiltrados.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            titulo="No hay productos disponibles"
            subtitulo="No se encontraron productos disponibles en el catálogo para esta selección."
          />
        )}

        {/* Sección de Menús Completos del Día (P-B) */}
        {menusFiltrados.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1.5 px-1 pt-1">
              <Utensils className="w-4 h-4 text-accent" />
              <span className="text-xs font-black text-ink uppercase tracking-wider">
                Menús Completos del Día
              </span>
            </div>
            {menusFiltrados.map((m) => (
              <Card
                key={m.id}
                accent="info"
                className="p-3.5 flex items-center justify-between shadow-xs select-none"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-extrabold text-ink leading-snug">{m.nombre}</h3>
                    <span className="text-xs font-bold bg-chip-accent-bg text-accent border border-chip-accent-border px-1.5 py-0.5 rounded">
                      Menú Completo
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                    {m.incluye || 'Entrada / Sopa + Segundo + Bebida'}
                  </p>
                  {!esMozo ? (
                    <p className="text-xs font-extrabold text-accent mt-1 tabular-nums">
                      {formatCurrency(m.precio)}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-ink-muted mt-1">
                      Platos a elección
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    triggerLight();
                    setMenuParaArmar(m);
                  }}
                  className="min-h-[44px] px-3 font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Armar Menú</span>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {productosFiltrados.map((prod) => {
          const lineaActual = lineas.find((l) => l.productoId === prod.id);
          const estaAgotado = Boolean(prod.agotado);

          return (
            <Card
              key={prod.id}
              className={`p-3.5 flex items-center justify-between shadow-xs select-none ${
                estaAgotado ? 'opacity-60 bg-surface/50' : ''
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-bold text-ink leading-snug">{prod.nombre}</h3>
                  {estaAgotado && (
                    <span className="text-xs font-bold bg-danger-bg text-danger border border-danger-border px-1.5 py-0.5 rounded">
                      Agotado
                    </span>
                  )}
                </div>
                {/* RV-154: Mozo ve la categoría, Admin/Cajero ve el precio en soles */}
                {esMozo ? (
                  <p className="text-xs font-semibold text-ink-muted mt-1">
                    {prod.categoria}
                  </p>
                ) : (
                  <p className="text-xs font-extrabold text-accent mt-1 tabular-nums">
                    {formatCurrency(prod.precio)}
                  </p>
                )}
              </div>

              {/* Botones de acción táctil con mínimo 44px de área de toque */}
              {estaAgotado ? (
                <button
                  type="button"
                  disabled
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line text-ink-muted flex items-center justify-center cursor-not-allowed opacity-50 shrink-0"
                  aria-label={`${prod.nombre} está agotado`}
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : lineaActual ? (
                <div className="flex items-center gap-1.5 bg-canvas border border-line rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => modificarCantidad(lineaActual.id, -1)}
                    aria-label={`Quitar uno de ${prod.nombre}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-surface text-danger flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="text-sm font-black text-ink min-w-[24px] text-center tabular-nums">
                    {lineaActual.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => modificarCantidad(lineaActual.id, 1)}
                    aria-label={`Agregar uno más de ${prod.nombre}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => agregarProducto(prod)}
                  aria-label={`Agregar ${prod.nombre} a la comanda`}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {/* 4. Barra Inferior Fija (Sticky Bottom Bar - Thumb Zone) */}
      {lineas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-line shadow-2xl safe-bottom z-30">
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setMostrarCarrito(true);
            }}
            className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-98 transition-all min-h-[56px] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center font-black text-xs">
                {totalItems}
              </div>
              <span className="text-sm font-bold tracking-wide">
                {esMozo ? 'Ver Comanda de Sala' : 'Ver Detalle del Pedido'}
              </span>
            </div>
            {/* RV-154: Mozo ve cantidad de ítems, no monto monetario */}
            <div className="text-sm font-black">
              {esMozo ? pluralizar(totalItems, 'plato', 'platos') : formatCurrency(total)}
            </div>
          </button>
        </div>
      )}

      {/* 5. Bottom Sheet: Detalle de Comanda y Envío a Cocina */}
      <BottomSheet
        isOpen={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        title={`Comanda para ${mesa.nombre}`}
      >
        <div className="space-y-4">
          {errorEnvio && (
            <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold">
              {errorEnvio}
            </div>
          )}

          <div className="divide-y divide-line">
            {lineas.map((linea) => (
              <div key={linea.id} className="py-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-ink">{linea.nombre}</h4>
                    {linea.elecciones && linea.elecciones.length > 0 && (
                      <div className="text-xs text-ink-muted bg-canvas p-1.5 rounded-lg border border-line space-y-0.5 mt-1">
                        {linea.elecciones.map((el) => (
                          <div key={el.parte} className="flex justify-between gap-2">
                            <span className="font-semibold text-ink">{el.parte}:</span>
                            <span className="text-ink-muted truncate">{el.productoNombre}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* RV-154: Ocultar importes si es Mozo */}
                    {!esMozo && (
                      <p className="text-xs text-ink-muted">
                        {formatCurrency(linea.precioUnitario)} x {linea.cantidad} ={' '}
                        <span className="font-bold text-ink">
                          {formatCurrency(linea.subtotal)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(linea.id, -1)}
                      aria-label={
                        linea.cantidad === 1
                          ? `Eliminar ${linea.nombre} de la orden`
                          : `Disminuir cantidad de ${linea.nombre}`
                      }
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas text-danger flex items-center justify-center border border-line active:scale-95 transition-transform cursor-pointer"
                    >
                      {linea.cantidad === 1 ? (
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                    <span className="text-sm font-black min-w-[24px] text-center tabular-nums">
                      {linea.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(linea.id, 1)}
                      aria-label={`Aumentar cantidad de ${linea.nombre}`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Botón táctil para nota de cocina con modal de 100 caracteres (P-C) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerLight();
                      setLineaParaNota(linea);
                    }}
                    aria-label={`Nota de cocina para ${linea.nombre}`}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-surface border border-line cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{linea.observacion ? 'Modificar nota' : 'Agregar nota'}</span>
                  </button>
                  {linea.observacion && (
                    <span className="text-xs text-ink-muted italic truncate flex-1">
                      "{linea.observacion}"
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Resumen Total: solo visible si no es Mozo */}
          {!esMozo ? (
            <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
              <span className="text-sm font-bold text-ink-muted">Total a Pagar</span>
              <span className="text-xl font-black text-accent tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-canvas border border-line flex justify-between items-center">
              <span className="text-xs font-bold text-ink-muted">Cantidad total de ítems</span>
              <span className="text-sm font-black text-ink">
                {pluralizar(totalItems, 'producto', 'productos')}
              </span>
            </div>
          )}

          {/* Botón de Envío con ConfirmSheet previa */}
          <Button
            fullWidth
            size="lg"
            isLoading={enviando}
            onClick={solicitarEnvioComanda}
            className="flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Enviar Pedido a Cocina</span>
          </Button>
        </div>
      </BottomSheet>

      {/* Confirmación para Enviar Comanda a Cocina (P-C) */}
      <ConfirmSheet
        isOpen={mostrarConfirmEnviar}
        titulo="Enviar comanda a cocina"
        mensaje={`¿Desea enviar la comanda de la ${mesa.nombre} a cocina?`}
        etiquetaConfirmar="Enviar a cocina"
        etiquetaCancelar="Seguir editando"
        tono="normal"
        onConfirmar={ejecutarEnvioComanda}
        onCancelar={() => setMostrarConfirmEnviar(false)}
      />

      {/* Modal para Nota de Cocina (P-C) */}
      <NotaCocinaSheet
        isOpen={Boolean(lineaParaNota)}
        onClose={() => setLineaParaNota(null)}
        nombrePlato={lineaParaNota?.nombre || ''}
        notaInicial={lineaParaNota?.observacion || ''}
        onGuardarNota={(nota) => {
          if (lineaParaNota) {
            actualizarObservacion(lineaParaNota.id, nota);
            setLineaParaNota(null);
          }
        }}
      />

      {/* Confirmación para Descartar Pedido de Mesa */}
      <ConfirmSheet
        isOpen={mostrarConfirmDescartar}
        titulo="Descartar pedido en curso"
        mensaje="Tiene un pedido con platos seleccionados sin registrar. ¿Desea descartarlo? Los platos no se enviarán a cocina."
        etiquetaConfirmar="Descartar"
        etiquetaCancelar="Seguir editando"
        tono="peligro"
        onConfirmar={() => {
          setMostrarConfirmDescartar(false);
          setLineas([]);
          onVolver();
        }}
        onCancelar={() => setMostrarConfirmDescartar(false)}
      />

      {/* Asistente Paso a Paso para Armar Menú Completo (P-B) */}
      <ArmarMenuSheet
        isOpen={Boolean(menuParaArmar)}
        onClose={() => setMenuParaArmar(null)}
        menu={menuParaArmar}
        esMozo={esMozo}
        onAgregar={(nuevaLinea) => {
          setLineas((prev) => [...prev, nuevaLinea]);
          setMenuParaArmar(null);
        }}
      />
    </div>
  );
};
