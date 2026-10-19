import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import type { DetallePedidoCompletoDto, ProductoMenuPedido, LineaBorrador, ModificarPedidoRequest } from '../types/pedido';

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
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
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
    } catch (err: any) {
      setErrorValidacion(err.message || 'Error al actualizar el pedido.');
    }
  };

  const categorias = Array.from(new Set(catalogoProductos.map((p) => p.categoria)));
  const productosFiltrados = catalogoProductos.filter((p) => {
    const matchCat = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;
    const matchBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusqueda;
  });

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modificar-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-3">
                <h3 id="modificar-title" className="text-xl font-bold font-sans text-[#2C1A0E]">
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
              className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal de modificación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorValidacion && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* Body: 2 Columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 min-h-0 overflow-hidden">
            {/* Columna Izquierda: Líneas del Pedido */}
            <div className="flex flex-col border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 min-h-0 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Líneas del Pedido ({lineas.length})
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Límite 1 a 20 por ítem
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {lineas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    No quedan productos en el pedido. Para quitar todos, debe anular el pedido.
                  </div>
                ) : (
                  lineas.map((l, index) => (
                    <div
                      key={`${l.productoId}-${index}`}
                      className="p-3 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm text-neutral-900">{l.nombre}</div>
                          <div className="text-xs text-neutral-400 font-mono">
                            S/ {l.precioUnitario.toFixed(2)} c/u
                          </div>
                        </div>

                        {/* Control Cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(index, -1)}
                            disabled={l.cantidad <= 1}
                            className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-neutral-800">
                            {l.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(index, 1)}
                            disabled={l.cantidad >= 20}
                            className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarLinea(index)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 ml-1 transition-colors cursor-pointer"
                            aria-label={`Eliminar ${l.nombre}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Observación por línea */}
                      <div>
                        <input
                          type="text"
                          value={l.observacion}
                          onChange={(e) => handleCambiarObservacion(index, e.target.value)}
                          maxLength={100}
                          placeholder="Nota (ej. sin sal, presa pierna)…"
                          className="w-full text-xs p-2 rounded-lg border border-neutral-200 focus:border-[#D35400] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total al pie de columna */}
              <div className="pt-3 border-t border-neutral-200 flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-neutral-600">Nuevo Total:</span>
                <span className="text-xl font-bold font-mono text-[#D35400]">
                  S/ {totalCalculado.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Columna Derecha: Catálogo de Productos Disponibles */}
            <div className="flex flex-col border border-neutral-200 rounded-2xl p-4 bg-white min-h-0 overflow-hidden">
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
                  className="flex-1 text-xs p-2 rounded-xl border border-neutral-300 focus:border-[#D35400] focus:outline-none"
                />
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-neutral-300 focus:border-[#D35400] focus:outline-none cursor-pointer"
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
                        ? 'border-neutral-200 bg-neutral-100/70 text-neutral-400'
                        : 'border-neutral-200 hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-neutral-900">{prod.nombre}</div>
                      <div className="text-neutral-500 font-mono">
                        S/ {prod.precio.toFixed(2)} · {prod.categoria}
                      </div>
                    </div>

                    {prod.agotado ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        Agotado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAgregarProducto(prod)}
                        className="py-1 px-3 rounded-lg bg-amber-500/10 text-[#D35400] hover:bg-[#D35400] hover:text-white font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
              className="py-3 px-6 rounded-xl bg-[#D35400] text-white font-semibold text-xs hover:bg-[#b84500] transition-colors shadow-sm disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading ? 'Guardando…' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para descartar cambios (RV-84 / MSG-102) */}
      {mostrarConfirmarDescarte && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-amber-200 text-center animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-[#2C1A0E] text-base mb-2 font-sans">
              Cambios sin guardar
            </h4>
            <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
              Tiene cambios sin guardar en este pedido. ¿Desea descartarlos y salir?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmarDescarte(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer min-h-[44px]"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmarDescarte(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer min-h-[44px]"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
