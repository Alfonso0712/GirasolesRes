import React, { useEffect, useRef } from 'react';
import { useComandas } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { KdsView } from '../components/cocina/KdsView';
import { comandaService } from '../services/comandaService';
import { desbloquearAudioKds, reproducirSonidoKds } from '../utils/audioKds';
import { useHaptics } from '../hooks/useHaptics';
import type { RolUsuario } from '../types/auth';

export interface CocinaPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onShowToast?: (mensaje: string) => void;
}

export const CocinaPage: React.FC<CocinaPageProps> = ({
  rol,
  onVolverAlInicio,
  onShowToast,
}) => {
  const { triggerMedium } = useHaptics();

  // Desbloqueo preventivo del audio ante la primera interacción
  useEffect(() => {
    const desbloquear = () => desbloquearAudioKds();
    window.addEventListener('click', desbloquear, { once: true });
    window.addEventListener('touchstart', desbloquear, { once: true });
    return () => {
      window.removeEventListener('click', desbloquear);
      window.removeEventListener('touchstart', desbloquear);
    };
  }, []);

  const autorizado = puede(rol, 'comandas.gestionar');
  const { datos, cargando, error, recargar } = useComandas({ enabled: autorizado });
  const comandas = datos?.items || [];

  // Detección de nuevas comandas entrantes para sonido y vibración
  const comandasPreviasRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!datos?.items) return;

    const idsActuales = new Set(datos.items.map((c) => c.id));

    if (comandasPreviasRef.current !== null) {
      // Buscar si hay alguna comanda nueva en estado Pendiente
      const hayNuevasPendientes = datos.items.some(
        (c) => c.estado === 'Pendiente' && !comandasPreviasRef.current?.has(c.id)
      );

      if (hayNuevasPendientes) {
        reproducirSonidoKds('pendiente');
        triggerMedium();
      }
    }

    comandasPreviasRef.current = idsActuales;
  }, [datos, triggerMedium]);

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleCambiarEstado = async (id: string, nuevoEstado: 'enPreparacion' | 'lista') => {
    await comandaService.actualizarEstado(id, nuevoEstado);
    await recargar();
  };

  const handleDeshacer = async (id: string) => {
    await comandaService.deshacerEstado(id);
    await recargar();
  };

  return (
    <KdsView
      comandas={comandas}
      cargando={cargando}
      error={error}
      onRefresh={recargar}
      onCambiarEstado={handleCambiarEstado}
      onDeshacer={handleDeshacer}
      onShowToast={onShowToast}
    />
  );
};

export default CocinaPage;
