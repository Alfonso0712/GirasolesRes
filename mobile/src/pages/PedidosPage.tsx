import React from 'react';
import { usePedidos } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MisPedidosView } from '../components/pedidos/MisPedidosView';
import type { RolUsuario } from '../types/auth';

export interface PedidosPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
}

export const PedidosPage: React.FC<PedidosPageProps> = ({
  rol,
  onVolverAlInicio,
}) => {
  if (!puede(rol, 'pedidos.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos: pedidos, cargando, error, recargar } = usePedidos({
    soloMios: rol === 'Mozo',
  });

  return (
    <MisPedidosView
      pedidos={pedidos || []}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      esMozo={rol === 'Mozo'}
    />
  );
};

export default PedidosPage;
