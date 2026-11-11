import { useEffect, useRef, type RefObject } from 'react';

/**
 * Debe superar el retardo de foco inicial de ModalWrapper (50 ms) para que el
 * foco quede en el elemento indicado y no en el botón de cierre.
 */
const RETARDO_FOCO_INICIAL_MS = 60;
const SELECTOR_DIALOGO = '[role="dialog"]';

interface AccesibilidadDialogoOpciones {
  isOpen: boolean;
  onClose: () => void;
  /** Elemento interno del modal, usado para ubicar el fondo del diálogo. */
  anclaRef: RefObject<HTMLElement | null>;
  /** Elemento que recibe el foco al abrir. */
  focoInicialRef: RefObject<HTMLElement | null>;
}

/**
 * Complementa a ModalWrapper sin modificarlo: cierra con clic en el fondo,
 * fija el foco inicial y devuelve el foco al elemento que abrió el diálogo.
 */
export const useAccesibilidadDialogo = ({
  isOpen,
  onClose,
  anclaRef,
  focoInicialRef,
}: AccesibilidadDialogoOpciones): void => {
  const disparadorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    disparadorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const temporizador = setTimeout(() => focoInicialRef.current?.focus(), RETARDO_FOCO_INICIAL_MS);

    const manejarClicFondo = (evento: MouseEvent) => {
      const fondo = anclaRef.current?.closest(SELECTOR_DIALOGO);
      if (fondo && evento.target === fondo) onClose();
    };
    document.addEventListener('mousedown', manejarClicFondo);

    return () => {
      clearTimeout(temporizador);
      document.removeEventListener('mousedown', manejarClicFondo);
      disparadorRef.current?.focus();
    };
  }, [isOpen, onClose, anclaRef, focoInicialRef]);
};
