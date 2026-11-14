import type {
  MenuDiaResponseDto,
  CandidatoMenuDto,
  GuardarMenuDiaRequest,
} from '../types/menuDia';

export const MSG_219 = (nombreMenu: string, nombreParte: string): string =>
  `${nombreMenu} necesita al menos una opción en "${nombreParte}". Seleccione opciones o quite el menú de hoy.`;

export const MSG_224 =
  'Seleccione al menos un producto de carta o habilite un menú completo con sus opciones.';

export const MSG_102 = 'Tiene cambios sin guardar. ¿Desea descartarlos y salir?';

export interface ParteMenuCompletoConfig {
  id: number;
  nombre: string;
  orden: number;
  rolesPermitidos: string[];
}

export interface MenuCompletoCatalogoItem {
  id: number;
  nombre: string;
  precio: number;
  incluye: string;
  resumenPartes: string;
  partes: ParteMenuCompletoConfig[];
}

export const CATALOGO_MENUS_COMPLETOS: readonly MenuCompletoCatalogoItem[] = [
  {
    id: 1,
    nombre: 'Desayuno completo',
    precio: 7.0,
    incluye: 'Pan',
    resumenPartes: 'Pan · Bebida · Plato',
    partes: [
      { id: 1, nombre: 'Bebida', orden: 1, rolesPermitidos: ['BebidaDesayuno'] },
      { id: 2, nombre: 'Plato', orden: 2, rolesPermitidos: ['PlatoDesayuno'] },
    ],
  },
  {
    id: 2,
    nombre: 'Almuerzo completo',
    precio: 8.0,
    incluye: 'Refresco del día',
    resumenPartes: 'Refresco · Sopa o entrada · Segundo',
    partes: [
      { id: 3, nombre: 'Sopa o entrada', orden: 1, rolesPermitidos: ['Sopa', 'Entrada'] },
      { id: 4, nombre: 'Segundo', orden: 2, rolesPermitidos: ['Segundo'] },
    ],
  },
  {
    id: 3,
    nombre: 'Solo segundo',
    precio: 7.0,
    incluye: 'Refresco del día',
    resumenPartes: 'Refresco · Segundo',
    partes: [
      { id: 5, nombre: 'Segundo', orden: 1, rolesPermitidos: ['Segundo'] },
    ],
  },
];

export interface GrupoCandidatos {
  clave: string;
  titulo: string;
  tipo: 'Componente' | 'Carta';
  items: CandidatoMenuDto[];
}

export const GRUPOS_COMPONENTES_ORDEN: readonly { clave: string; titulo: string }[] = [
  { clave: 'BebidaDesayuno', titulo: 'Bebidas de Desayuno' },
  { clave: 'PlatoDesayuno', titulo: 'Platos de Desayuno' },
  { clave: 'Sopa', titulo: 'Sopas del Día' },
  { clave: 'Entrada', titulo: 'Entradas del Día' },
  { clave: 'Segundo', titulo: 'Segundos del Día' },
];

export const GRUPOS_CARTA_ORDEN: readonly {
  clave: string;
  titulo: string;
  categorias: readonly string[];
}[] = [
  { clave: 'Desayuno', titulo: 'Desayunos de carta', categorias: ['Desayuno'] },
  {
    clave: 'PlatosExtras',
    titulo: 'Platos / Extras',
    categorias: ['Almuerzo', 'PlatosExtras', 'Platos Extras'],
  },
  { clave: 'Combinados', titulo: 'Combinados', categorias: ['Combinados'] },
  { clave: 'Bebidas', titulo: 'Bebidas', categorias: ['Bebidas', 'Bebidas y Refrescos'] },
  { clave: 'Otros', titulo: 'Otros', categorias: ['Otro', 'Otros'] },
];

export interface SeleccionMenuDia {
  opciones: string[];
  productosCarta: string[];
  menusCompletos: number[];
  rolesPorOpcion: Record<string, string>;
  tiposPorId: Record<string, 'Componente' | 'Carta'>;
}

export interface ResultadoValidacionMenu {
  valido: boolean;
  errores: string[];
  mensaje: string | null;
  erroresPorMenu: Record<number, string>;
}

function normalizarIdsUnicos(ids: Iterable<string>): string[] {
  return Array.from(new Set(ids)).sort();
}

function normalizarMenusUnicos(ids: Iterable<number>): number[] {
  return Array.from(new Set(ids)).sort((a, b) => a - b);
}

/**
 * Construye el estado de selección inicial a partir del menú de hoy y los candidatos activos.
 */
