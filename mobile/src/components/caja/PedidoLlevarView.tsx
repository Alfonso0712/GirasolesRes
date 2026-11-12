import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Search, Send, User, AlertCircle, RefreshCw, UtensilsCrossed } from 'lucide-react';
import type { ProductoItem, LineaPedidoItem } from '../../types/pedido';
import { pedidoService } from '../../services/pedidoService';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency, pluralizar } from '../../utils/format';

interface PedidoLlevarViewProps {
  onPedidoCreado: (mensaje: string) => void;
  onIrACobros?: () => void;
}

export const PedidoLlevarView: React.FC<PedidoLlevarViewProps> = ({
  onPedidoCreado,
  onIrACobros,
}) => {
  const [catalogo, setCatalogo] = useState<ProductoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineaPedidoItem[]>([]);
  const [referencia, setReferencia] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  const cargarCatalogo = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const data = await pedidoService.obtenerCatalogo();
      setCatalogo(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los productos disponibles';
      setErrorCarga(msg);
      setCatalogo([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const categorias = ['Todas', 'Entradas', 'Segundos', 'Bebidas'];

  const productosFiltrados = catalogo.filter((p) => {
    if (!p.disponible) return false;
    if (categoriaActiva !== 'Todas' && p.categoria !== categoriaActiva) return false;
    if (busqueda.trim() && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const agregarProducto = (producto: ProductoItem) => {
    triggerLight();
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.productoId === producto.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].cantidad += 1;
        return next;
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitario: producto.precio,
          cantidad: 1,
        },
      ];
    });
  };

  const modificarCantidad = (productoId: string, delta: number) => {
    triggerLight();
    setLineas((prev) =>
      prev
        .map((l) => {
          if (l.productoId === productoId) {
            const nueva = l.cantidad + delta;
            return nueva > 0 ? { ...l, cantidad: nueva } : null;
          }
          return l;
        })
        .filter(Boolean) as LineaPedidoItem[]
    );
  };

  const total = lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);
  const totalItems = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  const handleRegistrarPedidoLlevar = async () => {
    if (lineas.length === 0) return;
    setEnviando(true);
    setErrorEnvio(null);

    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-llevar-${Date.now()}`;

    try {
      await pedidoService.registrarPedidoLlevar({
        solicitudId,
        referencia: referencia.trim() || 'Cliente Mostrador',
        lineas: lineas.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          observaciones: l.observaciones,
        })),
      });

      triggerSuccess();
      setLineas([]);
      setReferencia('');
      setMostrarResumen(false);
      onPedidoCreado(`Pedido para llevar registrado (${formatCurrency(total)})`);
      if (onIrACobros) onIrACobros();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al registrar el pedido para llevar';
      setErrorEnvio(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Pedido para Llevar</h2>
            <p className="text-xs text-ink-muted">Toma rápida de órdenes de mostrador</p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarCatalogo}
          disabled={cargando}
          aria-label="Actualizar catálogo"
          className="w-10 h-10 rounded-xl bg-canvas border border-line text-ink flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Referencia de Cliente & Buscador */}
      <div className="bg-surface border-b border-line px-4 py-2.5 shrink-0 space-y-2">
        <div className="relative">
          <User className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Nombre / Referencia de cliente (ej. Juan P.)"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-primary font-medium"
          />
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato o bebida..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-primary"
          />
        </div>

        {/* Chips de Categorías */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                triggerLight();
                setCategoriaActiva(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all min-h-[36px] ${
                categoriaActiva === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-canvas text-ink-muted border border-line'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo de Productos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-24">
        {errorCarga && (
          <ErrorState
            mensaje={errorCarga}
            onRetry={cargarCatalogo}
            className="my-4"
          />
        )}

        {!errorCarga && !cargando && productosFiltrados.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            titulo="No hay productos disponibles"
            subtitulo="No se encontraron productos disponibles en el catálogo para llevar."
          />
        )}

        {productosFiltrados.map((prod) => {
          const linea = lineas.find((l) => l.productoId === prod.id);
          return (
            <div
              key={prod.id}
              className="bg-surface border border-line rounded-2xl p-3.5 flex items-center justify-between shadow-xs select-none"
            >
              <div className="flex-1 pr-3">
                <h3 className="text-sm font-bold text-ink">{prod.nombre}</h3>
                <p className="text-xs font-extrabold text-primary mt-0.5">
                  {formatCurrency(prod.precio)}
                </p>
              </div>

              {linea ? (
                <div className="flex items-center gap-2 bg-canvas border border-line rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => modificarCantidad(prod.id, -1)}
                    className="w-9 h-9 rounded-lg bg-surface text-danger flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-ink min-w-[20px] text-center">
                    {linea.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => modificarCantidad(prod.id, 1)}
                    className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => agregarProducto(prod)}
                  className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      {lineas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-line shadow-2xl safe-bottom z-30">
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setMostrarResumen(true);
            }}
            className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-98 transition-all min-h-[56px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                {totalItems}
              </div>
              <span className="text-sm font-bold tracking-wide">
                Ver Orden ({pluralizar(totalItems, 'producto', 'productos')})
              </span>
            </div>
            <div className="text-sm font-black">{formatCurrency(total)}</div>
          </button>
        </div>
      )}

      {/* Bottom Sheet de Resumen */}
      <BottomSheet
        isOpen={mostrarResumen}
        onClose={() => setMostrarResumen(false)}
        title="Orden para Llevar"
      >
        <div className="space-y-4">
          {errorEnvio && (
            <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorEnvio}</span>
            </div>
          )}

          <div className="p-3 bg-canvas border border-line rounded-xl text-xs">
            <span className="text-ink-muted">Cliente:</span>{' '}
            <span className="font-bold text-ink">{referencia || 'Cliente Mostrador'}</span>
          </div>

          <div className="divide-y divide-line">
            {lineas.map((l) => (
              <div key={l.productoId} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-ink">{l.nombre}</h4>
                  <p className="text-ink-muted">
                    {formatCurrency(l.precioUnitario)} x {l.cantidad}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-ink">
                    {formatCurrency(l.precioUnitario * l.cantidad)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(l.productoId, -1)}
                      className="w-7 h-7 rounded-lg bg-canvas text-danger flex items-center justify-center border border-line"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(l.productoId, 1)}
                      className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
            <span className="text-sm font-bold text-ink-muted">Total a Pagar</span>
            <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
          </div>

          <Button
            fullWidth
            size="lg"
            isLoading={enviando}
            onClick={handleRegistrarPedidoLlevar}
            className="flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Confirmar Pedido para Llevar</span>
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
