import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, Search, Send, User, UtensilsCrossed, Utensils, FileText, Trash2, Receipt } from 'lucide-react';
import type { ProductoMenuPedidoDto, LineaBorrador } from '../../types/pedido';
import type { MenuDiaResponseDto, MenuCompletoDiaDto } from '../../types/menuDia';
import { pedidoService } from '../../services/pedidoService';
import { menuDiaService } from '../../services/menuDiaService';
import { ArmarMenuSheet } from '../pedidos/ArmarMenuSheet';
import { NotaCocinaSheet } from '../pedidos/NotaCocinaSheet';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';

interface PedidoLlevarViewProps {
  onPedidoCreado: (mensaje: string) => void;
  onIrACobros?: () => void;
}

const ROLES_COMPONENTE_SET = new Set<string>([
  'bebidadesayuno',
  'platodesayuno',
  'sopa',
  'entrada',
  'segundo',
]);

function esProductoDeCarta(prod: ProductoMenuPedidoDto): boolean {
  if (prod.rol && prod.rol.trim() !== '') return false;
  if (!prod.categoria) return false;
  return !ROLES_COMPONENTE_SET.has(prod.categoria.trim().toLowerCase());
}

export const PedidoLlevarView: React.FC<PedidoLlevarViewProps> = ({
  onPedidoCreado,
  onIrACobros,
}) => {
  const [catalogo, setCatalogo] = useState<ProductoMenuPedidoDto[]>([]);
  const [menuDia, setMenuDia] = useState<MenuDiaResponseDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineaBorrador[]>([]);
  const [referencia, setReferencia] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaDebounced, setBusquedaDebounced] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todas');
  const [mostrarResumen, setMostrarResumen] = useState<boolean>(false);
  const [mostrarConfirmDescartar, setMostrarConfirmDescartar] = useState<boolean>(false);
  const [mostrarConfirmEnviar, setMostrarConfirmEnviar] = useState<boolean>(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);
  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDiaDto | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar: mostrarToast } = useToast();

  // Debounce de 250 ms para el buscador
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 250);
    return () => clearTimeout(handler);
  }, [busqueda]);

  // Manejo del botón Atrás
  useBackHandler(lineas.length > 0 || mostrarConfirmDescartar || Boolean(referencia.trim()), () => {
    if (mostrarConfirmEnviar) {
      setMostrarConfirmEnviar(false);
      return true;
    }
    if (lineaParaNota) {
      setLineaParaNota(null);
      return true;
    }
    if (menuParaArmar) {
      setMenuParaArmar(null);
      return true;
    }
    if (mostrarResumen) {
      setMostrarResumen(false);
      return true;
    }
    if (mostrarConfirmDescartar) {
      setMostrarConfirmDescartar(false);
      return true;
    }
    if (lineas.length > 0 || referencia.trim().length > 0) {
      setMostrarConfirmDescartar(true);
      return true;
    }
    return false;
  });

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

  // Menús completos disponibles
  const menusFiltrados = useMemo(() => {
    if (!menuDia?.definido || !menuDia.menusCompletos?.length) return [];
    if (categoriaActiva !== 'Todas' && categoriaActiva !== 'Menús') return [];
    if (!busquedaDebounced.trim()) return menuDia.menusCompletos;
    const query = busquedaDebounced.trim().toLowerCase();
    return menuDia.menusCompletos.filter((m) => m.nombre.toLowerCase().includes(query));
  }, [menuDia, categoriaActiva, busquedaDebounced]);

  // Productos de carta filtrados
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

  const solicitarRegistroPedido = () => {
    if (lineas.length === 0) return;

    const ref = referencia.trim();
    if (ref.length < 2 || ref.length > 30) {
      triggerError();
      setErrorEnvio('La referencia del cliente para llevar debe tener entre 2 y 30 caracteres.');
      mostrarToast({
        tipo: 'error',
        mensaje: 'La referencia del cliente para llevar debe tener entre 2 y 30 caracteres.',
      });
      return;
    }

    setErrorEnvio(null);
    setMostrarConfirmEnviar(true);
  };

  const ejecutarRegistroPedidoLlevar = async () => {
    setEnviando(true);
    setErrorEnvio(null);

    const ref = referencia.trim();
    const solicitudId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sol-llevar-${Date.now()}`;

    try {
      const res = await pedidoService.registrarPedidoLlevar({
        solicitudId,
        referencia: ref,
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
      const numPedido = res.numero;
      const mensajeExito = `Pedido para llevar N.º ${numPedido} registrado. La comanda se envió a cocina.`;

      setLineas([]);
      setReferencia('');
      setMostrarConfirmEnviar(false);
      setMostrarResumen(false);
      onPedidoCreado(mensajeExito);

      if (onIrACobros) {
        onIrACobros();
      }
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al registrar el pedido para llevar';
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

  const renderContenidoResumen = () => (
    <div className="space-y-4">
      {errorEnvio && (
        <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold">
          {errorEnvio}
        </div>
      )}

      <div className="p-3 bg-canvas border border-line rounded-xl text-xs space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-ink-muted">Cliente / Referencia:</span>
          <span className="font-bold text-ink">
            {referencia.trim() || 'No indicada'}
          </span>
        </div>
        {referencia.trim().length < 2 && (
          <p className="text-danger text-xs font-medium">
            Debe indicar una referencia de cliente entre 2 y 30 caracteres.
          </p>
        )}
      </div>

      <div className="divide-y divide-line max-h-[300px] md:max-h-none overflow-y-auto pr-1">
        {lineas.map((l) => (
          <div key={l.id} className="py-2.5 space-y-1.5">
            <div className="flex justify-between items-start text-xs">
              <div>
                <h4 className="font-bold text-ink">{l.nombre}</h4>
                {l.elecciones && l.elecciones.length > 0 && (
                  <div className="text-xs text-ink-muted bg-canvas p-1.5 rounded-lg border border-line space-y-0.5 mt-1">
                    {l.elecciones.map((el) => (
                      <div key={el.parte} className="flex justify-between gap-2">
                        <span className="font-semibold text-ink">{el.parte}:</span>
                        <span className="text-ink-muted truncate">{el.productoNombre}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-ink-muted mt-0.5">
                  {formatCurrency(l.precioUnitario)} x {l.cantidad} ={' '}
                  <span className="font-bold text-ink">{formatCurrency(l.subtotal)}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => modificarCantidad(l.id, -1)}
                  aria-label={
                    l.cantidad === 1
                      ? `Eliminar ${l.nombre} de la orden`
                      : `Disminuir cantidad de ${l.nombre}`
                  }
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas text-danger flex items-center justify-center border border-line active:scale-95 transition-transform cursor-pointer"
                >
                  {l.cantidad === 1 ? (
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <span className="text-sm font-black min-w-[24px] text-center tabular-nums">
                  {l.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => modificarCantidad(l.id, 1)}
                  aria-label={`Aumentar cantidad de ${l.nombre}`}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Nota para cocina */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerLight();
                  setLineaParaNota(l);
                }}
                aria-label={`Nota de cocina para ${l.nombre}`}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 py-1 px-2 rounded-lg bg-surface border border-line cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{l.observacion ? 'Modificar nota' : 'Agregar nota'}</span>
              </button>
              {l.observacion && (
                <span className="text-xs text-ink-muted italic truncate flex-1">
                  "{l.observacion}"
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
        <span className="text-sm font-bold text-ink-muted">Total a Pagar</span>
        <span className="text-xl font-black text-accent tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      <Button
        fullWidth
        size="lg"
        isLoading={enviando}
        disabled={referencia.trim().length < 2 || referencia.trim().length > 30}
        onClick={solicitarRegistroPedido}
        className="flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        <span>Confirmar Pedido para Llevar</span>
      </Button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Pedido para Llevar"
        subtitle="Toma rápida de órdenes de mostrador"
        icon={<ShoppingBag className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarDatos}
        isRefreshing={cargando}
      />

      {/* Contenedor principal con división en dos paneles para tableta (md:) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Panel izquierdo: referencia, buscador, categorías y catálogo */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* 2. Referencia de Cliente Obligatoria (2-30 caracteres) y Buscador */}
          <div className="bg-surface border-b border-line px-4 py-2.5 shrink-0 space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="ref-cliente" className="font-bold text-ink">
              Cliente / Referencia <span className="text-danger">*</span>
            </label>
            <span
              className={`font-mono text-xs ${
                referencia.trim().length >= 2 && referencia.trim().length <= 30
                  ? 'text-success'
                  : 'text-ink-muted'
              }`}
            >
              {referencia.length}/30
            </span>
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-ink-muted absolute left-3 top-3" aria-hidden="true" />
            <input
              id="ref-cliente"
              type="text"
              maxLength={30}
              value={referencia}
              onChange={(e) => {
                setReferencia(e.target.value);
                if (errorEnvio) setErrorEnvio(null);
              }}
              placeholder="Nombre o referencia del cliente (ej. Juan P.)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-hidden focus:border-primary text-ink font-medium"
            />
          </div>
        </div>

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

        {/* Chips de Categorías Dinámicas */}
        <FilterChipBar
          chips={categoriasDinamicas.map((cat) => ({ id: cat, label: cat }))}
          activeId={categoriaActiva}
          onSelect={(cat) => {
            triggerLight();
            setCategoriaActiva(cat);
          }}
        />
      </div>

      {/* 3. Catálogo de Productos y Menús */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-32 md:pb-6">
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
            subtitulo="No se encontraron productos disponibles en el catálogo para llevar."
          />
        )}

        {/* Menús Completos del Día */}
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
                  <p className="text-xs font-extrabold text-accent mt-1 tabular-nums">
                    {formatCurrency(m.precio)}
                  </p>
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

        {/* Productos de Carta */}
        {productosFiltrados.map((prod) => {
          const linea = lineas.find((l) => l.productoId === prod.id);
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
                  <h3 className="text-sm font-bold text-ink">{prod.nombre}</h3>
                  {estaAgotado && (
                    <span className="text-xs font-bold bg-danger-bg text-danger border border-danger-border px-1.5 py-0.5 rounded">
                      Agotado
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-accent mt-0.5 tabular-nums">
                  {formatCurrency(prod.precio)}
                </p>
              </div>

              {estaAgotado ? (
                <button
                  type="button"
                  disabled
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line text-ink-muted flex items-center justify-center cursor-not-allowed opacity-50 shrink-0"
                  aria-label={`${prod.nombre} está agotado`}
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : linea ? (
                <div className="flex items-center gap-1.5 bg-canvas border border-line rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => modificarCantidad(linea.id, -1)}
                    aria-label={`Quitar uno de ${prod.nombre}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg bg-surface text-danger flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="text-sm font-black text-ink min-w-[24px] text-center tabular-nums">
                    {linea.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => modificarCantidad(linea.id, 1)}
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
                  aria-label={`Agregar ${prod.nombre} al pedido`}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </Card>
          );
        })}
      </div>
        </div>

        {/* Panel derecho: Resumen de la Orden siempre visible en tableta / desktop */}
        <aside
          aria-label="Resumen del pedido para llevar"
          className="hidden md:flex md:w-80 lg:w-96 flex-col border-l border-line bg-surface min-h-0 shrink-0"
        >
          <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-ink">Orden para Llevar</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {pluralizar(totalItems, 'ítem', 'ítems')}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {lineas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-ink-muted">
                <Receipt className="w-12 h-12 stroke-1 text-ink-muted/40 mb-2" aria-hidden="true" />
                <p className="text-sm font-bold">Sin productos seleccionados</p>
                <p className="text-xs text-ink-muted mt-1">
                  Ingrese la referencia del cliente y elija productos del catálogo.
                </p>
              </div>
            ) : (
              renderContenidoResumen()
            )}
          </div>
        </aside>
      </div>

      {/* 4. Barra Inferior Táctil (Sticky Bottom Bar) (Solo móvil) */}
      {lineas.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-line shadow-2xl safe-bottom z-30">
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setMostrarResumen(true);
            }}
            className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-98 transition-all min-h-[56px] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center font-black text-xs">
                {totalItems}
              </div>
              <span className="text-sm font-bold tracking-wide">
                Ver Orden ({pluralizar(totalItems, 'producto', 'productos')})
              </span>
            </div>
            <div className="text-sm font-black tabular-nums">{formatCurrency(total)}</div>
          </button>
        </div>
      )}

      {/* 5. Bottom Sheet de Resumen de la Orden (Solo móvil) */}
      <div className="md:hidden">
        <BottomSheet
          isOpen={mostrarResumen}
          onClose={() => setMostrarResumen(false)}
          title="Orden para Llevar"
        >
          {renderContenidoResumen()}
        </BottomSheet>
      </div>

      {/* Confirmación para Registrar Pedido para Llevar (P-E) */}
      <ConfirmSheet
        isOpen={mostrarConfirmEnviar}
        titulo="Registrar pedido para llevar"
        mensaje={`¿Desea registrar el pedido para llevar a nombre de "${referencia.trim()}"? La comanda se enviará a cocina.`}
        etiquetaConfirmar="Registrar y enviar"
        etiquetaCancelar="Seguir editando"
        tono="normal"
        onConfirmar={ejecutarRegistroPedidoLlevar}
        onCancelar={() => setMostrarConfirmEnviar(false)}
      />

      {/* Confirmación para Descartar Pedido para Llevar */}
      <ConfirmSheet
        isOpen={mostrarConfirmDescartar}
        titulo="Descartar pedido en curso"
        mensaje="Tiene un pedido para llevar sin registrar. ¿Desea descartarlo? Los productos seleccionados no se guardarán."
        etiquetaConfirmar="Descartar"
        etiquetaCancelar="Seguir editando"
        tono="peligro"
        onConfirmar={() => {
          setMostrarConfirmDescartar(false);
          setLineas([]);
          setReferencia('');
        }}
        onCancelar={() => setMostrarConfirmDescartar(false)}
      />

      {/* Asistente Paso a Paso para Armar Menú Completo (P-E) */}
      <ArmarMenuSheet
        isOpen={Boolean(menuParaArmar)}
        onClose={() => setMenuParaArmar(null)}
        menu={menuParaArmar}
        esMozo={false}
        onAgregar={(nuevaLinea) => {
          setLineas((prev) => [...prev, nuevaLinea]);
          setMenuParaArmar(null);
        }}
      />

      {/* Modal para Nota de Cocina (P-E) */}
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
    </div>
  );
};
