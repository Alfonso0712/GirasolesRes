import React from 'react';
import { usePedidos } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { authService } from '../services/authService';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MisPedidosView } from '../components/pedidos/MisPedidosView';
import type { RolUsuario } from '../types/auth';

export interface PedidosPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateToSalon?: () => void;
}

export const PedidosPage: React.FC<PedidosPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateToSalon,
}) => {
  if (!puede(rol, 'pedidos.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const session = authService.getStoredSession();
  const usuarioIdActual = session?.id;

  const { datos: pedidos, cargando, error, recargar } = usePedidos({
    soloMios: rol === 'Mozo',
  });

  return (
    <MisPedidosView
      pedidos={pedidos || []}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      rol={rol}
      usuarioIdActual={usuarioIdActual}
      onAgregarPlatos={() => {
        if (onNavigateToSalon) {
          onNavigateToSalon();
        }
      }}
      esMozo={rol === 'Mozo'}
    />
  );
};

export default PedidosPage;
