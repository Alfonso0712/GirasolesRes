import React, { useState } from 'react';
import { useMenuDia } from '../hooks/useRecurso';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { MenuDiaView } from '../components/cocina/MenuDiaView';
import { DefinirMenuView } from '../components/menu-dia/DefinirMenuView';
import { menuDiaService } from '../services/menuDiaService';
import { useHaptics } from '../hooks/useHaptics';
import type { RolUsuario } from '../types/auth';

export interface PlatosPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  modoInicial?: 'disponibilidad' | 'definir';
  onCambiosSinGuardarChange?: (tieneCambios: boolean) => void;
  solicitudSalirPendiente?: (() => void) | null;
  onCancelarSolicitudSalir?: () => void;
}

export const PlatosPage: React.FC<PlatosPageProps> = ({
  rol,
  onVolverAlInicio,
  modoInicial = 'disponibilidad',
  onCambiosSinGuardarChange,
  solicitudSalirPendiente = null,
  onCancelarSolicitudSalir,
}) => {
  const puedeDisponibilidad = puede(rol, 'platos.disponibilidad');
  const puedeDefinir = puede(rol, 'menuDia.definir');
  const autorizado = puedeDisponibilidad || puedeDefinir;

  const [modo, setModo] = useState<'disponibilidad' | 'definir'>(
    puedeDefinir ? modoInicial : 'disponibilidad'
  );
  const { triggerLight } = useHaptics();

  const { datos, cargando, error, recargar } = useMenuDia({
    enabled: autorizado && modo === 'disponibilidad',
  });

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleCambiarDisponibilidad = async (productoId: string, nuevoAgotado: boolean) => {
    await menuDiaService.cambiarDisponibilidad(productoId, nuevoAgotado);
    void recargar();
  };

  const controlSegmentado = puedeDefinir ? (
    <div
      role="tablist"
      aria-label="Modo de gestión del menú"
      className="bg-surface border-b border-line px-4 py-2 shrink-0 grid grid-cols-2 gap-2"
    >
      <button
        type="button"
        role="tab"
        aria-selected={modo === 'disponibilidad'}
        onClick={() => {
          triggerLight();
          setModo('disponibilidad');
        }}
        className={`min-h-11 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
          modo === 'disponibilidad'
            ? 'bg-primary text-white shadow-2xs'
            : 'bg-canvas text-ink-muted hover:text-ink border border-line'
        }`}
      >
        Disponibilidad
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={modo === 'definir'}
        onClick={() => {
          triggerLight();
          setModo('definir');
        }}
        className={`min-h-11 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
          modo === 'definir'
            ? 'bg-primary text-white shadow-2xs'
            : 'bg-canvas text-ink-muted hover:text-ink border border-line'
        }`}
      >
        Definir menú
      </button>
    </div>
  ) : null;

  if (puedeDefinir && modo === 'definir') {
    return (
      <DefinirMenuView
        headerExtra={controlSegmentado}
        onCambiosSinGuardarChange={onCambiosSinGuardarChange}
        solicitudSalirPendiente={solicitudSalirPendiente}
        onCancelarSolicitudSalir={onCancelarSolicitudSalir}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {controlSegmentado}
      <MenuDiaView
        platos={datos?.platos || []}
        definido={datos?.definido}
        cargando={cargando}
        error={error}
        onRefresh={recargar}
        onCambiarDisponibilidad={handleCambiarDisponibilidad}
        puedeModificar={puedeDisponibilidad}
      />
    </div>
  );
};

export default PlatosPage;
