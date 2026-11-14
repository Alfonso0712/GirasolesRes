import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRecurso } from './useRecurso';
import { menuDiaService } from '../services/menuDiaService';
import type {
  MenuDiaResponseDto,
  CandidatoMenuDto,
} from '../types/menuDia';
import {
  construirSeleccion,
  alternarOpcion,
  alternarGrupo,
  alternarMenuCompleto,
  hayCambios,
  validarMenu,
  armarSolicitud,
  agruparCandidatos,
  type SeleccionMenuDia,
  type ResultadoValidacionMenu,
  type GrupoCandidatos,
} from '../utils/menuDia';

export interface DatosEdicionMenuDia {
  hoy: MenuDiaResponseDto;
  candidatos: CandidatoMenuDto[];
}

export interface UseMenuDiaEdicionOptions {
  enabled?: boolean;
}

export interface ResultadoGuardarMenu {
  exito: boolean;
  mensaje: string;
  data?: MenuDiaResponseDto;
}

export interface UseMenuDiaEdicionReturn {
  hoy: MenuDiaResponseDto | null;
  candidatos: CandidatoMenuDto[];
  gruposOpciones: GrupoCandidatos[];
  gruposCarta: GrupoCandidatos[];
  original: SeleccionMenuDia;
  actual: SeleccionMenuDia;
  agotadosPorId: Record<string, boolean>;
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  errorValidacion: string | null;
  tieneCambios: boolean;
  validacion: ResultadoValidacionMenu;
  toggleOpcion: (
    productoId: string,
    tipo?: 'Componente' | 'Carta',
    rol?: string | null
  ) => void;
  toggleGrupo: (
    grupo: readonly (string | CandidatoMenuDto)[],
    tipo?: 'Componente' | 'Carta'
  ) => void;
  toggleMenuCompleto: (menuId: number) => void;
  descartarCambios: () => void;
  limpiarErrorValidacion: () => void;
  recargar: () => Promise<void>;
  guardar: () => Promise<ResultadoGuardarMenu>;
}

const SELECCION_VACIA: SeleccionMenuDia = {
  opciones: [],
  productosCarta: [],
  menusCompletos: [],
  rolesPorOpcion: {},
  tiposPorId: {},
};

/**
 * Hook de edición del menú del día.
 * Carga el estado de hoy y los candidatos activos usando useRecurso sin sondeo periódico (polling),
 * conserva la selección original y la actual, y expone la acción guardar() validada.
 */
export function useMenuDiaEdicion(
  options?: UseMenuDiaEdicionOptions
): UseMenuDiaEdicionReturn {
  const enabled = options?.enabled ?? true;

  const fetcher = useCallback(async (): Promise<DatosEdicionMenuDia> => {
    const [hoy, candidatos] = await Promise.all([
      menuDiaService.obtenerMenuHoy(),
      menuDiaService.obtenerCandidatos(),
    ]);
    return {
      hoy,
      candidatos: Array.isArray(candidatos) ? candidatos : [],
    };
  }, []);

  const { datos, cargando, error, recargar, setDatos } = useRecurso<DatosEdicionMenuDia>(
    fetcher,
    {
      pausarEnSegundoPlano: true,
      enabled,
    }
  );

  const [original, setOriginal] = useState<SeleccionMenuDia>(SELECCION_VACIA);
  const [actual, setActual] = useState<SeleccionMenuDia>(SELECCION_VACIA);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  useEffect(() => {
    if (!datos) return;
    const sel = construirSeleccion(datos.hoy, datos.candidatos);
    setOriginal(sel);
    setActual(sel);
    setErrorValidacion(null);
  }, [datos]);

  const candidatos = useMemo(() => datos?.candidatos ?? [], [datos]);
  const hoy = datos?.hoy ?? null;

  const { gruposOpciones, gruposCarta } = useMemo(
    () => agruparCandidatos(candidatos),
    [candidatos]
  );

  const agotadosPorId = useMemo(() => {
    const mapa: Record<string, boolean> = {};
    for (const pl of hoy?.platos ?? []) {
      if (pl.agotado) mapa[pl.productoId] = true;
    }
    for (const op of hoy?.opciones ?? []) {
      if (op.agotado) mapa[op.productoId] = true;
    }
    return mapa;
  }, [hoy]);

  const tieneCambios = useMemo(
    () => hayCambios(original, actual),
    [original, actual]
  );

  const validacion = useMemo(
    () => validarMenu(actual, candidatos),
    [actual, candidatos]
  );

  const toggleOpcion = useCallback(
    (productoId: string, tipo?: 'Componente' | 'Carta', rol?: string | null) => {
      setErrorValidacion(null);
      setActual((prev) => alternarOpcion(prev, productoId, tipo, rol));
    },
    []
  );

  const toggleGrupo = useCallback(
    (grupo: readonly (string | CandidatoMenuDto)[], tipo?: 'Componente' | 'Carta') => {
      setErrorValidacion(null);
      setActual((prev) => alternarGrupo(prev, grupo, tipo));
    },
    []
  );

  const toggleMenuCompleto = useCallback((menuId: number) => {
    setErrorValidacion(null);
    setActual((prev) => alternarMenuCompleto(prev, menuId));
  }, []);

  const descartarCambios = useCallback(() => {
    setActual(original);
    setErrorValidacion(null);
  }, [original]);

  const limpiarErrorValidacion = useCallback(() => {
    setErrorValidacion(null);
  }, []);

  const guardar = useCallback(async (): Promise<ResultadoGuardarMenu> => {
    const val = validarMenu(actual, candidatos);
    if (!val.valido) {
      const msg = val.mensaje ?? 'Verifique las opciones seleccionadas antes de guardar.';
      setErrorValidacion(msg);
      return { exito: false, mensaje: msg };
    }

    setGuardando(true);
    setErrorValidacion(null);
    try {
      const payload = armarSolicitud(actual);
      const res = await menuDiaService.guardarMenuHoy(payload);
      const nuevoHoy = res.data;

      if (nuevoHoy) {
        setDatos((prev) =>
          prev
            ? { ...prev, hoy: nuevoHoy }
            : { hoy: nuevoHoy, candidatos }
        );
        const nuevaSel = construirSeleccion(nuevoHoy, candidatos);
        setOriginal(nuevaSel);
        setActual(nuevaSel);
      }

      const mensajeExito = res.message || 'Menú del día guardado correctamente.';
      return {
        exito: true,
        mensaje: mensajeExito,
        data: nuevoHoy,
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el menú del día.';
      setErrorValidacion(msg);
      return {
        exito: false,
        mensaje: msg,
      };
    } finally {
      setGuardando(false);
    }
  }, [actual, candidatos, setDatos]);

  return {
    hoy,
    candidatos,
    gruposOpciones,
    gruposCarta,
    original,
    actual,
    agotadosPorId,
    cargando,
    guardando,
    error,
    errorValidacion,
    tieneCambios,
    validacion,
    toggleOpcion,
    toggleGrupo,
    toggleMenuCompleto,
    descartarCambios,
    limpiarErrorValidacion,
    recargar,
    guardar,
  };
}
