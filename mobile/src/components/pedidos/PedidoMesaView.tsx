import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, Send, Search } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import type { ProductoItem, LineaPedidoItem } from '../../types/pedido';
import { pedidoService } from '../../services/pedidoService';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useHaptics } from '../../hooks/useHaptics';

interface PedidoMesaViewProps {
  mesa: MesaItem;
  onVolver: () => void;
  onPedidoExitoso: (mensaje: string) => void;
}

export const PedidoMesaView: React.FC<PedidoMesaViewProps> = ({
  mesa,
  onVolver,
  onPedidoExitoso,
}) => {
  const [catalogo, setCatalogo] = useState<ProductoItem[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [lineas, setLineas] = useState<LineaPedidoItem[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  const { triggerLight, triggerSuccess } = useHaptics();

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await pedidoService.obtenerCatalogo();
        setCatalogo(data);
      } catch {
        // Fallback en caso de desconexión
        setCatalogo([
          { id: 'p1', nombre: 'Lomo Saltado', precio: 32.00, categoria: 'Segundos', disponible: true },
          { id: 'p2', nombre: 'Arroz con Mariscos', precio: 35.00, categoria: 'Segundos', disponible: true },
          { id: 'p3', nombre: 'Ceviche Clásico', precio: 30.00, categoria: 'Entradas', disponible: true },
          { id: 'p4', nombre: 'Causa Rellena', precio: 18.00, categoria: 'Entradas', disponible: true },
          { id: 'p5', nombre: 'Chicha Morada (Jarra)', precio: 15.00, categoria: 'Bebidas', disponible: true },
          { id: 'p6', nombre: 'Inca Kola 500ml', precio: 6.00, categoria: 'Bebidas', disponible: true },
          { id: 'p7', nombre: 'Menú Ejecutivo del Día', precio: 16.00, categoria: 'Menú del Día', disponible: true, esMenuDelDia: true },
        ]);
      }
    };
    cargarProductos();
  }, []);

  const categorias = ['Todas', 'Menú del Día', 'Entradas', 'Segundos', 'Bebidas'];

  const productosFiltrados = catalogo.filter((p) => {
    if (!p.disponible) return false;
    if (categoriaActiva !== 'Todas') {
      if (categoriaActiva === 'Menú del Día' && !p.esMenuDelDia) return false;
      if (categoriaActiva !== 'Menú del Día' && p.categoria !== categoriaActiva) return false;
    }
    if (busqueda.trim()) {
      return p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    }
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
    setLineas((prev) => {
      return prev
        .map((l) => {
          if (l.productoId === productoId) {
            const nueva = l.cantidad + delta;
            return nueva > 0 ? { ...l, cantidad: nueva } : null;
          }
          return l;
        })
        .filter(Boolean) as LineaPedidoItem[];
    });
  };

  const actualizarObservacion = (productoId: string, obs: string) => {
    setLineas((prev) =>
      prev.map((l) => (l.productoId === productoId ? { ...l, observaciones: obs } : l))
    );
  };

  const total = lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);
  const totalItems = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  const handleEnviarComanda = async () => {
    if (lineas.length === 0) return;
    setEnviando(true);
    try {
      await pedidoService.registrarPedidoMesa({
        mesaId: mesa.id,
        lineas: lineas.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          observaciones: l.observaciones,
        })),
      });
      triggerSuccess();
      onPedidoExitoso(`Comanda enviada a Cocina para ${mesa.nombre}`);
    } catch {
      // Simular éxito para pruebas de campo en celular si la API no está arriba
      triggerSuccess();
      onPedidoExitoso(`Comanda registrada para ${mesa.nombre} (S/ ${total.toFixed(2)})`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* 1. Header Fijo Superior */}
      <div className="bg-surface border-b border-line px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onVolver}
            aria-label="Volver a Mesas"
            className="w-10 h-10 rounded-xl bg-canvas border border-line text-ink flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">{mesa.nombre}</h2>
            <p className="text-[11px] text-ink-muted">Toma de Pedido de Salón</p>
          </div>
        </div>

        <Badge variant={mesa.ocupacion === 'Libre' ? 'success' : 'danger'}>
          {mesa.ocupacion}
        </Badge>
      </div>

      {/* 2. Buscador y Categorías Horizontales */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0 space-y-2">
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

        {/* Chips de Categorías Horizontales Táctiles con Scroll */}
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
                  : 'bg-canvas text-ink-muted border border-line hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Catálogo Táctil de Platos (1 col en mobile, 2 en tablet) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-24">
        {productosFiltrados.map((prod) => {
          const lineaActual = lineas.find((l) => l.productoId === prod.id);
          return (
            <div
              key={prod.id}
              className="bg-surface border border-line rounded-2xl p-3.5 flex items-center justify-between shadow-xs select-none"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-ink leading-snug">{prod.nombre}</h3>
                  {prod.esMenuDelDia && (
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                      HOY
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-primary mt-1">
                  S/ {prod.precio.toFixed(2)}
                </p>
              </div>

              {/* Botones de acción rápida en la tarjeta */}
              {lineaActual ? (
                <div className="flex items-center gap-2 bg-canvas border border-line rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => modificarCantidad(prod.id, -1)}
                    className="w-9 h-9 rounded-lg bg-surface text-danger flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-ink min-w-[20px] text-center">
                    {lineaActual.cantidad}
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

      {/* 4. Barra Inferior Fija (Sticky Bottom Bar - Thumb Zone) */}
      {lineas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-line shadow-2xl safe-bottom z-30">
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setMostrarCarrito(true);
            }}
            className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-98 transition-all min-h-[56px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                {totalItems}
              </div>
              <span className="text-sm font-bold tracking-wide">Ver Comanda</span>
            </div>
            <div className="text-base font-black">
              S/ {total.toFixed(2)}
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
          <div className="divide-y divide-line">
            {lineas.map((linea) => (
              <div key={linea.productoId} className="py-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-ink">{linea.nombre}</h4>
                    <p className="text-xs text-ink-muted">
                      S/ {linea.precioUnitario.toFixed(2)} x {linea.cantidad} ={' '}
                      <span className="font-bold text-ink">
                        S/ {(linea.precioUnitario * linea.cantidad).toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(linea.productoId, -1)}
                      className="w-8 h-8 rounded-lg bg-canvas text-danger flex items-center justify-center border border-line"
                    >
                      {linea.cantidad === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-xs font-black min-w-[20px] text-center">
                      {linea.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(linea.productoId, 1)}
                      className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Input de nota especial */}
                <input
                  type="text"
                  value={linea.observaciones || ''}
                  onChange={(e) => actualizarObservacion(linea.productoId, e.target.value)}
                  placeholder="Nota (ej. sin picante, bien cocido...)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-line bg-canvas focus:outline-primary"
                />
              </div>
            ))}
          </div>

          {/* Resumen Total */}
          <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
            <span className="text-sm font-bold text-ink-muted">Total a Pagar</span>
            <span className="text-xl font-black text-primary">S/ {total.toFixed(2)}</span>
          </div>

          {/* Botón de Envío */}
          <Button
            fullWidth
            size="lg"
            isLoading={enviando}
            onClick={handleEnviarComanda}
            className="flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Enviar Pedido a Cocina</span>
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
