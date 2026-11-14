import React, { useState } from 'react';
import { useMesas } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MesasView } from '../components/mesas/MesasView';
import { PedidoMesaView } from '../components/pedidos/PedidoMesaView';
import { mesaService } from '../services/mesaService';
import type { MesaItem } from '../types/mesa';
import type { RolUsuario } from '../types/auth';

export interface SalonPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateToCobro?: (mesaId: string) => void;
  onShowToast: (mensaje: string) => void;
  onPedidoModoChange?: (enPedido: boolean) => void;
}

export const SalonPage: React.FC<SalonPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateToCobro,
  onShowToast,
  onPedidoModoChange,
}) => {
  const [mesaEnPedido, setMesaEnPedido] = useState<MesaItem | null>(null);
  const [modoGestion, setModoGestion] = useState(false);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  if (!puede(rol, 'mesas.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos: mesas, cargando, error, recargar } = useMesas({
    incluirInactivas: modoGestion && mostrarInactivas,
  });

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
      mesas={mesas || []}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      onAbrirPedidoMesa={handleAbrirPedido}
      onNavigateToCobro={onNavigateToCobro}
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
