import React from 'react';
import { useComandas } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { KdsView } from '../components/cocina/KdsView';
import { comandaService } from '../services/comandaService';
import type { RolUsuario } from '../types/auth';

export interface CocinaPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
}

export const CocinaPage: React.FC<CocinaPageProps> = ({
  rol,
  onVolverAlInicio,
}) => {
  if (!puede(rol, 'comandas.gestionar')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos, cargando, error, recargar } = useComandas();
  const comandas = [...(datos?.pendientes || []), ...(datos?.enPreparacion || [])];

  const handleCambiarEstado = async (id: string, nuevoEstado: 'enPreparacion' | 'lista') => {
    await comandaService.actualizarEstado(id, nuevoEstado);
    void recargar();
  };

  return (
    <KdsView
      comandas={comandas}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      onCambiarEstado={handleCambiarEstado}
    />
  );
};

export default CocinaPage;
