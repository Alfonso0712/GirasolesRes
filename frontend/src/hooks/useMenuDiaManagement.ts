import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserSession } from '../types/auth';
import type { MenuDiaResponse, CandidatoMenu } from '../types/menuDia';
import { menuDiaService } from '../services/menuDiaService';
import type { ApiClientError } from '../services/apiClient';

interface UseMenuDiaManagementProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export interface ItemDisponibilidad {
  productoId: string;
  nombre: string;
  tipo: 'Carta' | 'Componente';
  clasificacion: string; // Categoria (carta) o Rol (componente)
  precio?: number;
  agotado: boolean;
}

export const useMenuDiaManagement = ({ session, onLogout }: UseMenuDiaManagementProps) => {
  const [menu, setMenu] = useState<MenuDiaResponse | null>(null);
  const [candidatos, setCandidatos] = useState<CandidatoMenu[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Selecciones del formulario para Administrador (CUS05.1)
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState<Set<string>>(new Set());
  const [menusCompletosHabilitados, setMenusCompletosHabilitados] = useState<Set<number>>(new Set());
  const [platosCartaSeleccionados, setPlatosCartaSeleccionados] = useState<Set<string>>(new Set());

  // Estado original para detectar "Cambios sin guardar" (RV-48 / MSG-72)
  const initialSelectionRef = useRef<{
    opciones: Set<string>;
    menus: Set<number>;
    carta: Set<string>;
  }>({
    opciones: new Set(),
    menus: new Set(),
    carta: new Set()
  });

  // Banners y avisos
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [errorValidacionGuardar, setErrorValidacionGuardar] = useState<string | null>(null);

  // Ítem recientemente actualizado para resaltado visual breve
  const [platoResaltadoId, setPlatoResaltadoId] = useState<string | null>(null);

  // Modal de confirmación de disponibilidad (RV-49 / CUS05.2)
  const [dispModalOpen, setDispModalOpen] = useState(false);
  const [itemAConfirmar, setItemAConfirmar] = useState<ItemDisponibilidad | null>(null);
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
          const opcionesIds = new Set(menuRes.opciones?.map((o) => o.productoId) || []);
          const menusIds = new Set(menuRes.menusCompletos?.map((m) => m.id) || []);
          const cartaIds = new Set(menuRes.platos?.map((p) => p.productoId) || []);

          setOpcionesSeleccionadas(opcionesIds);
          setMenusCompletosHabilitados(menusIds);
          setPlatosCartaSeleccionados(cartaIds);

          initialSelectionRef.current = {
            opciones: new Set(opcionesIds),
            menus: new Set(menusIds),
            carta: new Set(cartaIds)
          };
        } else {
          setOpcionesSeleccionadas(new Set());
          // Por defecto, sugerir los 3 menús completos si es nuevo
          setMenusCompletosHabilitados(new Set([1, 2, 3]));
          setPlatosCartaSeleccionados(new Set());

          initialSelectionRef.current = {
            opciones: new Set(),
            menus: new Set(),
            carta: new Set()
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

  // RNF-14 / RNF-59: Refresco automático cada 30 segundos
  useEffect(() => {
    if (!tienePermiso) return;

    const interval = setInterval(() => {
      if (!guardando) {
        menuDiaService
          .obtenerMenuHoy(session.token)
          .then((res) => {
            setMenu(res);
          })
          .catch(() => {
            // Polling background silencioso
          });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tienePermiso, guardando, session.token]);

  // Cálculo de si hay cambios sin guardar (RV-48)
  const tieneCambiosSinGuardar = (() => {
    if (!esAdmin) return false;
    const init = initialSelectionRef.current;

    if (opcionesSeleccionadas.size !== init.opciones.size) return true;
    for (const id of opcionesSeleccionadas) {
      if (!init.opciones.has(id)) return true;
    }

    if (menusCompletosHabilitados.size !== init.menus.size) return true;
    for (const id of menusCompletosHabilitados) {
      if (!init.menus.has(id)) return true;
    }

    if (platosCartaSeleccionados.size !== init.carta.size) return true;
    for (const id of platosCartaSeleccionados) {
      if (!init.carta.has(id)) return true;
    }

    return false;
  })();

  // Handlers para Componentes (Opciones del día)
  const handleToggleOpcion = (productoId: string) => {
    setErrorValidacionGuardar(null);
    setOpcionesSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) {
        next.delete(productoId);
      } else {
        next.add(productoId);
      }
      return next;
    });
  };

  const handleSeleccionarVariosOpciones = (productoIds: string[]) => {
    setErrorValidacionGuardar(null);
    setOpcionesSeleccionadas((prev) => {
      const next = new Set(prev);
      productoIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDesmarcarVariosOpciones = (productoIds: string[]) => {
    setErrorValidacionGuardar(null);
    setOpcionesSeleccionadas((prev) => {
      const next = new Set(prev);
      productoIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // Handlers para Menús Completos
  const handleToggleMenuCompleto = (menuId: number) => {
    setErrorValidacionGuardar(null);
    setMenusCompletosHabilitados((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  // Handlers para Productos de Carta
  const handleTogglePlatoCarta = (productoId: string) => {
    setErrorValidacionGuardar(null);
    setPlatosCartaSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) {
        next.delete(productoId);
      } else {
        next.add(productoId);
      }
      return next;
    });
  };

  const handleSeleccionarVariosCarta = (productoIds: string[]) => {
    setErrorValidacionGuardar(null);
    setPlatosCartaSeleccionados((prev) => {
      const next = new Set(prev);
      productoIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDesmarcarVariosCarta = (productoIds: string[]) => {
    setErrorValidacionGuardar(null);
    setPlatosCartaSeleccionados((prev) => {
      const next = new Set(prev);
      productoIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // Descartar cambios pendientes
  const handleDescartarCambios = () => {
    setOpcionesSeleccionadas(new Set(initialSelectionRef.current.opciones));
    setMenusCompletosHabilitados(new Set(initialSelectionRef.current.menus));
    setPlatosCartaSeleccionados(new Set(initialSelectionRef.current.carta));
    setErrorValidacionGuardar(null);
    setDiscardModalOpen(false);
  };

  // Guardar menú del día con validaciones RV-161 y RV-162
  const handleGuardarMenu = async () => {
    setErrorValidacionGuardar(null);
    setAvisoError(null);

    // RV-162 / MSG-224: Para guardar el menú del día debe haber al menos un producto de carta o un menú completo habilitado
    if (platosCartaSeleccionados.size === 0 && menusCompletosHabilitados.size === 0) {
      setErrorValidacionGuardar(
        'Seleccione al menos un producto de carta o habilite un menú completo con sus opciones. (MSG-224)'
      );
      return;
    }

    // RV-161 / MSG-219: Validación de opciones por parte de cada menú habilitado
    const selectedComponentObjects = candidatos.filter(
      (c) => c.tipo === 'Componente' && opcionesSeleccionadas.has(c.id)
    );

    if (menusCompletosHabilitados.has(1)) {
      // Desayuno completo: Bebida + Plato
      const hasBebida = selectedComponentObjects.some((c) => c.rol === 'BebidaDesayuno');
      if (!hasBebida) {
        setErrorValidacionGuardar(
          'Desayuno completo necesita al menos una opción en "Bebida". Seleccione opciones o quite el menú de hoy. (MSG-219)'
        );
        return;
      }
      const hasPlato = selectedComponentObjects.some((c) => c.rol === 'PlatoDesayuno');
      if (!hasPlato) {
        setErrorValidacionGuardar(
          'Desayuno completo necesita al menos una opción en "Plato". Seleccione opciones o quite el menú de hoy. (MSG-219)'
        );
        return;
      }
    }

    if (menusCompletosHabilitados.has(2)) {
      // Almuerzo completo: Sopa o entrada + Segundo
      const hasSopaOEntrada = selectedComponentObjects.some(
        (c) => c.rol === 'Sopa' || c.rol === 'Entrada'
      );
      if (!hasSopaOEntrada) {
        setErrorValidacionGuardar(
          'Almuerzo completo necesita al menos una opción en "Sopa o entrada". Seleccione opciones o quite el menú de hoy. (MSG-219)'
        );
        return;
      }
      const hasSegundo = selectedComponentObjects.some((c) => c.rol === 'Segundo');
      if (!hasSegundo) {
        setErrorValidacionGuardar(
          'Almuerzo completo necesita al menos una opción en "Segundo". Seleccione opciones o quite el menú de hoy. (MSG-219)'
        );
        return;
      }
    }

    if (menusCompletosHabilitados.has(3)) {
      // Solo segundo: Segundo
      const hasSegundo = selectedComponentObjects.some((c) => c.rol === 'Segundo');
      if (!hasSegundo) {
        setErrorValidacionGuardar(
          'Solo segundo necesita al menos una opción en "Segundo". Seleccione opciones o quite el menú de hoy. (MSG-219)'
        );
        return;
      }
    }

    setGuardando(true);
    try {
      const res = await menuDiaService.guardarMenuHoy(
        {
          productosCarta: Array.from(platosCartaSeleccionados),
          opciones: Array.from(opcionesSeleccionadas),
          menusCompletos: Array.from(menusCompletosHabilitados)
        },
        session.token
      );

      setMenu(res.data);
      initialSelectionRef.current = {
        opciones: new Set(opcionesSeleccionadas),
        menus: new Set(menusCompletosHabilitados),
        carta: new Set(platosCartaSeleccionados)
      };

      setAvisoExito(res.message || 'Menú del día guardado correctamente. (MSG-70)');
    } catch (err) {
      handleApiError(err, 'No se pudo guardar el menú del día. Intente nuevamente. (MSG-38)');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de confirmación de disponibilidad (CUS05.2 / RV-49)
  const handleAbrirDisponibilidadModal = (item: ItemDisponibilidad) => {
    setItemAConfirmar(item);
    setNuevoEstadoAgotado(!item.agotado);
    setDispModalOpen(true);
  };

  // Confirmar cambio de disponibilidad
  const handleConfirmarDisponibilidad = async () => {
    if (!itemAConfirmar) return;

    setProcesandoDisp(true);
    setAvisoError(null);

    try {
      const res = await menuDiaService.cambiarDisponibilidad(
        itemAConfirmar.productoId,
        { agotado: nuevoEstadoAgotado },
        session.token
      );

      // Resaltar ítem temporalmente
      setPlatoResaltadoId(res.data.productoId);
      setTimeout(() => setPlatoResaltadoId(null), 3000);

      setAvisoExito(res.message);
      setDispModalOpen(false);
      setItemAConfirmar(null);

      // Recargar menú para reflejar disponibilidades y recalcular menús completos (RN-136)
      await cargarDatos(false);
    } catch (err) {
      handleApiError(err, 'No se pudo actualizar la disponibilidad. Intente nuevamente. (MSG-38)');
    } finally {
      setProcesandoDisp(false);
    }
  };

  return {
    menu,
    candidatos,
    cargando,
    guardando,
    errorCarga,
    cargarDatos,
    // Opciones del día
    opcionesSeleccionadas,
    handleToggleOpcion,
    handleSeleccionarVariosOpciones,
    handleDesmarcarVariosOpciones,
    // Menús completos
    menusCompletosHabilitados,
    handleToggleMenuCompleto,
    // Carta
    platosCartaSeleccionados,
    handleTogglePlatoCarta,
    handleSeleccionarVariosCarta,
    handleDesmarcarVariosCarta,
    // Guardar / Descartar
    handleGuardarMenu,
    handleDescartarCambios,
    tieneCambiosSinGuardar,
    errorValidacionGuardar,
    // Avisos
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    platoResaltadoId,
    // Modal Disponibilidad
    dispModalOpen,
    setDispModalOpen,
    itemAConfirmar,
    nuevoEstadoAgotado,
    procesandoDisp,
    handleAbrirDisponibilidadModal,
    handleConfirmarDisponibilidad,
    // Modal Descartar
    discardModalOpen,
    setDiscardModalOpen,
    // Permisos
    esAdmin,
    esCocinero,
    tienePermiso
  };
};
