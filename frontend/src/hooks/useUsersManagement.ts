import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserSession } from '../types/auth';
import type {
  UsuarioItem,
  CrearUsuarioData,
  ActualizarUsuarioData
} from '../types/usuario';
import {
  getUsuariosService,
  crearUsuarioService,
  actualizarUsuarioService,
  cambiarEstadoUsuarioService,
  eliminarUsuarioService
} from '../services/usuarioService';
import type { TipoConfirmacion } from '../components/ui';

interface UseUsersManagementProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export function useUsersManagement({ session, onLogout }: UseUsersManagementProps) {
  // Estado de lista y paginación
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const tamano = 10;

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Avisos y alertas
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [usuarioResaltadoId, setUsuarioResaltadoId] = useState<string | null>(null);

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<UsuarioItem | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTipo, setConfirmTipo] = useState<TipoConfirmacion>('desactivar');
  const [usuarioAConfirmar, setUsuarioAConfirmar] = useState<UsuarioItem | null>(null);
  const [procesandoConfirm, setProcesandoConfirm] = useState(false);
  const [confirmErrorMovimientos, setConfirmErrorMovimientos] = useState(false);

  // Referencias para retorno de foco accesible (RV-20)
  const botonOrigenRef = useRef<HTMLButtonElement | null>(null);

  // RN-07: Validación de rol Administrador
  const esAdmin = session.rol === 'Administrador';

  // Temporizador para auto-ocultar avisos (4 segundos)
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
    if (usuarioResaltadoId) {
      const timer = setTimeout(() => setUsuarioResaltadoId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [usuarioResaltadoId]);

  // Detección y cierre automático de sesión por 401 / token expirado (CUS01.1 / RN-12)
  const esErrorSesionVencida = useCallback((err: any): boolean => {
    if (!err) return false;
    if (err.status === 401) return true;
    const msg = String(err.message || '').toLowerCase();
    return (
      msg.includes('sesión') ||
      msg.includes('sesion') ||
      msg.includes('vencida') ||
      msg.includes('expir') ||
      msg.includes('unauthorized') ||
      msg.includes('no autorizado') ||
      msg.includes('token')
    );
  }, []);

  const dispararLogoutPorSesionExpirada = useCallback(() => {
    if (onLogout) {
      onLogout({
        type: 'warning',
        message: 'Su sesión expiró. Ingrese nuevamente.'
      });
    } else {
      localStorage.removeItem('girasoles_session');
      window.location.reload();
    }
  }, [onLogout]);

  // Cargar usuarios desde la API
  const cargarUsuarios = useCallback(async () => {
    if (!esAdmin) return;
    setCargando(true);
    setErrorCarga(null);

    try {
      const estadoParam =
        filtroEstado === 'Todos' ? null : filtroEstado === 'Activo';

      const data = await getUsuariosService(
        {
          busqueda: busqueda.trim() || undefined,
          rol: filtroRol !== 'Todos' ? filtroRol : undefined,
          estado: estadoParam,
          pagina,
          tamano
        },
        session.token
      );

      setUsuarios(data.items);
      setTotal(data.total);
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        dispararLogoutPorSesionExpirada();
        return;
      }
      setErrorCarga(err.message || 'No se pudo cargar la lista de usuarios. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroRol, filtroEstado, pagina, tamano, session.token, esAdmin, esErrorSesionVencida, dispararLogoutPorSesionExpirada]);

  // RV-22: Búsqueda con debounce de 300 ms
  useEffect(() => {
    const handler = setTimeout(() => {
      cargarUsuarios();
    }, 300);

    return () => clearTimeout(handler);
  }, [busqueda, filtroRol, filtroEstado, pagina, cargarUsuarios]);

  // Quitar todos los filtros
  const handleQuitarFiltros = () => {
    setBusqueda('');
    setFiltroRol('Todos');
    setFiltroEstado('Todos');
    setPagina(1);
  };

  // Abrir modal de creación
  const handleAbrirNuevo = (e: React.MouseEvent<HTMLButtonElement>) => {
    botonOrigenRef.current = e.currentTarget;
    setUsuarioAEditar(null);
    setFormModalOpen(true);
  };

  // Abrir modal de edición
  const handleAbrirEditar = (u: UsuarioItem, e: React.MouseEvent<HTMLButtonElement>) => {
    botonOrigenRef.current = e.currentTarget;
    setUsuarioAEditar(u);
    setFormModalOpen(true);
  };

  // Guardar usuario (Creación / Edición)
  const handleGuardarUsuario = async (
    data: CrearUsuarioData | ActualizarUsuarioData,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && usuarioAEditar) {
        const res = await actualizarUsuarioService(
          usuarioAEditar.id,
          data as ActualizarUsuarioData,
          session.token
        );
        setAvisoExito(res.message); // MSG-26
        setUsuarioResaltadoId(usuarioAEditar.id);
      } else {
        const res = await crearUsuarioService(
          data as CrearUsuarioData,
          session.token
        );
        setAvisoExito(res.message); // MSG-25
        if (res.user?.id) {
          setUsuarioResaltadoId(res.user.id);
        }
      }
      await cargarUsuarios();
      botonOrigenRef.current?.focus();
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        setFormModalOpen(false);
        dispararLogoutPorSesionExpirada();
        return;
      }
      throw err;
    }
  };

  // Abrir confirmación de estado o eliminación
  const handleAbrirConfirmacion = (
    u: UsuarioItem,
    tipo: TipoConfirmacion,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    botonOrigenRef.current = e.currentTarget;
    setUsuarioAConfirmar(u);
    setConfirmTipo(tipo);
    setConfirmErrorMovimientos(false);
    setConfirmModalOpen(true);
  };

  // Ejecutar confirmación
  const handleConfirmarAccion = async () => {
    if (!usuarioAConfirmar) return;
    setProcesandoConfirm(true);
    setAvisoError(null);

    try {
      if (confirmTipo === 'eliminar') {
        const msg = await eliminarUsuarioService(usuarioAConfirmar.id, session.token);
        setAvisoExito(msg); // MSG-35
        setConfirmModalOpen(false);
      } else {
        const nuevoEstado = confirmTipo === 'activar';
        const res = await cambiarEstadoUsuarioService(
          usuarioAConfirmar.id,
          nuevoEstado,
          session.token
        );
        setAvisoExito(res.message); // MSG-29 o MSG-30
        setUsuarioResaltadoId(usuarioAConfirmar.id);
        setConfirmModalOpen(false);
      }
      await cargarUsuarios();
      botonOrigenRef.current?.focus();
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        setConfirmModalOpen(false);
        dispararLogoutPorSesionExpirada();
        return;
      }
      if (
        confirmTipo === 'eliminar' &&
        (err.message?.toLowerCase().includes('movimientos') ||
          err.message?.toLowerCase().includes('historial') ||
          err.message?.toLowerCase().includes('no se puede eliminar'))
      ) {
        // Flujo alterno E-33: usuario con movimientos -> MSG-34 y opción de desactivar en el mismo diálogo
        setConfirmErrorMovimientos(true);
      } else {
        setAvisoError(err.message || 'No se pudo completar la operación.');
        setConfirmModalOpen(false);
        botonOrigenRef.current?.focus();
      }
    } finally {
      setProcesandoConfirm(false);
    }
  };

  // Flujo alterno E-33: Desactivar directo desde el diálogo MSG-34
  const handleDesactivarDirectoDesdeModal = async () => {
    if (!usuarioAConfirmar) return;
    setProcesandoConfirm(true);
    setAvisoError(null);

    try {
      const res = await cambiarEstadoUsuarioService(
        usuarioAConfirmar.id,
        false,
        session.token
      );
      setAvisoExito(res.message); // MSG-29
      setUsuarioResaltadoId(usuarioAConfirmar.id);
      setConfirmModalOpen(false);
      setConfirmErrorMovimientos(false);
      await cargarUsuarios();
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        setConfirmModalOpen(false);
        setConfirmErrorMovimientos(false);
        dispararLogoutPorSesionExpirada();
        return;
      }
      setAvisoError(err.message || 'No se pudo desactivar el usuario.');
      setConfirmModalOpen(false);
      setConfirmErrorMovimientos(false);
    } finally {
      setProcesandoConfirm(false);
      botonOrigenRef.current?.focus();
    }
  };

  return {
    usuarios,
    total,
    pagina,
    setPagina,
    tamano,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    cargando,
    errorCarga,
    cargarUsuarios,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    usuarioResaltadoId,
    formModalOpen,
    setFormModalOpen,
    usuarioAEditar,
    confirmModalOpen,
    setConfirmModalOpen,
    confirmTipo,
    usuarioAConfirmar,
    procesandoConfirm,
    confirmErrorMovimientos,
    setConfirmErrorMovimientos,
    esAdmin,
    handleQuitarFiltros,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleGuardarUsuario,
    handleAbrirConfirmacion,
    handleConfirmarAccion,
    handleDesactivarDirectoDesdeModal
  };
}