export function construirSeleccion(
  hoy: MenuDiaResponseDto | null | undefined,
  candidatos: CandidatoMenuDto[] = []
): SeleccionMenuDia {
  const rolesPorOpcion: Record<string, string> = {};
  const tiposPorId: Record<string, 'Componente' | 'Carta'> = {};

  for (const cand of candidatos) {
    tiposPorId[cand.id] = cand.tipo;
    if (cand.tipo === 'Componente' && cand.rol) {
      rolesPorOpcion[cand.id] = cand.rol;
    }
  }

  for (const op of hoy?.opciones ?? []) {
    tiposPorId[op.productoId] = 'Componente';
    if (op.rol && !rolesPorOpcion[op.productoId]) {
      rolesPorOpcion[op.productoId] = op.rol;
    }
  }

  for (const pl of hoy?.platos ?? []) {
    if (!tiposPorId[pl.productoId]) {
      tiposPorId[pl.productoId] = 'Carta';
    }
  }

  const tieneCandidatos = candidatos.length > 0;
  const idsComponentesActivos = new Set(
    candidatos.filter((c) => c.tipo === 'Componente').map((c) => c.id)
  );
  const idsCartaActivos = new Set(
    candidatos.filter((c) => c.tipo === 'Carta').map((c) => c.id)
  );

  const opcionesIniciales = (hoy?.opciones ?? [])
    .map((o) => o.productoId)
    .filter((id) => !tieneCandidatos || idsComponentesActivos.has(id));

  const cartaInicial = (hoy?.platos ?? [])
    .map((p) => p.productoId)
    .filter((id) => !tieneCandidatos || idsCartaActivos.has(id));

  const menusHab: number[] = [];
  for (const mc of hoy?.menusCompletos ?? []) {
    const tieneOpcionesEnPartes = (mc.partes ?? []).some(
      (p) => (p.opciones ?? []).length > 0
    );
    if (mc.disponible || (hoy?.definido && tieneOpcionesEnPartes)) {
      menusHab.push(mc.id);
    }
  }

  return {
    opciones: normalizarIdsUnicos(opcionesIniciales),
    productosCarta: normalizarIdsUnicos(cartaInicial),
    menusCompletos: normalizarMenusUnicos(menusHab),
    rolesPorOpcion,
    tiposPorId,
  };
}

/**
 * Alterna la selección de un producto individual (componente de menú o plato de carta).
 */
export function alternarOpcion(
  seleccion: SeleccionMenuDia,
  productoId: string,
  tipoExplicito?: 'Componente' | 'Carta',
  rolExplicito?: string | null
): SeleccionMenuDia {
  const tipo =
    tipoExplicito ??
    seleccion.tiposPorId[productoId] ??
    (seleccion.productosCarta.includes(productoId) ? 'Carta' : 'Componente');

  const rolesPorOpcion = { ...seleccion.rolesPorOpcion };
  const tiposPorId = { ...seleccion.tiposPorId, [productoId]: tipo };
  if (tipo === 'Componente' && rolExplicito) {
    rolesPorOpcion[productoId] = rolExplicito;
  }

  if (tipo === 'Carta') {
    const set = new Set(seleccion.productosCarta);
    if (set.has(productoId)) {
      set.delete(productoId);
    } else {
      set.add(productoId);
    }
    return {
      ...seleccion,
      productosCarta: normalizarIdsUnicos(set),
      rolesPorOpcion,
      tiposPorId,
    };
  }

  const set = new Set(seleccion.opciones);
  if (set.has(productoId)) {
    set.delete(productoId);
  } else {
    set.add(productoId);
  }
  return {
    ...seleccion,
    opciones: normalizarIdsUnicos(set),
    rolesPorOpcion,
    tiposPorId,
  };
}

/**
 * Alterna un grupo entero ("Seleccionar todos" / "Deseleccionar todos").
 * Si todos los elementos del grupo ya están seleccionados, los deselecciona todos;
 * en caso contrario, selecciona todos los elementos del grupo.
 */
