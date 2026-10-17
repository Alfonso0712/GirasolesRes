import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserSession } from '../types/auth';
import type { MenuDiaResponse, CandidatoMenu, PlatoMenu } from '../types/menuDia';
import { menuDiaService } from '../services/menuDiaService';
import type { ApiClientError } from '../services/apiClient';

interface UseMenuDiaManagementProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export const useMenuDiaManagement = ({ session, onLogout }: UseMenuDiaManagementProps) => {
  const [menu, setMenu] = useState<MenuDiaResponse | null>(null);
  const [candidatos, setCandidatos] = useState<CandidatoMenu[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Selecciones del formulario para Administrador
  const [desayunoSeleccionado, setDesayunoSeleccionado] = useState<string | null>(null);
  const [platosSeleccionados, setPlatosSeleccionados] = useState<Set<string>>(new Set());

  // Estado original para detectar "Cambios sin guardar" (RV-48)
  const initialSelectionRef = useRef<{ desayunoId: string | null; platoIds: Set<string> }>({
    desayunoId: null,
    platoIds: new Set()
  });

  // Banners y avisos
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [errorValidacionGuardar, setErrorValidacionGuardar] = useState<string | null>(null);

  // Plato recientemente actualizado para resaltado visual breve
  const [platoResaltadoId, setPlatoResaltadoId] = useState<string | null>(null);

  // Modal de confirmación de disponibilidad (RV-49)
  const [dispModalOpen, setDispModalOpen] = useState(false);
  const [platoAConfirmar, setPlatoAConfirmar] = useState<PlatoMenu | null>(null);
  const [nuevoEstadoAgotado, setNuevoEstadoAgotado] = useState(false);
  const [procesandoDisp, setProcesandoDisp] = useState(false);

  // Modal de descarte de cambios (RV-48)
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  const esAdmin = session.rol === 'Administrador';
  const esCocinero = session.rol === 'Cocinero';
  const tienePermiso = esAdmin || esCocinero;

  // Auto-cierre de toasts de éxito en 4 segundos (RV-28 / MSG-70, 76, 77)
  useEffect(() => {
    if (avisoExito) {
      const timer = setTimeout(() => setAvisoExito(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [avisoExito]);

  // Manejo de errores 401
  const handleApiError = useCallback(
    (err: unknown, defaultMessage: string) => {
      const apiErr = err as ApiClientError;
      if (apiErr.status === 401 && onLogout) {
        onLogout({
          type: 'warning',
          message: 'Su sesión expiró. Ingrese nuevamente.'
        });
        return;
      }
      setAvisoError(apiErr.message || defaultMessage);
    },
    [onLogout]
  );

  // Cargar datos principales
  const cargarDatos = useCallback(
    async (mostrarSpinner = true) => {
      if (!tienePermiso) return;

      if (mostrarSpinner) setCargando(true);
      setErrorCarga(null);

      try {
        const [menuRes, candidatosRes] = await Promise.all([
          menuDiaService.obtenerMenuHoy(session.token),
          esAdmin ? menuDiaService.obtenerCandidatos(session.token) : Promise.resolve([])
        ]);

        setMenu(menuRes);
        if (esAdmin) {
          setCandidatos(candidatosRes);
        }

        // Si el menú ya está definido, sincronizar el formulario con lo guardado
        if (menuRes.definido) {
          const desayunoId = menuRes.desayuno ? menuRes.desayuno.id : null;
          const platoIds = new Set(menuRes.platos.map((p) => p.productoId));

          setDesayunoSeleccionado(desayunoId);
          setPlatosSeleccionados(platoIds);

          initialSelectionRef.current = {
            desayunoId,
            platoIds: new Set(platoIds)
          };
        } else {
          setDesayunoSeleccionado(null);
          setPlatosSeleccionados(new Set());
          initialSelectionRef.current = {
            desayunoId: null,
            platoIds: new Set()
          };
        }
      } catch (err) {
        const apiErr = err as ApiClientError;
        if (apiErr.status === 401 && onLogout) {
          onLogout({
            type: 'warning',
            message: 'Su sesión expiró. Ingrese nuevamente.'
          });
          return;
        }
        setErrorCarga('No se pudo cargar el menú del día. Intente nuevamente. (MSG-80)');
      } finally {
        if (mostrarSpinner) setCargando(false);
      }
    },
    [tienePermiso, esAdmin, session.token, onLogout]
  );

  useEffect(() => {
    cargarDatos(true);
  }, [cargarDatos]);

  // RNF-14: Refresco automático cada 30 segundos
  useEffect(() => {
    if (!tienePermiso) return;

    const interval = setInterval(() => {
      // Solo refresca si no se está guardando activamente
      if (!guardando) {
        menuDiaService
          .obtenerMenuHoy(session.token)
          .then((res) => {
            setMenu(res);
          })
          .catch(() => {
            // Error silencioso en background polling
          });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tienePermiso, guardando, session.token]);

  // Cálculo de si hay cambios sin guardar
  const tieneCambiosSinGuardar = (() => {
    if (!esAdmin) return false;
    const init = initialSelectionRef.current;
    if (desayunoSeleccionado !== init.desayunoId) return true;
    if (platosSeleccionados.size !== init.platoIds.size) return true;
    for (const id of platosSeleccionados) {
      if (!init.platoIds.has(id)) return true;
    }
    return false;
  })();

  // Toggle de plato en selección múltiple
  const handleTogglePlato = (productoId: string) => {
    setErrorValidacionGuardar(null);
    setPlatosSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) {
        next.delete(productoId);
      } else {
        next.add(productoId);
      }
      return next;
    });
  };

  // Selección única de desayuno
  const handleSeleccionarDesayuno = (desayunoId: string | null) => {
    setErrorValidacionGuardar(null);
    setDesayunoSeleccionado(desayunoId);
  };

  // Guardar menú del día (RV-43, RV-47)
  const handleGuardarMenu = async () => {
    setErrorValidacionGuardar(null);
    setAvisoError(null);

    // RV-43: Al menos un producto seleccionado
    const totalSeleccionados = (desayunoSeleccionado ? 1 : 0) + platosSeleccionados.size;
    if (totalSeleccionados === 0) {
      setErrorValidacionGuardar('Seleccione al menos un producto para el menú de hoy. (MSG-68)');
      return;
    }

    setGuardando(true);
    try {
      const res = await menuDiaService.guardarMenuHoy(
        {
          desayunoId: desayunoSeleccionado,
          platoIds: Array.from(platosSeleccionados)
        },
        session.token
      );

      setMenu(res.data);
      initialSelectionRef.current = {
        desayunoId: desayunoSeleccionado,
        platoIds: new Set(platosSeleccionados)
      };

      setAvisoExito(res.message || 'Menú del día guardado correctamente. (MSG-70)');
    } catch (err) {
      handleApiError(err, 'No se pudo guardar el menú del día. Intente nuevamente. (MSG-38)');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de confirmación de disponibilidad (RV-49)
  const handleAbrirDisponibilidadModal = (plato: PlatoMenu) => {
    setPlatoAConfirmar(plato);
    setNuevoEstadoAgotado(!plato.agotado);
    setDispModalOpen(true);
  };

  // Confirmar cambio de disponibilidad
  const handleConfirmarDisponibilidad = async () => {
    if (!platoAConfirmar) return;

    setProcesandoDisp(true);
    setAvisoError(null);

    try {
      const res = await menuDiaService.cambiarDisponibilidad(
        platoAConfirmar.productoId,
        { agotado: nuevoEstadoAgotado },
        session.token
      );

      // Actualizar estado local inmediatamente
      setMenu((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          platos: prev.platos.map((p) =>
            p.productoId === platoAConfirmar.productoId
              ? { ...p, agotado: nuevoEstadoAgotado }
              : p
          )
        };
      });

      setPlatoResaltadoId(platoAConfirmar.productoId);
      setTimeout(() => setPlatoResaltadoId(null), 3000);

      setAvisoExito(res.message);
      setDispModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Error al actualizar la disponibilidad del plato.');
    } finally {
      setProcesandoDisp(false);
    }
  };

  // Descartar cambios sin guardar (RV-48)
  const handleDescartarCambios = () => {
    const init = initialSelectionRef.current;
    setDesayunoSeleccionado(init.desayunoId);
    setPlatosSeleccionados(new Set(init.platoIds));
    setErrorValidacionGuardar(null);
    setDiscardModalOpen(false);
  };

  return {
    menu,
    candidatos,
    cargando,
    guardando,
    errorCarga,
    cargarDatos,
    desayunoSeleccionado,
    platosSeleccionados,
    handleTogglePlato,
    handleSeleccionarDesayuno,
    handleGuardarMenu,
    tieneCambiosSinGuardar,
    errorValidacionGuardar,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    platoResaltadoId,
    // Modal Disponibilidad
    dispModalOpen,
    setDispModalOpen,
    platoAConfirmar,
    nuevoEstadoAgotado,
    procesandoDisp,
    handleAbrirDisponibilidadModal,
    handleConfirmarDisponibilidad,
    // Modal Descartar
    discardModalOpen,
    setDiscardModalOpen,
    handleDescartarCambios,
    // Permisos
    esAdmin,
    esCocinero,
    tienePermiso
  };
};
