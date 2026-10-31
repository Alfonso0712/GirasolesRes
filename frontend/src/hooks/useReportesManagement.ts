import { useState, useEffect, useCallback, useMemo } from 'react';
import { reporteService } from '../services/reporteService';
import { getProductosService } from '../services/productoService';
import { formatDateIso } from '../utils/formatters';
import type {
  ReporteVentasResponse,
  ReportePlatosResponse,
  TipoAtajoFecha,
  CriterioOrdenPlatos
} from '../types/reporte';
import type { ProductoItem } from '../types/producto';

const getHoyString = (): string => formatDateIso(new Date());


export function useReportesManagement(token: string, onLogout?: () => void) {
  const hoyStr = getHoyString();

  const [tabActiva, setTabActiva] = useState<'platos' | 'ventas'>('platos');
  const [desde, setDesde] = useState<string>(hoyStr);
  const [hasta, setHasta] = useState<string>(hoyStr);
  const [atajoActivo, setAtajoActivo] = useState<TipoAtajoFecha | null>('hoy');
  const [productoFiltroId, setProductoFiltroId] = useState<string>('');
  const [ordenPlatos, setOrdenPlatos] = useState<CriterioOrdenPlatos>('cantidad');

  // Filtros guardados de la última consulta exitosa
  const [filtrosConsultados, setFiltrosConsultados] = useState<{
    desde: string;
    hasta: string;
    productoId: string;
  }>({
    desde: hoyStr,
    hasta: hoyStr,
    productoId: ''
  });

  const [reporteVentas, setReporteVentas] = useState<ReporteVentasResponse | null>(null);
  const [reportePlatos, setReportePlatos] = useState<ReportePlatosResponse | null>(null);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoItem[]>([]);

  const [cargando, setCargando] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<'pdf' | 'csv' | null>(null);
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  // Validación de Rango (RV-134, MSG-190, MSG-191)
  const errorRango = useMemo(() => {
    if (!desde || !hasta) return null;

    if (desde > hasta) {
      return 'La fecha "desde" no puede ser posterior a "hasta".'; // MSG-190
    }

    if (desde > hoyStr || hasta > hoyStr) {
      return 'El rango no puede incluir fechas futuras ni superar los 366 días.'; // MSG-191
    }

    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    const diffDays = Math.round(Math.abs((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));
    if (diffDays > 366) {
      return 'El rango no puede incluir fechas futuras ni superar los 366 días.'; // MSG-191
    }

    return null;
  }, [desde, hasta, hoyStr]);

  // Detección de filtros modificados tras consultar (RV-141, MSG-196)
  const filtrosCambiados = useMemo(() => {
    return (
      desde !== filtrosConsultados.desde ||
      hasta !== filtrosConsultados.hasta ||
      (tabActiva === 'platos' && productoFiltroId !== filtrosConsultados.productoId)
    );
  }, [desde, hasta, productoFiltroId, filtrosConsultados, tabActiva]);

  // Cargar lista completa de productos para el selector (incluye inactivos)
  useEffect(() => {
    let cancel = false;
    const cargarProductos = async () => {
      try {
        const resp = await getProductosService(undefined, undefined, undefined, 1, 100, token);
        if (!cancel && resp?.items) {
          setProductosDisponibles(resp.items);
        }
      } catch {
        // ignore
      }
    };
    cargarProductos();
    return () => {
      cancel = true;
    };
  }, [token]);

  // Ejecución de la consulta principal
  const consultar = useCallback(
    async (
      overrideDesde?: string,
      overrideHasta?: string,
      overrideProdId?: string
    ) => {
      const d = overrideDesde !== undefined ? overrideDesde : desde;
      const h = overrideHasta !== undefined ? overrideHasta : hasta;
      const pId = overrideProdId !== undefined ? overrideProdId : productoFiltroId;

      if (d > h || d > hoyStr || h > hoyStr) return;

      setCargando(true);
      setErrorCarga(null);

      try {
        if (tabActiva === 'platos') {
          const resp = await reporteService.obtenerReportePlatos(token, d, h, pId || undefined);
          setReportePlatos(resp);
        } else {
          const resp = await reporteService.obtenerReporteVentas(token, d, h);
          setReporteVentas(resp);
        }

        setFiltrosConsultados({
          desde: d,
          hasta: h,
          productoId: pId
        });
      } catch (err: any) {
        if (err?.status === 401 && onLogout) {
          onLogout();
          return;
        }
        const msg =
          tabActiva === 'platos'
            ? 'No se pudieron consultar los platos vendidos. Intente nuevamente.'
            : 'No se pudo generar el reporte de ventas. Intente nuevamente.';
        setErrorCarga(err?.message || msg);
      } finally {
        setCargando(false);
      }
    },
    [desde, hasta, productoFiltroId, tabActiva, token, hoyStr, onLogout]
  );

  // Consulta inicial al montar el componente (E-322: Pestaña "Platos vendidos" con día de hoy consultado)
  useEffect(() => {
    consultar(hoyStr, hoyStr, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cambiar de pestaña, si la nueva pestaña no ha sido consultada con el rango actual, la consulta
  const cambiarTab = (nuevaTab: 'platos' | 'ventas') => {
    setTabActiva(nuevaTab);
    setErrorCarga(null);

    // Consulta automática de la pestaña al cambiar si no tiene datos o si cambiaron los filtros
    if (nuevaTab === 'ventas' && !reporteVentas) {
      setCargando(true);
      reporteService
        .obtenerReporteVentas(token, desde, hasta)
        .then((resp) => {
          setReporteVentas(resp);
          setFiltrosConsultados((prev) => ({ ...prev, desde, hasta }));
        })
        .catch((err) => {
          if (err?.status === 401 && onLogout) onLogout();
          else setErrorCarga('No se pudo generar el reporte de ventas. Intente nuevamente.');
        })
        .finally(() => setCargando(false));
    } else if (nuevaTab === 'platos' && !reportePlatos) {
      setCargando(true);
      reporteService
        .obtenerReportePlatos(token, desde, hasta, productoFiltroId || undefined)
        .then((resp) => {
          setReportePlatos(resp);
          setFiltrosConsultados((prev) => ({ ...prev, desde, hasta, productoId: productoFiltroId }));
        })
        .catch((err) => {
          if (err?.status === 401 && onLogout) onLogout();
          else setErrorCarga('No se pudieron consultar los platos vendidos. Intente nuevamente.');
        })
        .finally(() => setCargando(false));
    }
  };

  // Atajos rápidos de fecha (RV-134, E-323)
  const aplicarAtajo = (tipo: TipoAtajoFecha) => {
    const now = new Date();
    let nDesde = hoyStr;
    let nHasta = hoyStr;

    if (tipo === 'hoy') {
      nDesde = hoyStr;
      nHasta = hoyStr;
    } else if (tipo === 'ayer') {
      const ayer = new Date(now);
      ayer.setDate(now.getDate() - 1);
      nDesde = formatDateIso(ayer);
      nHasta = formatDateIso(ayer);
    } else if (tipo === 'ultimos7') {
      const hace7 = new Date(now);
      hace7.setDate(now.getDate() - 6);
      nDesde = formatDateIso(hace7);
      nHasta = hoyStr;
    } else if (tipo === 'esteMes') {
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      nDesde = formatDateIso(inicioMes);
      nHasta = hoyStr;
    } else if (tipo === 'mesAnterior') {
      const inicioMesAnt = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const finMesAnt = new Date(now.getFullYear(), now.getMonth(), 0);
      nDesde = formatDateIso(inicioMesAnt);
      nHasta = formatDateIso(finMesAnt);
    }

    setDesde(nDesde);
    setHasta(nHasta);
    setAtajoActivo(tipo);
    consultar(nDesde, nHasta, productoFiltroId);
  };

  // Descarga exportación (RV-142, E-339, E-340)
  const descargar = async (formato: 'pdf' | 'csv') => {
    if (errorRango) return;
    setDescargando(formato);
    setErrorCarga(null);

    try {
      await reporteService.descargarArchivo(
        token,
        tabActiva,
        formato,
        filtrosConsultados.desde,
        filtrosConsultados.hasta,
        tabActiva === 'platos' ? filtrosConsultados.productoId : undefined
      );
      setAvisoExito(
        `Reporte descargado en formato ${formato.toUpperCase()} correctamente.`
      );
      setTimeout(() => setAvisoExito(null), 4000);
    } catch (err: any) {
      if (err?.status === 401 && onLogout) {
        onLogout();
        return;
      }
      setErrorCarga('No se pudo descargar el archivo. Intente nuevamente.'); // MSG-201
    } finally {
      setDescargando(null);
    }
  };

  // Ordenamiento de platos en memoria (RV-138, E-330)
  const platosOrdenados = useMemo(() => {
    if (!reportePlatos?.items) return [];
    const items = [...reportePlatos.items];

    if (ordenPlatos === 'cantidad') {
      return items.sort((a, b) => b.cantidad - a.cantidad);
    }
    if (ordenPlatos === 'monto') {
      return items.sort((a, b) => b.monto - a.monto);
    }
    if (ordenPlatos === 'nombre') {
      return items.sort((a, b) => a.producto.localeCompare(b.producto));
    }
    return items;
  }, [reportePlatos?.items, ordenPlatos]);

  return {
    tabActiva,
    cambiarTab,
    desde,
    setDesde: (v: string) => {
      setDesde(v);
      setAtajoActivo(null);
    },
    hasta,
    setHasta: (v: string) => {
      setHasta(v);
      setAtajoActivo(null);
    },
    atajoActivo,
    aplicarAtajo,
    productoFiltroId,
    setProductoFiltroId,
    ordenPlatos,
    setOrdenPlatos,
    errorRango,
    filtrosCambiados,
    cargando,
    errorCarga,
    descargando,
    avisoExito,
    setAvisoExito,
    reporteVentas,
    reportePlatos,
    platosOrdenados,
    productosDisponibles,
    consultar: (overrideDesde?: string, overrideHasta?: string, overrideProdId?: string) =>
      consultar(overrideDesde, overrideHasta, overrideProdId),
    descargar
  };
}
