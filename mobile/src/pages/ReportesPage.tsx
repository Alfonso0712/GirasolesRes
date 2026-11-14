import React, { useState, useMemo, useEffect } from 'react';
import { useReportes } from '../hooks/useRecurso';
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
  const autorizado = puede(rol, 'reportes.ver');

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

  const { datos, cargando, error, recargar } = useReportes(rango, { enabled: autorizado });

  useEffect(() => {
    if (!autorizado) return;
    let cancelado = false;
    cajaService
      .obtenerHistorialCierres()
      .then((res) => {
        if (!cancelado) setCierres(res.items || []);
      })
      .catch(() => {
        if (!cancelado) setCierres([]);
      });

    return () => {
      cancelado = true;
    };
  }, [autorizado]);

  if (!autorizado) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const handleRefresh = async () => {
    await Promise.all([
      recargar(),
      cajaService
        .obtenerHistorialCierres()
        .then((res) => setCierres(res.items || []))
        .catch(() => setCierres([])),
    ]);
  };

  return (
    <AdminReportesView
      reporteVentas={datos?.ventas || null}
      reportePlatos={datos?.platos || null}
      topPlatos={datos?.platos?.items || []}
      cierres={cierres}
      cargando={cargando}
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
