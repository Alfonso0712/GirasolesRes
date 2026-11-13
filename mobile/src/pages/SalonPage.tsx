import React, { useState } from 'react';
import { useMesas } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MesasView } from '../components/mesas/MesasView';
import { PedidoMesaView } from '../components/pedidos/PedidoMesaView';
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

  if (!puede(rol, 'mesas.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos: mesas, cargando, error, recargar } = useMesas();

  const handleAbrirPedido = (mesa: MesaItem) => {
    setMesaEnPedido(mesa);
    onPedidoModoChange?.(true);
  };

  const handleCerrarPedido = () => {
    setMesaEnPedido(null);
    onPedidoModoChange?.(false);
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
    />
  );
};

export default SalonPage;
