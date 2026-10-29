import { useState, useEffect, useRef, useCallback } from 'react';
import { inicioService } from '../services/inicioService';
import { CONNECTION_ERROR_MESSAGE, validateJwtToken } from '../services/apiClient';
import type { InicioDashboardData } from '../types/inicio';

interface UseInicioDashboardOptions {
  token: string;
  rol: string;
}

export function useInicioDashboard({ token, rol }: UseInicioDashboardOptions) {
  const [data, setData] = useState<InicioDashboardData | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
  const [actualizando, setActualizando] = useState<boolean>(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState<number>(0);
  const [sinConexion, setSinConexion] = useState<boolean>(false);
  const [reintentandoBloque, setReintentandoBloque] = useState<Record<string, boolean>>({});

  const enVueloRef = useRef<boolean>(false);
  const tieneDatosRef = useRef<boolean>(false);
  const ultimaActualizacionRef = useRef<number>(Date.now());
  const tokenRef = useRef<string>(token);
  tokenRef.current = token;

  // Intervalo según rol: 30s para Administrador, 15s para otros roles (RV-148, RNF-57)
  const intervaloSegundos = rol === 'Administrador' ? 30 : 15;

  const ejecutarCarga = useCallback(async () => {
    const currentToken = tokenRef.current;
    if (!currentToken || !validateJwtToken(currentToken, 0).valid) return;
    if (enVueloRef.current) return;

    enVueloRef.current = true;
    if (!tieneDatosRef.current) {
      setCargandoInicial(true);
    } else {
      setActualizando(true);
    }

    try {
      const res = await inicioService.obtenerInicio(currentToken);
      setData(res);
      tieneDatosRef.current = true;
      setErrorGeneral(null);
      setSinConexion(false);
      ultimaActualizacionRef.current = Date.now();
      setSegundosDesdeActualizacion(0);
    } catch (err: any) {
      if (err?.status === 401) {
        return;
      }
      console.error('Error al cargar dashboard de inicio:', err);
      if (!tieneDatosRef.current) {
        setErrorGeneral(
          err?.isConnectionError
            ? CONNECTION_ERROR_MESSAGE
            : err?.message || CONNECTION_ERROR_MESSAGE
        );
      } else {
        setSinConexion(true);
      }
    } finally {
      enVueloRef.current = false;
      setCargandoInicial(false);
      setActualizando(false);
    }
  }, []);

  // Reintentar solo un bloque específico (RV-149, RNF-55)
  const reintentarBloque = useCallback(async (nombreBloque: string) => {
    const currentToken = tokenRef.current;
    if (!currentToken) return;
    setReintentandoBloque(prev => ({ ...prev, [nombreBloque]: true }));

    try {
      const res = await inicioService.obtenerBloque(nombreBloque, currentToken);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          bloques: {
            ...prev.bloques,
            [nombreBloque]: res
          }
        };
      });
    } catch (err) {
      console.error(`Error al reintentar bloque ${nombreBloque}:`, err);
    } finally {
      setReintentandoBloque(prev => ({ ...prev, [nombreBloque]: false }));
    }
  }, []);

  // Referencia a ejecutarCarga para usar en timers sin recrearlos
  const ejecutarCargaRef = useRef(ejecutarCarga);
  useEffect(() => {
    ejecutarCargaRef.current = ejecutarCarga;
  }, [ejecutarCarga]);

  // Ciclo de vida y temporizadores de polling (RV-148, RNF-57)
  useEffect(() => {
    // 1. Carga inicial inmediata
    ejecutarCargaRef.current();

    // 2. Contador de segundos de antigüedad (cada 1s)
    const contadorInterval = setInterval(() => {
      const segs = Math.floor((Date.now() - ultimaActualizacionRef.current) / 1000);
      setSegundosDesdeActualizacion(segs);
    }, 1000);

    // 3. Polling automático periódico (30s admin / 15s otros)
    const pollingInterval = setInterval(() => {
      // RNF-57: Pausar si la pestaña no está visible
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        ejecutarCargaRef.current();
      }
    }, intervaloSegundos * 1000);

    // 4. Pausar y reanudar con visibilidad de pestaña (RNF-57, E-369)
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        // Al regresar a la pestaña, refresca si pasaron más de 5 segundos desde la última actualización
        const transcurrido = (Date.now() - ultimaActualizacionRef.current) / 1000;
        if (transcurrido >= 5) {
          ejecutarCargaRef.current();
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(contadorInterval);
      clearInterval(pollingInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [intervaloSegundos]);

  return {
    data,
    cargandoInicial,
    actualizando,
    errorGeneral,
    segundosDesdeActualizacion,
    sinConexion,
    reintentandoBloque,
    refrescarManual: () => ejecutarCarga(),
    reintentarBloque
  };
}
