import React, { useState, useEffect, useCallback } from 'react';
import { useMesasConPedidos } from '../hooks/useMesasConPedidos';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MesasView } from '../components/mesas/MesasView';
import { PedidoMesaView } from '../components/pedidos/PedidoMesaView';
import { mesaService } from '../services/mesaService';
import { menuDiaService, type MenuDiaResponseDto } from '../services/menuDiaService';
import type { MesaItem } from '../types/mesa';
import type { RolUsuario } from '../types/auth';

export interface SalonPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateToCobro?: (mesaId: string) => void;
  onIrADefinirMenu?: () => void;
  onShowToast: (mensaje: string) => void;
  onPedidoModoChange?: (enPedido: boolean) => void;
}

export const SalonPage: React.FC<SalonPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateToCobro,
  onIrADefinirMenu,
  onShowToast,
  onPedidoModoChange,
}) => {
  const [mesaEnPedido, setMesaEnPedido] = useState<MesaItem | null>(null);
  const [modoGestion, setModoGestion] = useState(false);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [menuHoy, setMenuHoy] = useState<MenuDiaResponseDto | null>(() =>
    menuDiaService.obtenerMenuHoyCacheado()
  );

  const autorizado = puede(rol, 'mesas.ver');

  const cargarMenuHoy = useCallback(async (usarCache = true) => {
    try {
      const res = await menuDiaService.obtenerMenuHoy({ usarCache });
      setMenuHoy(res);
    } catch {
      // No bloquear la operación del salón si falla la consulta de estado del menú
    }
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    void cargarMenuHoy(true);

    const handleMenuActualizado = () => {
      void cargarMenuHoy(false);
    };
    window.addEventListener('girasoles:menu-dia-actualizado', handleMenuActualizado);
    return () => {
      window.removeEventListener('girasoles:menu-dia-actualizado', handleMenuActualizado);
    };
  }, [autorizado, cargarMenuHoy]);

  const { mesas, cargando, cargandoPedidos, error, recargar } = useMesasConPedidos({
    rol,
    incluirInactivas: modoGestion && mostrarInactivas,
    enabled: autorizado,
  });

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleAbrirPedido = (mesa: MesaItem) => {
    setMesaEnPedido(mesa);
    onPedidoModoChange?.(true);
  };

  const handleCerrarPedido = () => {
    setMesaEnPedido(null);
    onPedidoModoChange?.(false);
  };

  const handleCrearMesa = async (nombre: string) => {
    await mesaService.crearMesa({ nombre });
    onShowToast('Mesa registrada correctamente.');
    await recargar();
  };

  const handleEditarMesa = async (id: string, nombre: string) => {
    await mesaService.actualizarMesa(id, { nombre });
    onShowToast('Mesa actualizada correctamente.');
    await recargar();
  };

  const handleCambiarEstadoMesa = async (id: string, activa: boolean) => {
    await mesaService.cambiarEstadoMesa(id, activa);
    onShowToast(activa ? 'Mesa activada.' : 'Mesa desactivada.');
    await recargar();
  };

  if (mesaEnPedido) {
    return (
      <PedidoMesaView
        mesa={mesaEnPedido}
        rol={rol}
        menuDiaInicial={menuHoy}
        onIrADefinirMenu={onIrADefinirMenu}
        onVolver={handleCerrarPedido}
        onPedidoExitoso={(msg) => {
          handleCerrarPedido();
          onShowToast(msg);
          void recargar();
        }}
      />
    );
  }

  return (
    <MesasView
      mesas={mesas}
      cargando={cargando}
      cargandoPedidos={cargandoPedidos}
      error={error}
      onRefresh={async () => {
        await Promise.all([recargar(), cargarMenuHoy(false)]);
      }}
      onAbrirPedidoMesa={handleAbrirPedido}
      onNavigateToCobro={onNavigateToCobro}
      onIrADefinirMenu={onIrADefinirMenu}
      menuDefinido={menuHoy ? menuHoy.definido : undefined}
      rol={rol}
      modoGestion={modoGestion}
      onToggleModoGestion={setModoGestion}
      mostrarInactivas={mostrarInactivas}
      onToggleMostrarInactivas={setMostrarInactivas}
      onCrearMesa={handleCrearMesa}
      onEditarMesa={handleEditarMesa}
      onCambiarEstadoMesa={handleCambiarEstadoMesa}
    />
  );
};

export default SalonPage;
