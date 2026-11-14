import React from 'react';
import { useInicioDashboard } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { AdminInicioView } from '../components/admin/AdminInicioView';
import type { RolUsuario } from '../types/auth';

export interface InicioPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const InicioPage: React.FC<InicioPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateTab,
}) => {
  const autorizado = puede(rol, 'inicio.ver');
  const { datos, cargando, error, recargar, actualizadoEn } = useInicioDashboard({ enabled: autorizado });

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  return (
    <AdminInicioView
      datos={datos}
      cargando={cargando}
      error={error}
      actualizadoEn={actualizadoEn}
      onRefresh={recargar}
      onNavigate={onNavigateTab}
    />
  );
};

export default InicioPage;
