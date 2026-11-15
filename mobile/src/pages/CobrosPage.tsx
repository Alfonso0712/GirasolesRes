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
  const estaAutorizado = puede(rol, 'cobros.procesar');
  const { datos: pedidos, cargando: estaCargandoPedidos, error: errorPedidos, recargar: recargarPedidos } = useCobrosPendientes({ enabled: estaAutorizado });
  const { datos: cajaActual, cargando: estaCargandoCaja, error: errorCaja, recargar: recargarCaja } = useCaja({ enabled: estaAutorizado });

  if (!estaAutorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleRefresh = async () => {
    await Promise.all([recargarPedidos(), recargarCaja()]);
  };

  return (
    <CobroView
      pedidos={pedidos || []}
      cajaActual={cajaActual}
      cargando={estaCargandoPedidos || estaCargandoCaja}
      error={errorPedidos || errorCaja}
      onRefresh={handleRefresh}
      onCobroExitoso={handleRefresh}
    />
  );
};

export default CobrosPage;
