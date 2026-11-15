import { useState } from 'react';
import type { ProductoMenuPedidoDto, LineaBorrador } from '../types/pedido';
import type { MenuDiaResponseDto, MenuCompletoDiaDto } from '../types/menuDia';
import { useHaptics } from './useHaptics';
import { useToast } from '../context/ToastContext';
import { useNetworkStatus } from './useNetworkStatus';
import { useCatalogoPedido } from './useCatalogoPedido';
import { useBorradorStorage } from './useBorradorStorage';
import { MAX_CANTIDAD_POR_LINEA } from '../config/constantes';
import {
  agregarProductoALineas,
  modificarCantidadEnLineas,
  actualizarObservacionEnLineas,
} from '../utils/pedidos';

export interface UseBorradorPedidoOptions {
  draftKey?: string;
  menuDiaInicial?: MenuDiaResponseDto | null;
  onCargarAdicional?: () => Promise<void>;
}

function useModalesPedido() {
  const [mostrarPanelOrden, setMostrarPanelOrden] = useState(false);
  const [mostrarConfirmDescartar, setMostrarConfirmDescartar] = useState(false);
  const [mostrarConfirmEnviar, setMostrarConfirmEnviar] = useState(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);
  const [menuParaArmar, setMenuParaArmar] = useState<MenuCompletoDiaDto | null>(null);
  return {
    mostrarPanelOrden, setMostrarPanelOrden,
    mostrarConfirmDescartar, setMostrarConfirmDescartar,
    mostrarConfirmEnviar, setMostrarConfirmEnviar,
    lineaParaNota, setLineaParaNota,
    menuParaArmar, setMenuParaArmar,
  };
}

/**
 * Hook compartido para gestionar catálogo, líneas de borrador y hojas auxiliares de pedido.
 */
export function useBorradorPedido(options: UseBorradorPedidoOptions = {}) {
  const { draftKey, menuDiaInicial = null, onCargarAdicional } = options;
  const cat = useCatalogoPedido({ menuDiaInicial, onCargarAdicional });
  const [lineas, setLineas] = useState<LineaBorrador[]>([]);
  const storage = useBorradorStorage(draftKey, lineas, setLineas);
  const modales = useModalesPedido();
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const haptics = useHaptics();
  const { mostrar: mostrarToast } = useToast();
  const { sinConexion } = useNetworkStatus();
  const msgLimite = `La cantidad máxima por línea es ${MAX_CANTIDAD_POR_LINEA}.`;

  const agregarProducto = (producto: ProductoMenuPedidoDto) => {
    const res = agregarProductoALineas(lineas, producto);
    if (res.error === 'agotado') return haptics.triggerError();
    if (res.error === 'limite') return (haptics.triggerError(), mostrarToast({ tipo: 'aviso', mensaje: msgLimite }));
    haptics.triggerLight();
    setLineas(res.lineas);
  };

  const modificarCantidad = (lineaId: string, delta: number) => {
    const res = modificarCantidadEnLineas(lineas, lineaId, delta);
    if (res.errorLimite) return (haptics.triggerError(), mostrarToast({ tipo: 'aviso', mensaje: msgLimite }));
    haptics.triggerLight();
    setLineas(res.lineas);
  };

  const actualizarObservacion = (lineaId: string, obs: string) => {
    setLineas((prev) => actualizarObservacionEnLineas(prev, lineaId, obs));
  };

  return {
    ...cat, ...storage, ...modales, ...haptics,
    lineas, setLineas, errorEnvio, setErrorEnvio, enviando, setEnviando, sinConexion, mostrarToast,
    total: lineas.reduce((acc, l) => acc + l.subtotal, 0),
    totalItems: lineas.reduce((acc, l) => acc + l.cantidad, 0),
    agregarProducto, modificarCantidad, actualizarObservacion,
  };
}
