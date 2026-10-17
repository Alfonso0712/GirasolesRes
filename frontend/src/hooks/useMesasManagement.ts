import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { UserSession } from '../types/auth';
import type { MesaItem, FiltroEstadoMesa } from '../types/mesa';
import {
  getMesasService,
  crearMesaService,
  actualizarMesaService,
  cambiarEstadoMesaService
} from '../services/mesaService';
import { naturalCompare } from '../utils/naturalSort';

interface UseMesasManagementProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export function useMesasManagement({ session, onLogout }: UseMesasManagementProps) {
  // Lista de mesas cargadas
  const [mesas, setMesas] = useState<MesaItem[]>([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoMesa>('todas');
  const [mostrarInactivas, setMostrarInactivas] = useState<boolean>(false);

  // Estados de carga y error
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // RNF-17: Contador de segundos transcurridos desde la última actualización
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  const [segundosTranscurridos, setSegundosTranscurridos] = useState<number>(0);

  // Avisos y retroalimentación (Shneiderman 3 / 4 segundos)
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [mesaResaltadaId, setMesaResaltadaId] = useState<string | null>(null);

  // Modales
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [formModo, setFormModo] = useState<'crear' | 'editar'>('crear');
  const [mesaAEditar, setMesaAEditar] = useState<MesaItem | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [confirmAccion, setConfirmAccion] = useState<'activar' | 'desactivar'>('desactivar');
  const [mesaAConfirmar, setMesaAConfirmar] = useState<MesaItem | null>(null);
  const [procesandoConfirm, setProcesandoConfirm] = useState<boolean>(false);

  // Referencia para retorno de foco accesible (RV-57)
  const botonOrigenRef = useRef<HTMLElement | null>(null);

  const esAdmin = session.rol === 'Administrador';
  const esMozo = session.rol === 'Mozo';
  const esCajero = session.rol === 'Cajero';

  // Temporizador para auto-ocultar avisos (4s)
  useEffect(() => {
    if (avisoExito) {
      const timer = setTimeout(() => setAvisoExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [avisoExito]);

  useEffect(() => {
    if (avisoError) {
      const timer = setTimeout(() => setAvisoError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [avisoError]);

  useEffect(() => {
    if (mesaResaltadaId) {
      const timer = setTimeout(() => setMesaResaltadaId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mesaResaltadaId]);

  // Contador de segundos transcurridos (Actualizado hace X s)
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - ultimaActualizacion.getTime()) / 1000);
      setSegundosTranscurridos(diff >= 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [ultimaActualizacion]);

  // Carga de mesas
  const cargarMesas = useCallback(
    async (silencioso = false) => {
      if (!silencioso) {
        if (mesas.length === 0) setCargando(true);
        else setRefrescando(true);
      }
      setErrorCarga(null);

      try {
        const data = await getMesasService(
          {
            incluirInactivas: esAdmin ? mostrarInactivas : false
          },
          session.token
        );

        // Orden natural garantizado en frontend (CUS06.2)
        const ordenadas = [...data].sort((a, b) => naturalCompare(a.nombre, b.nombre));
        setMesas(ordenadas);
        setUltimaActualizacion(new Date());
        setSegundosTranscurridos(0);
      } catch (err: any) {
        if (err?.status === 401) {
          onLogout?.({
            type: 'warning',
            message: 'Su sesión expiró. Ingrese nuevamente.'
          });
          return;
        }

        // Si ya hay mesas cargadas, se mantienen visibles con aviso de antigüedad (MSG-94)
        setErrorCarga('No se pudieron cargar las mesas. Intente nuevamente.');
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [esAdmin, mostrarInactivas, session.token, onLogout, mesas.length]
  );

  // Carga inicial y al cambiar mostrarInactivas
  useEffect(() => {
    cargarMesas();
  }, [mostrarInactivas]);

  // RNF-17: Refresco automático cada 15 segundos y al volver el foco a la ventana
  useEffect(() => {
    const interval = setInterval(() => {
      cargarMesas(true);
    }, 15000);

    const handleFocus = () => {
      cargarMesas(true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [cargarMesas]);

  // Cálculo del resumen en tiempo real (Libres X · Ocupadas Y)
  const resumen = useMemo(() => {
    const activas = mesas.filter((m) => m.activa);
    const libres = activas.filter((m) => m.ocupacion === 'Libre').length;
    const ocupadas = activas.filter((m) => m.ocupacion === 'Ocupada').length;
    const inactivas = mesas.filter((m) => !m.activa).length;
    return {
      total: mesas.length,
      libres,
      ocupadas,
      inactivas
    };
  }, [mesas]);

  // RV-59: Filtrado por estado en memoria sin recargar página
  const mesasFiltradas = useMemo(() => {
    return mesas.filter((m) => {
      if (filtroEstado === 'libre') return m.ocupacion === 'Libre';
      if (filtroEstado === 'ocupada') return m.ocupacion === 'Ocupada';
      return true; // 'todas'
    });
  }, [mesas, filtroEstado]);

  // Manejadores de modales de formulario
  const handleAbrirCrear = (e?: React.MouseEvent) => {
    botonOrigenRef.current = (e?.currentTarget as HTMLElement) || null;
    setFormModo('crear');
    setMesaAEditar(null);
    setFormModalOpen(true);
  };

  const handleAbrirEditar = (mesa: MesaItem, e?: React.MouseEvent) => {
    botonOrigenRef.current = (e?.currentTarget as HTMLElement) || null;
    setFormModo('editar');
    setMesaAEditar(mesa);
    setFormModalOpen(true);
  };

  const handleCerrarForm = () => {
    setFormModalOpen(false);
    setMesaAEditar(null);
    botonOrigenRef.current?.focus?.();
  };

  const handleGuardarMesa = async (nombreLimpio: string) => {
    try {
      if (formModo === 'crear') {
        const resp = await crearMesaService({ nombre: nombreLimpio }, session.token);
        setAvisoExito('Mesa registrada correctamente.'); // MSG-84
        setMesaResaltadaId(resp.id);
      } else if (mesaAEditar) {
        const resp = await actualizarMesaService(mesaAEditar.id, { nombre: nombreLimpio }, session.token);
        setAvisoExito('Mesa actualizada correctamente.'); // MSG-85
        setMesaResaltadaId(resp.id);
      }
      handleCerrarForm();
      await cargarMesas(true);
    } catch (err: any) {
      if (err?.status === 401) {
        onLogout?.({
          type: 'warning',
          message: 'Su sesión expiró. Ingrese nuevamente.'
        });
        return;
      }
      throw err;
    }
  };

  // Manejadores de modal de activación / desactivación
  const handleAbrirConfirmacionEstado = (
    mesa: MesaItem,
    accion: 'activar' | 'desactivar',
    e?: React.MouseEvent
  ) => {
    botonOrigenRef.current = (e?.currentTarget as HTMLElement) || null;
    setMesaAConfirmar(mesa);
    setConfirmAccion(accion);
    setConfirmModalOpen(true);
  };

  const handleCerrarConfirm = () => {
    setConfirmModalOpen(false);
    setMesaAConfirmar(null);
    botonOrigenRef.current?.focus?.();
  };

  const handleConfirmarCambioEstado = async () => {
    if (!mesaAConfirmar) return;

    setProcesandoConfirm(true);
    try {
      const nuevoEstadoActiva = confirmAccion === 'activar';
      await cambiarEstadoMesaService(mesaAConfirmar.id, nuevoEstadoActiva, session.token);

      const msg = nuevoEstadoActiva ? 'Mesa activada.' : 'Mesa desactivada.'; // MSG-90 / MSG-89
      setAvisoExito(msg);
      setMesaResaltadaId(mesaAConfirmar.id);
      handleCerrarConfirm();
      await cargarMesas(true);
    } catch (err: any) {
      if (err?.status === 401) {
        onLogout?.({
          type: 'warning',
          message: 'Su sesión expiró. Ingrese nuevamente.'
        });
        return;
      }
      setAvisoError(err.message || 'No se pudo completar la operación. Intente nuevamente.');
    } finally {
      setProcesandoConfirm(false);
    }
  };

  return {
    mesas: mesasFiltradas,
    todasLasMesas: mesas,
    resumen,
    filtroEstado,
    setFiltroEstado,
    mostrarInactivas,
    setMostrarInactivas,
    cargando,
    refrescando,
    errorCarga,
    segundosTranscurridos,
    avisoExito,
    avisoError,
    mesaResaltadaId,
    setAvisoError,
    cargarMesas,
    // Permisos
    esAdmin,
    esMozo,
    esCajero,
    // Form Modal
    formModalOpen,
    formModo,
    mesaAEditar,
    handleAbrirCrear,
    handleAbrirEditar,
    handleCerrarForm,
    handleGuardarMesa,
    // Confirm Modal
    confirmModalOpen,
    confirmAccion,
    mesaAConfirmar,
    procesandoConfirm,
    handleAbrirConfirmacionEstado,
    handleCerrarConfirm,
    handleConfirmarCambioEstado
  };
}
