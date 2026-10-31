import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { DetallePedidoCompletoDto, ProductoMenuPedido, LineaBorrador, ModificarPedidoRequest } from '../../types/pedido';
import {
  ModificarPedidoLineasCol,
  ModificarPedidoCatalogoCol,
  ModificarPedidoDescarteModal,
} from './modificar-pedido';

interface ModificarPedidoModalProps {
  pedido: DetallePedidoCompletoDto | null;
  isOpen: boolean;
  onClose: () => void;
  catalogoProductos: ProductoMenuPedido[];
  onGuardarModificacion: (pedidoId: string, request: ModificarPedidoRequest) => Promise<void>;
  loading?: boolean;
}

export const ModificarPedidoModal: React.FC<ModificarPedidoModalProps> = ({
  pedido,
  isOpen,
  onClose,
  catalogoProductos,
  onGuardarModificacion,
  loading = false
}) => {
  const [lineas, setLineas] = useState<LineaBorrador[]>([]);
  const [lineasOriginalesJson, setLineasOriginalesJson] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mostrarConfirmarDescarte, setMostrarConfirmarDescarte] = useState(false);

  useEffect(() => {
    if (isOpen && pedido) {
      const borrador: LineaBorrador[] = pedido.lineas.map((l) => ({
        productoId: l.productoId,
        nombre: l.nombre,
        precioUnitario: l.precioUnitario,
        cantidad: l.cantidad,
        observacion: l.observacion || '',
        subtotal: l.subtotal
      }));
      setLineas(borrador);
      setLineasOriginalesJson(JSON.stringify(borrador));
      setErrorValidacion(null);
      setMostrarConfirmarDescarte(false);
    }
  }, [isOpen, pedido]);

  if (!isOpen || !pedido) return null;

  const hayCambiosSinGuardar = JSON.stringify(lineas) !== lineasOriginalesJson;

  const handleCerrar = () => {
    if (hayCambiosSinGuardar) {
      setMostrarConfirmarDescarte(true);
    } else {
      onClose();
    }
  };

  const totalCalculado = lineas.reduce((acc, l) => acc + l.subtotal, 0);

  const handleCambiarCantidad = (index: number, delta: number) => {
    setLineas((prev) => {
      const actual = [...prev];
      const item = actual[index];
      const nuevaCantidad = item.cantidad + delta;
      if (nuevaCantidad < 1 || nuevaCantidad > 20) return prev;

      actual[index] = {
        ...item,
        cantidad: nuevaCantidad,
        subtotal: Number((nuevaCantidad * item.precioUnitario).toFixed(2))
      };
      return actual;
    });
    setErrorValidacion(null);
  };

  const handleCambiarObservacion = (index: number, obs: string) => {
    if (obs.length > 100) return;
    setLineas((prev) => {
      const actual = [...prev];
      actual[index] = { ...actual[index], observacion: obs };
      return actual;
    });
  };

  const handleEliminarLinea = (index: number) => {
    setLineas((prev) => prev.filter((_, i) => i !== index));
    setErrorValidacion(null);
  };

  const handleAgregarProducto = (prod: ProductoMenuPedido) => {
    if (prod.agotado) return;

    setLineas((prev) => {
      // Buscar si ya existe en borrador con observación vacía
      const idx = prev.findIndex((l) => l.productoId === prod.id && l.observacion.trim() === '');
      if (idx !== -1) {
        if (prev[idx].cantidad >= 20) return prev;
        const actual = [...prev];
        const cant = actual[idx].cantidad + 1;
        actual[idx] = {
          ...actual[idx],
          cantidad: cant,
          subtotal: Number((cant * actual[idx].precioUnitario).toFixed(2))
        };
        return actual;
      }

      // Si no existe, revisar si el pedido original tenía precio histórico o tomar precio de catálogo
      const lineaOriginal = pedido.lineas.find((l) => l.productoId === prod.id);
      const precio = lineaOriginal ? lineaOriginal.precioUnitario : prod.precio;

      return [
        ...prev,
        {
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: precio,
          cantidad: 1,
          observacion: '',
          subtotal: precio
        }
      ];
    });
    setErrorValidacion(null);
  };

  const handleGuardar = async () => {
    // RV-78 / MSG-121: Quitar todos los productos obliga a anular
    if (lineas.length === 0) {
      setErrorValidacion('Para quitar todos los productos, anule el pedido.');
      return;
    }

    const payload: ModificarPedidoRequest = {
      lineas: lineas.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        observacion: l.observacion.trim() || undefined
      }))
    };

    try {
      await onGuardarModificacion(pedido.id, payload);
      onClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorValidacion(errorObj?.message || 'Error al actualizar el pedido.');
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modificar-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div className="bg-surface rounded-2xl p-5 sm:p-7 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-3">
                <h3 id="modificar-title" className="text-xl font-bold font-sans text-ink">
                  Modificar Pedido N.º {pedido.numero}
                </h3>
                {hayCambiosSinGuardar && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Cambios sin guardar
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {pedido.tipo === 'Mesa' ? pedido.mesa : (pedido.referencia || 'Para llevar')} · Modifique cantidades u observaciones o agregue platos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCerrar}
              className="modal-close-btn"
              aria-label="Cerrar modal de modificación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorValidacion && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* Body: 2 Columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 min-h-0 overflow-hidden">
            {/* Columna Izquierda: Líneas del Pedido */}
            <ModificarPedidoLineasCol
              lineas={lineas}
              onCambiarCantidad={handleCambiarCantidad}
              onCambiarObservacion={handleCambiarObservacion}
              onEliminarLinea={handleEliminarLinea}
              totalCalculado={totalCalculado}
            />

            {/* Columna Derecha: Catálogo de Productos Disponibles */}
            <ModificarPedidoCatalogoCol
              catalogoProductos={catalogoProductos}
              onAgregarProducto={handleAgregarProducto}
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-100 mt-4 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={loading}
              className="py-3 px-5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={loading || lineas.length === 0}
              className="py-3 px-6 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading ? 'Guardando…' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para descartar cambios (RV-84 / MSG-102) */}
      <ModificarPedidoDescarteModal
        isOpen={mostrarConfirmarDescarte}
        onContinuarEditando={() => setMostrarConfirmarDescarte(false)}
        onDescartar={() => {
          setMostrarConfirmarDescarte(false);
          onClose();
        }}
      />
    </>
  );
};

