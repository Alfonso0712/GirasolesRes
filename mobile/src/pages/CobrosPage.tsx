import React from 'react';
import { useCobrosPendientes, useCaja } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { CobroView } from '../components/caja/CobroView';
import type { RolUsuario } from '../types/auth';

export interface CobrosPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
}

export const CobrosPage: React.FC<CobrosPageProps> = ({
  rol,
  onVolverAlInicio,
}) => {
  if (!puede(rol, 'cobros.procesar')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const { datos: pedidos, cargando: cargandoPedidos, error: errorPedidos, recargar: recargarPedidos } = useCobrosPendientes();
  const { datos: cajaActual, cargando: cargandoCaja, error: errorCaja, recargar: recargarCaja } = useCaja();

  const handleRefresh = async () => {
    await Promise.all([recargarPedidos(), recargarCaja()]);
  };

  return (
    <CobroView
      pedidos={pedidos || []}
      cajaActual={cajaActual}
      cargando={cargandoPedidos || cargandoCaja}
      error={errorPedidos || errorCaja}
      onRefresh={handleRefresh}
      onCobroExitoso={handleRefresh}
    />
  );
};

export default CobrosPage;
