import React, { useState, useMemo, useEffect } from 'react';
import { useReportes } from '../hooks/useRecurso';
import { cajaService } from '../services/cajaService';
import { puede } from '../config/permisos';
import { AccesoRestringido } from '../components/layout/AccesoRestringido';
import { AdminReportesView } from '../components/admin/AdminReportesView';
import type { HistorialCierresItemDto } from '../types/caja';
import type { RolUsuario } from '../types/auth';

export interface ReportesPageProps {
  rol: RolUsuario;
  onVolverAlInicio: () => void;
}

export const ReportesPage: React.FC<ReportesPageProps> = ({
  rol,
  onVolverAlInicio,
}) => {
  if (!puede(rol, 'reportes.ver')) {
    return <AccesoRestringido onVolverAlInicio={onVolverAlInicio} />;
  }

  const [periodo, setPeriodo] = useState<'hoy' | '7dias' | 'mes'>('hoy');
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);

  const rango = useMemo(() => {
    const hoy = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (periodo === 'hoy') {
      const ymd = toYMD(hoy);
      return { desde: ymd, hasta: ymd };
    }
    if (periodo === '7dias') {
      const sieteDias = new Date(hoy);
      sieteDias.setDate(sieteDias.getDate() - 7);
      return { desde: toYMD(sieteDias), hasta: toYMD(hoy) };
    }
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { desde: toYMD(primerDiaMes), hasta: toYMD(hoy) };
  }, [periodo]);

  const { datos, cargando, error, recargar } = useReportes(rango);

  useEffect(() => {
    let cancelado = false;
    cajaService.obtenerHistorialCierres()
      .then((res) => {
        if (!cancelado) setCierres(res.items || []);
      })
      .catch(() => {
        if (!cancelado) setCierres([]);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      recargar(),
      cajaService.obtenerHistorialCierres()
        .then((res) => setCierres(res.items || []))
        .catch(() => setCierres([])),
    ]);
  };

  return (
    <AdminReportesView
      reporteVentas={datos?.ventas || null}
      topPlatos={datos?.platos?.items || []}
      cierres={cierres}
      cargando={cargando}
      error={error}
      onRefresh={handleRefresh}
      periodo={periodo}
      onCambiarPeriodo={setPeriodo}
    />
  );
};

export default ReportesPage;
