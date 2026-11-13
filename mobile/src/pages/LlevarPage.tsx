import React from 'react';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { PedidoLlevarView } from '../components/caja/PedidoLlevarView';
import type { RolUsuario } from '../types/auth';

export interface LlevarPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onShowToast: (mensaje: string) => void;
  onIrACobros?: () => void;
}

export const LlevarPage: React.FC<LlevarPageProps> = ({
  rol,
  onVolverAlInicio,
  onShowToast,
  onIrACobros,
}) => {
  if (!puede(rol, 'pedidoLlevar.crear')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  return (
    <PedidoLlevarView
      onPedidoCreado={onShowToast}
      onIrACobros={onIrACobros}
    />
  );
};

export default LlevarPage;
