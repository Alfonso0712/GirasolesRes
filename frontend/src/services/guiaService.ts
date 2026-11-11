import { GUIA_POR_ROL } from '../config/guiaPorRol';
import type { RolUsuario } from '../types/auth';
import type { GuiaRol } from '../types/guia';

const RESUMEN_GENERICO = 'Consulte con el administrador los módulos habilitados para su usuario.';

export const guiaService = {
  /**
   * Devuelve la guía del rol indicado. El contenido es estático (sin llamadas HTTP);
   * si el rol no está registrado, retorna una guía mínima en lugar de fallar.
   */
  obtenerGuiaPorRol(rol: RolUsuario): GuiaRol {
    return GUIA_POR_ROL[rol] ?? { rol, resumen: RESUMEN_GENERICO, secciones: [], flujoHabitual: [] };
  },
};
