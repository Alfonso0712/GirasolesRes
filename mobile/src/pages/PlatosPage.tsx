import React from 'react';
import { useMenuDia } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MenuDiaView } from '../components/cocina/MenuDiaView';
import { menuDiaService } from '../services/menuDiaService';
import type { RolUsuario } from '../types/auth';

export interface PlatosPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
}

export const PlatosPage: React.FC<PlatosPageProps> = ({
  rol,
  onVolverAlInicio,
}) => {
  const autorizado = puede(rol, 'platos.disponibilidad');
  const { datos, cargando, error, recargar } = useMenuDia({ enabled: autorizado });

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleCambiarDisponibilidad = async (productoId: string, nuevoAgotado: boolean) => {
    await menuDiaService.cambiarDisponibilidad(productoId, nuevoAgotado);
    void recargar();
  };

  return (
    <MenuDiaView
      platos={datos?.platos || []}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      onCambiarDisponibilidad={handleCambiarDisponibilidad}
      puedeModificar={puede(rol, 'platos.disponibilidad')}
    />
  );
};

export default PlatosPage;