export function alternarGrupo(
  seleccion: SeleccionMenuDia,
  grupo: readonly (string | CandidatoMenuDto)[],
  tipoExplicito?: 'Componente' | 'Carta'
): SeleccionMenuDia {
  if (grupo.length === 0) {
    return seleccion;
  }

  const ids: string[] = [];
  const rolesPorOpcion = { ...seleccion.rolesPorOpcion };
  const tiposPorId = { ...seleccion.tiposPorId };

  let tipoDetectado: 'Componente' | 'Carta' | undefined = tipoExplicito;

  for (const item of grupo) {
    if (typeof item === 'string') {
      ids.push(item);
      if (!tipoDetectado && tiposPorId[item]) {
        tipoDetectado = tiposPorId[item];
      }
    } else {
      ids.push(item.id);
      tiposPorId[item.id] = item.tipo;
      if (!tipoDetectado) {
        tipoDetectado = item.tipo;
      }
      if (item.tipo === 'Componente' && item.rol) {
        rolesPorOpcion[item.id] = item.rol;
      }
    }
  }

  const tipoFinal: 'Componente' | 'Carta' =
    tipoDetectado ??
    (ids.some((id) => seleccion.productosCarta.includes(id)) ? 'Carta' : 'Componente');

  for (const id of ids) {
    if (!tiposPorId[id]) {
      tiposPorId[id] = tipoFinal;
    }
  }

  if (tipoFinal === 'Carta') {
    const set = new Set(seleccion.productosCarta);
    const todosMarcados = ids.every((id) => set.has(id));
    for (const id of ids) {
      if (todosMarcados) {
        set.delete(id);
      } else {
        set.add(id);
      }
    }
    return {
      ...seleccion,
      productosCarta: normalizarIdsUnicos(set),
      rolesPorOpcion,
      tiposPorId,
    };
  }

  const set = new Set(seleccion.opciones);
  const todosMarcados = ids.every((id) => set.has(id));
  for (const id of ids) {
    if (todosMarcados) {
      set.delete(id);
    } else {
      set.add(id);
    }
  }
  return {
    ...seleccion,
    opciones: normalizarIdsUnicos(set),
    rolesPorOpcion,
    tiposPorId,
  };
}

/**
 * Alterna la habilitación de un menú completo (1, 2 o 3).
 */
export function alternarMenuCompleto(
  seleccion: SeleccionMenuDia,
  menuId: number
): SeleccionMenuDia {
  const set = new Set(seleccion.menusCompletos);
  if (set.has(menuId)) {
    set.delete(menuId);
  } else {
    set.add(menuId);
  }
  return {
    ...seleccion,
    menusCompletos: normalizarMenusUnicos(set),
  };
}

/**
 * Cuenta cuántos elementos de un grupo están seleccionados actualmente.
 */
export function contarSeleccionados(
  grupo:
    | readonly (string | { id: string })[]
    | { items: readonly (string | { id: string })[]; seleccion?: SeleccionMenuDia | ReadonlySet<string> | readonly string[] },
  seleccion?: SeleccionMenuDia | ReadonlySet<string> | readonly string[]
): number {
  const listaItems = Array.isArray(grupo)
    ? grupo
    : 'items' in grupo
    ? grupo.items
    : [];
  const fuenteSeleccion =
    seleccion ?? (!Array.isArray(grupo) && 'seleccion' in grupo ? grupo.seleccion : undefined);

  if (listaItems.length === 0 || !fuenteSeleccion) {
    return 0;
  }

  let conjuntoSeleccionados: Set<string>;
  if (fuenteSeleccion instanceof Set) {
    conjuntoSeleccionados = fuenteSeleccion;
  } else if (Array.isArray(fuenteSeleccion)) {
    conjuntoSeleccionados = new Set(fuenteSeleccion);
  } else {
    const sel = fuenteSeleccion as SeleccionMenuDia;
    conjuntoSeleccionados = new Set([...sel.opciones, ...sel.productosCarta]);
  }

  let contador = 0;
  for (const item of listaItems) {
    const id = typeof item === 'string' ? item : item.id;
    if (conjuntoSeleccionados.has(id)) {
      contador += 1;
    }
  }
  return contador;
}

/**
 * Formatea el contador "x de y" para encabezados de grupo.
 */
export function formatearContadorGrupo(seleccionados: number, total: number): string {
  return `${seleccionados} de ${total}`;
}

/**
 * Agrupa los candidatos activos en las 5 secciones por rol de componente y las 5 categorías de carta.
 */
export function agruparCandidatos(candidatos: readonly CandidatoMenuDto[]): {
  gruposOpciones: GrupoCandidatos[];
  gruposCarta: GrupoCandidatos[];
} {
  const componentes = candidatos.filter((c) => c.tipo === 'Componente');
  const carta = candidatos.filter((c) => c.tipo === 'Carta');

  const gruposOpciones: GrupoCandidatos[] = GRUPOS_COMPONENTES_ORDEN.map((g) => ({
    clave: g.clave,
    titulo: g.titulo,
    tipo: 'Componente',
    items: componentes.filter((c) => c.rol === g.clave),
  }));

  const categoriasConocidas = new Set<string>(
    GRUPOS_CARTA_ORDEN.flatMap((g) => g.categorias)
  );

  const gruposCarta: GrupoCandidatos[] = GRUPOS_CARTA_ORDEN.map((g) => {
    if (g.clave === 'Otros') {
      return {
        clave: g.clave,
        titulo: g.titulo,
        tipo: 'Carta',
        items: carta.filter(
          (c) =>
            !c.categoria ||
            g.categorias.includes(c.categoria) ||
            !categoriasConocidas.has(c.categoria)
        ),
      };
    }
    return {
      clave: g.clave,
      titulo: g.titulo,
      tipo: 'Carta',
      items: carta.filter((c) => c.categoria != null && g.categorias.includes(c.categoria)),
    };
  });

  return { gruposOpciones, gruposCarta };
}

