import { useEffect } from 'react';
import { resolveNavigation } from '../config/navigationConfig';

export const DEFAULT_DOCUMENT_TITLE = 'Restaurante Girasoles';

/**
 * Actualiza dinámicamente el document.title del navegador con el formato
 * "{Nombre de la pantalla} - Girasoles" usando la misma fuente de resolución
 * que la miga de pan y el menú lateral.
 * Al desmontarse o salir de sesión, restaura "Restaurante Girasoles".
 */
export function useDocumentTitle(paginaActiva?: string): void {
  useEffect(() => {
    if (!paginaActiva) {
      document.title = DEFAULT_DOCUMENT_TITLE;
      return;
    }

    const { page } = resolveNavigation(paginaActiva);
    if (page) {
      document.title = `${page} - Girasoles`;
    } else {
      document.title = DEFAULT_DOCUMENT_TITLE;
    }

    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [paginaActiva]);
}

export default useDocumentTitle;
