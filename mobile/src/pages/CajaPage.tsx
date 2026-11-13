import React from 'react';
import { useCaja } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { CajaTurnoView } from '../components/caja/CajaTurnoView';
import type { RolUsuario } from '../types/auth';

export interface CajaPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateToCobros?: () => void;
}

export const CajaPage: React.FC<CajaPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateToCobros,
}) => {
  if (!puede(rol, 'caja.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos: cajaActual, cargando, error, recargar } = useCaja();

  return (
    <CajaTurnoView
      cajaActual={cajaActual}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      onNavigateToCobros={onNavigateToCobros}
      rol={rol}
    />
  );
};

export default CajaPage;
