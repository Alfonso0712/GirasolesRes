import { useState, useRef } from 'react';
import type { LineaBorrador, ProductoMenuPedido } from '../types/pedido';
import type { MenuCompletoDia } from '../types/menuDia';

export interface UsePedidoCartOptions {
  onClearErrors?: () => void;
  onRemoveErrorLinea?: (productoId: string) => void;
}

export function usePedidoCart(options?: UsePedidoCartOptions) {
  const { onClearErrors, onRemoveErrorLinea } = options || {};

  const [lineasBorrador, setLineasBorrador] = useState<LineaBorrador[]>([]);
  const [notas, setNotas] = useState('');

  const [modalDescartarOpen, setModalDescartarOpen] = useState(false);
  const [modalNotaOpen, setModalNotaOpen] = useState(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);
  const [lineaIndexParaNota, setLineaIndexParaNota] = useState<number | null>(null);

  // UUID de solicitud para idempotencia (RNF-21)
  const solicitudIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const generarNuevoSolicitudId = () => {
    solicitudIdRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Agregar producto de carta al borrador
  const agregarProducto = (prod: ProductoMenuPedido) => {
    if (prod.agotado || !prod.disponible) return;

    onClearErrors?.();

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === prod.id && (!l.observacion || l.observacion.trim() === '')
      );

      if (index >= 0) {
        const linea = prev[index];
        if (linea.cantidad >= 20) return prev;
        const nuevaCantidad = linea.cantidad + 1;
        const copia = [...prev];
        copia[index] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }

      return [
        ...prev,
        {
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: prod.precio,
          cantidad: 1,
          observacion: '',
          subtotal: prod.precio,
          agotado: false
        }
      ];
    });

    onRemoveErrorLinea?.(prod.id);
  };

  // Agregar menú completo al borrador (RV-164 / RV-165)
  const agregarMenuCompleto = (
    menu: MenuCompletoDia,
    elecciones: { parte: string; productoId: string; productoNombre: string }[],
    observacion = ''
  ) => {
    onClearErrors?.();
    const obsNormalizada = observacion.trim();

    setLineasBorrador((prev) => {
      // Regla RV-164: Si coincide menú, observación y elecciones exactas, suma la cantidad
      const index = prev.findIndex((l) => {
        if (l.menuCompletoId !== menu.id) return false;
        if ((l.observacion || '').trim().toLowerCase() !== obsNormalizada.toLowerCase()) return false;
        if (!l.elecciones || l.elecciones.length !== elecciones.length) return false;
        return elecciones.every((e) =>
          l.elecciones!.some(
            (le) =>
              le.parte.toLowerCase() === e.parte.toLowerCase() &&
              le.productoId.toLowerCase() === e.productoId.toLowerCase()
          )
        );
      });

      if (index >= 0) {
        const linea = prev[index];
        if (linea.cantidad >= 20) return prev;
        const nuevaCantidad = linea.cantidad + 1;
        const copia = [...prev];
        copia[index] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }

      const nuevaLinea: LineaBorrador = {
        id: `mc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuCompletoId: menu.id,
        nombre: menu.nombre,
        incluye: menu.incluye,
        precioUnitario: menu.precio,
        cantidad: 1,
        observacion: obsNormalizada,
        subtotal: menu.precio,
        agotado: false,
        elecciones: elecciones
      };

      return [...prev, nuevaLinea];
    });
  };

  // Repetir combinación en un toque (RV-165)
  const repetirLinea = (lineaIndex: number) => {
    onClearErrors?.();
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const linea = prev[lineaIndex];
      if (linea.cantidad >= 20) return prev;
      const nuevaCantidad = linea.cantidad + 1;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...linea,
        cantidad: nuevaCantidad,
        subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const disminuirLinea = (lineaIndex: number) => {
    onClearErrors?.();
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const linea = prev[lineaIndex];
      if (linea.cantidad > 1) {
        const nuevaCantidad = linea.cantidad - 1;
        const copia = [...prev];
        copia[lineaIndex] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }
      return prev.filter((_, i) => i !== lineaIndex);
    });
  };

  const actualizarCantidadByIndex = (lineaIndex: number, cantidad: number) => {
    if (cantidad < 1 || cantidad > 20) return;
    onClearErrors?.();
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...copia[lineaIndex],
        cantidad,
        subtotal: Number((cantidad * copia[lineaIndex].precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const quitarLineaByIndex = (lineaIndex: number) => {
    setLineasBorrador((prev) => prev.filter((_, i) => i !== lineaIndex));
  };

  // Métodos retrocompatibles basados en productoId
  const disminuirProducto = (productoId: string, observacion = '') => {
    onClearErrors?.();
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && (l.observacion || '').toLowerCase() === obsTrim.toLowerCase()
      );
      if (index < 0) return prev;
      const linea = prev[index];
      if (linea.cantidad > 1) {
        const nuevaCantidad = linea.cantidad - 1;
        const copia = [...prev];
        copia[index] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const actualizarCantidad = (productoId: string, cantidad: number, observacion = '') => {
    if (cantidad < 1 || cantidad > 20) return;
    onClearErrors?.();
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && (l.observacion || '').toLowerCase() === obsTrim.toLowerCase()
      );
      if (index < 0) return prev;
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        cantidad,
        subtotal: Number((cantidad * copia[index].precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const quitarLinea = (productoId: string, observacion = '') => {
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) =>
      prev.filter((l) => !(l.productoId === productoId && (l.observacion || '').toLowerCase() === obsTrim.toLowerCase()))
    );
    onRemoveErrorLinea?.(productoId);
  };

  const abrirModalNota = (linea: LineaBorrador) => {
    const idx = lineasBorrador.indexOf(linea);
    setLineaParaNota(linea);
    setLineaIndexParaNota(idx >= 0 ? idx : null);
    setModalNotaOpen(true);
  };

  const abrirModalNotaByIndex = (index: number) => {
    if (index >= 0 && index < lineasBorrador.length) {
      setLineaParaNota(lineasBorrador[index]);
      setLineaIndexParaNota(index);
      setModalNotaOpen(true);
    }
  };

  const guardarNota = (nuevaObservacion: string) => {
    if (lineaIndexParaNota !== null && lineaIndexParaNota >= 0 && lineaIndexParaNota < lineasBorrador.length) {
      guardarNotaByIndex(lineaIndexParaNota, nuevaObservacion);
      return;
    }

    if (!lineaParaNota) return;

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) =>
          l.productoId === lineaParaNota.productoId &&
          l.menuCompletoId === lineaParaNota.menuCompletoId &&
          l.observacion === lineaParaNota.observacion
      );
      if (index < 0) return prev;

      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        observacion: nuevaObservacion.trim()
      };
      return copia;
    });

    setModalNotaOpen(false);
    setLineaParaNota(null);
    setLineaIndexParaNota(null);
  };

  const guardarNotaByIndex = (lineaIndex: number, nuevaObservacion: string) => {
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...copia[lineaIndex],
        observacion: nuevaObservacion.trim()
      };
      return copia;
    });
    setModalNotaOpen(false);
    setLineaParaNota(null);
    setLineaIndexParaNota(null);
  };

  const solicitarDescarte = () => {
    if (lineasBorrador.length > 0) {
      setModalDescartarOpen(true);
    }
  };

  const confirmarDescarte = () => {
    setLineasBorrador([]);
    setNotas('');
    generarNuevoSolicitudId();
    setModalDescartarOpen(false);
  };

  const limpiarCarrito = () => {
    setLineasBorrador([]);
    setNotas('');
    generarNuevoSolicitudId();
  };

  // Cálculos totales en memoria
  const totalCalculado = lineasBorrador.reduce((acc, l) => acc + l.subtotal, 0);
  const cantidadTotalProductos = lineasBorrador.reduce((acc, l) => acc + l.cantidad, 0);

  return {
    lineasBorrador,
    setLineasBorrador,
    notas,
    setNotas,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    setLineaParaNota,
    lineaIndexParaNota,
    setLineaIndexParaNota,
    solicitudIdRef,
    generarNuevoSolicitudId,
    agregarProducto,
    agregarMenuCompleto,
    repetirLinea,
    disminuirLinea,
    actualizarCantidadByIndex,
    quitarLineaByIndex,
    disminuirProducto,
    actualizarCantidad,
    quitarLinea,
    abrirModalNota,
    abrirModalNotaByIndex,
    guardarNota,
    guardarNotaByIndex,
    solicitarDescarte,
    confirmarDescarte,
    limpiarCarrito,
    totalCalculado,
    cantidadTotalProductos,
  };
}
