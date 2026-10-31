import { useState, useCallback, useEffect } from 'react';
import type { MenuCompletoItem } from '../../types/menuCompleto';
import {
  getMenusCompletosService,
  actualizarPrecioMenuCompletoService,
  cambiarEstadoMenuCompletoService,
} from '../../services/menuCompletoService';

interface UseMenusCompletosTabParams {
  token: string;
  esAdmin: boolean;
  pestañaActiva: 'catalogo' | 'menus_completos';
  setAvisoExito: (msg: string | null) => void;
  setAvisoError: (msg: string | null) => void;
}

export function useMenusCompletosTab({
  token,
  esAdmin,
  pestañaActiva,
  setAvisoExito,
  setAvisoError,
}: UseMenusCompletosTabParams) {
  const [menusCompletos, setMenusCompletos] = useState<MenuCompletoItem[]>([]);
  const [cargandoMenus, setCargandoMenus] = useState(false);
  const [errorMenus, setErrorMenus] = useState<string | null>(null);

  // Modal para modificar precio de menú completo (RV-160)
  const [modalPrecioOpen, setModalPrecioOpen] = useState(false);
  const [menuParaPrecio, setMenuParaPrecio] = useState<MenuCompletoItem | null>(null);
  const [nuevoPrecioStr, setNuevoPrecioStr] = useState('');
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);

  // Modal para cambiar estado de menú completo (MSG-218)
  const [modalEstadoMenuOpen, setModalEstadoMenuOpen] = useState(false);
  const [menuParaEstado, setMenuParaEstado] = useState<MenuCompletoItem | null>(null);
  const [guardandoEstadoMenu, setGuardandoEstadoMenu] = useState(false);

  // Carga de menús completos desde el backend
  const cargarMenusCompletos = useCallback(async () => {
    if (!esAdmin) return;
    setCargandoMenus(true);
    setErrorMenus(null);
    try {
      const data = await getMenusCompletosService(false, token);
      setMenusCompletos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudieron cargar los menús completos.';
      setErrorMenus(msg);
    } finally {
      setCargandoMenus(false);
    }
  }, [esAdmin, token]);

  useEffect(() => {
    if (pestañaActiva === 'menus_completos') {
      cargarMenusCompletos();
    }
  }, [pestañaActiva, cargarMenusCompletos]);

  // Manejador para abrir modal de precio de menú completo
  const handleAbrirModalPrecio = (menu: MenuCompletoItem) => {
    setMenuParaPrecio(menu);
    setNuevoPrecioStr(menu.precio.toFixed(2));
    setErrorPrecio(null);
    setModalPrecioOpen(true);
  };

  // Guardar nuevo precio de menú completo (RV-160)
  const handleGuardarPrecioMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuParaPrecio || guardandoPrecio) return;

    const precioNum = parseFloat(nuevoPrecioStr.trim().replace(',', '.'));
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorPrecio('El precio debe ser un número mayor a cero.');
      return;
    }
    if (precioNum > 999.99 || parseFloat(precioNum.toFixed(2)) !== precioNum) {
      setErrorPrecio('El precio no puede superar S/ 999.99 y acepta hasta dos decimales.');
      return;
    }

    setGuardandoPrecio(true);
    setErrorPrecio(null);

    try {
      await actualizarPrecioMenuCompletoService(
        menuParaPrecio.id,
        { precio: precioNum },
        token
      );
      setModalPrecioOpen(false);
      setAvisoExito('Menú completo actualizado correctamente.');
      await cargarMenusCompletos();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo actualizar el precio del menú completo.';
      setErrorPrecio(msg);
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // Manejador para abrir modal de confirmación de estado de menú completo
  const handleAbrirModalEstadoMenu = (menu: MenuCompletoItem) => {
    setMenuParaEstado(menu);
    setModalEstadoMenuOpen(true);
  };

  // Confirmar cambio de estado de menú completo
  const handleConfirmarEstadoMenu = async () => {
    if (!menuParaEstado || guardandoEstadoMenu) return;

    setGuardandoEstadoMenu(true);
    try {
      await cambiarEstadoMenuCompletoService(
        menuParaEstado.id,
        { activo: !menuParaEstado.activo },
        token
      );
      setModalEstadoMenuOpen(false);
      setAvisoExito('Menú completo actualizado correctamente.');
      await cargarMenusCompletos();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo cambiar el estado del menú completo.';
      setAvisoError(msg);
    } finally {
      setGuardandoEstadoMenu(false);
    }
  };

  return {
    menusCompletos,
    cargandoMenus,
    errorMenus,
    modalPrecioOpen,
    setModalPrecioOpen,
    menuParaPrecio,
    nuevoPrecioStr,
    setNuevoPrecioStr,
    guardandoPrecio,
    errorPrecio,
    setErrorPrecio,
    modalEstadoMenuOpen,
    setModalEstadoMenuOpen,
    menuParaEstado,
    guardandoEstadoMenu,
    cargarMenusCompletos,
    handleAbrirModalPrecio,
    handleGuardarPrecioMenu,
    handleAbrirModalEstadoMenu,
    handleConfirmarEstadoMenu,
  };
}
