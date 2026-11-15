import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useReportes } from '../hooks/useRecurso';
import { useAccionConAviso } from '../hooks/useAccionConAviso';
import { cajaService } from '../services/cajaService';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { AdminReportesView, type PeriodoReporte } from '../components/admin/AdminReportesView';
import { obtenerHoyLimaYMD, restarDiasLimaYMD } from '../utils/fechas';
import type { SeleccionMes } from '../components/ui/MesSheet';
import type { HistorialCierresItemDto } from '../types/caja';
import type { RolUsuario } from '../types/auth';

export interface ReportesPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
  onNavigateToCierres?: () => void;
}

export const ReportesPage: React.FC<ReportesPageProps> = ({
  rol,
  onVolverAlInicio,
  onNavigateToCierres,
}) => {
  const estaAutorizado = puede(rol, 'reportes.ver');

  const [periodo, setPeriodo] = useState<PeriodoReporte>('hoy');
  const [mesElegido, setMesElegido] = useState<SeleccionMes | null>(null);
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);

  const rango = useMemo(() => {
    const hoyLima = obtenerHoyLimaYMD();

    if (periodo === 'otroMes' && mesElegido?.desde && mesElegido?.hasta) {
      return { desde: mesElegido.desde, hasta: mesElegido.hasta };
    }
    if (periodo === 'hoy') {
      return { desde: hoyLima, hasta: hoyLima };
    }
    if (periodo === '7dias') {
      const haceSiete = restarDiasLimaYMD(7);
      return { desde: haceSiete, hasta: hoyLima };
    }
    // Este mes en Lima (AAAA-MM-01 a hoyLima)
    const primerDiaMes = `${hoyLima.slice(0, 7)}-01`;
    return { desde: primerDiaMes, hasta: hoyLima };
  }, [periodo, mesElegido]);

  const { datos, cargando: estaCargando, error, recargar } = useReportes(rango, { enabled: estaAutorizado });
  const { ejecutar } = useAccionConAviso();

  const cargarCierres = useCallback(
    async (canceladoEstado?: { estaCancelado: boolean }) => {
      await ejecutar(
        async () => {
          const res = await cajaService.obtenerHistorialCierres();
          if (!canceladoEstado?.estaCancelado) setCierres(res.items || []);
        },
        {
          mensajeError: 'No se pudo cargar el historial de cierres.',
          reintentar: () => cargarCierres(),
        }
      );
    },
    [ejecutar]
  );

  useEffect(() => {
    if (!estaAutorizado) return;
    const canceladoEstado = { estaCancelado: false };
    void cargarCierres(canceladoEstado);
    return () => {
      canceladoEstado.estaCancelado = true;
    };
  }, [estaAutorizado, cargarCierres]);

  if (!estaAutorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleRefresh = async () => {
    await Promise.all([recargar(), cargarCierres()]);
  };

  return (
    <AdminReportesView
      reporteVentas={datos?.ventas || null}
      reportePlatos={datos?.platos || null}
      topPlatos={datos?.platos?.items || []}
      cierres={cierres}
      cargando={estaCargando}
      error={error}
      onRefresh={handleRefresh}
      periodo={periodo}
      onCambiarPeriodo={setPeriodo}
      mesElegido={mesElegido}
      onSeleccionarMes={(sel) => {
        setMesElegido(sel);
        setPeriodo('otroMes');
      }}
      rangoActual={rango}
      onNavigateToCierres={onNavigateToCierres}
    />
  );
};

export default ReportesPage;