/**
 * Compara de forma determinista si hubo cambios entre la selección original y la actual.
 */
export function hayCambios(
  original: Pick<SeleccionMenuDia, 'opciones' | 'productosCarta' | 'menusCompletos'>,
  actual: Pick<SeleccionMenuDia, 'opciones' | 'productosCarta' | 'menusCompletos'>
): boolean {
  const opOrig = normalizarIdsUnicos(original.opciones);
  const opAct = normalizarIdsUnicos(actual.opciones);
  if (opOrig.length !== opAct.length || opOrig.some((id, idx) => id !== opAct[idx])) {
    return true;
  }

  const cartaOrig = normalizarIdsUnicos(original.productosCarta);
  const cartaAct = normalizarIdsUnicos(actual.productosCarta);
  if (
    cartaOrig.length !== cartaAct.length ||
    cartaOrig.some((id, idx) => id !== cartaAct[idx])
  ) {
    return true;
  }

  const menusOrig = normalizarMenusUnicos(original.menusCompletos);
  const menusAct = normalizarMenusUnicos(actual.menusCompletos);
  if (
    menusOrig.length !== menusAct.length ||
    menusOrig.some((id, idx) => id !== menusAct[idx])
  ) {
    return true;
  }

  return false;
}

/**
 * Valida la selección del menú del día aplicando las reglas de negocio del backend:
 * - RV-162 (MSG-224): Debe existir al menos un plato de carta o un menú completo habilitado.
 * - RV-161 (MSG-219): Cada menú completo habilitado debe tener al menos una opción seleccionada en cada parte obligatoria.
 */
export function validarMenu(
  seleccion: Pick<SeleccionMenuDia, 'opciones' | 'productosCarta' | 'menusCompletos'> & {
    rolesPorOpcion?: Record<string, string>;
  },
  candidatos?: readonly CandidatoMenuDto[]
): ResultadoValidacionMenu {
  const errores: string[] = [];
  const erroresPorMenu: Record<number, string> = {};

  // RV-162 / MSG-224
  if (
    seleccion.productosCarta.length === 0 &&
    seleccion.menusCompletos.length === 0
  ) {
    errores.push(MSG_224);
  }

  // Mapa de roles por opción seleccionada
  const rolesMap: Record<string, string> = { ...(seleccion.rolesPorOpcion ?? {}) };
  if (candidatos) {
    for (const c of candidatos) {
      if (c.tipo === 'Componente' && c.rol) {
        rolesMap[c.id] = c.rol;
      }
    }
  }

  // RV-161 / MSG-219
  const menusOrdenados = normalizarMenusUnicos(seleccion.menusCompletos);
  for (const menuId of menusOrdenados) {
    const defMenu = CATALOGO_MENUS_COMPLETOS.find((m) => m.id === menuId);
    if (!defMenu) continue;

    for (const parte of defMenu.partes) {
      const tieneOpcionEnParte = seleccion.opciones.some((opId) => {
        const rol = rolesMap[opId];
        return Boolean(rol && parte.rolesPermitidos.includes(rol));
      });

      if (!tieneOpcionEnParte) {
        const msg = MSG_219(defMenu.nombre, parte.nombre);
        errores.push(msg);
        if (!erroresPorMenu[menuId]) {
          erroresPorMenu[menuId] = msg;
        }
        break;
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    mensaje: errores[0] ?? null,
    erroresPorMenu,
  };
}

/**
 * Construye el payload exacto para PUT /api/menu-dia/hoy según GuardarMenuDiaRequest.
 */
export function armarSolicitud(
  seleccion: Pick<SeleccionMenuDia, 'opciones' | 'productosCarta' | 'menusCompletos'>
): GuardarMenuDiaRequest {
  return {
    productosCarta: normalizarIdsUnicos(seleccion.productosCarta),
    opciones: normalizarIdsUnicos(seleccion.opciones),
    menusCompletos: normalizarMenusUnicos(seleccion.menusCompletos),
  };
}
