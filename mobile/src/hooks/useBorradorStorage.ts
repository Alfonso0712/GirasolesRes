import { useState, useEffect, useCallback } from 'react';
import type { LineaBorrador } from '../types/pedido';
import { esLineaBorrador } from '../utils/pedidos';
import { useHaptics } from './useHaptics';
import { useToast } from '../context/ToastContext';

function leerBorradorSession(draftKey: string): LineaBorrador[] {
  try {
    const raw = sessionStorage.getItem(draftKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(esLineaBorrador) : [];
  } catch {
    return [];
  }
}

function persistirBorradorSession(draftKey: string, lineas: LineaBorrador[]): void {
  try {
    if (lineas.length > 0) sessionStorage.setItem(draftKey, JSON.stringify(lineas));
    else sessionStorage.removeItem(draftKey);
  } catch {
    // Manejo silencioso de cuotas de almacenamiento
  }
}

/**
 * Gestiona la recuperación y persistencia de un borrador de pedido en sessionStorage.
 */
export function useBorradorStorage(
  draftKey: string | undefined,
  lineas: LineaBorrador[],
  setLineas: (lineas: LineaBorrador[]) => void
) {
  const [hayBorradorGuardado, setHayBorradorGuardado] = useState(false);
  const [borradorRecuperado, setBorradorRecuperado] = useState<LineaBorrador[] | null>(null);
  const { triggerLight, triggerSuccess } = useHaptics();
  const { mostrar: mostrarToast } = useToast();

  useEffect(() => {
    if (!draftKey) return;
    const validas = leerBorradorSession(draftKey);
    if (validas.length > 0) { setBorradorRecuperado(validas); setHayBorradorGuardado(true); }
  }, [draftKey]);

  useEffect(() => {
    if (draftKey) persistirBorradorSession(draftKey, lineas);
  }, [lineas, draftKey]);

  const descartarBorradorGuardado = useCallback(() => {
    triggerLight();
    if (draftKey) sessionStorage.removeItem(draftKey);
    setHayBorradorGuardado(false);
    setBorradorRecuperado(null);
  }, [draftKey, triggerLight]);

  const restaurarBorradorGuardado = useCallback(() => {
    if (!borradorRecuperado) return;
    triggerSuccess();
    setLineas(borradorRecuperado);
    setHayBorradorGuardado(false);
    setBorradorRecuperado(null);
    mostrarToast({ tipo: 'info', mensaje: 'Se restauró el pedido guardado para esta mesa.' });
  }, [borradorRecuperado, mostrarToast, setLineas, triggerSuccess]);

  return { hayBorradorGuardado, borradorRecuperado, descartarBorradorGuardado, restaurarBorradorGuardado };
}
