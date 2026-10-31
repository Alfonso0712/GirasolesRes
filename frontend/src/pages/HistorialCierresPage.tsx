import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { cajaService } from '../services/cajaService';
import {
  CierreDetalleModal,
  HistorialCierresFilterBar,
  HistorialCierresTable,
} from '../components/caja';
import { TablePagination } from '../components/ui';
import { getFechaActualLimaStr, restarDiasLimaStr } from '../utils/formatters';
import { PageHeader, PageContainer } from '../components/layout';
import type { HistorialCierresItemDto, HistorialCierresPaginadoDto } from '../types/caja';
import type { UserSession } from '../types/auth';

interface HistorialCierresPageProps {
  session: UserSession;
  onLogout: () => void;
}

export const HistorialCierresPage: React.FC<HistorialCierresPageProps> = ({ session }) => {
  // Estado del historial y paginación
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pagina, setPagina] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [descargandoPdfId, setDescargandoPdfId] = useState<string | null>(null);

  // Filtro de búsqueda por cajero (client-side)
  const [busquedaCajero, setBusquedaCajero] = useState<string>('');

  // Filtros de fecha (Lima calendar dates)
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [errorFechas, setErrorFechas] = useState<string | null>(null);

  // Modal de Detalle
  const [detalleModalOpen, setDetalleModalOpen] = useState<boolean>(false);
  const [cajaIdSeleccionada, setCajaIdSeleccionada] = useState<string | null>(null);

  const hoyLimaStr = useMemo(() => getFechaActualLimaStr(), []);

  // Validación defensiva de fechas
  const validarRangoFechas = useCallback(
    (fDesde: string, fHasta: string): string | null => {
      const msg188 =
        "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro.";
      if (fDesde && fDesde > hoyLimaStr) {
        return msg188;
      }
      if (fHasta && fHasta > hoyLimaStr) {
        return msg188;
      }
      if (fDesde && fHasta && fDesde > fHasta) {
        return msg188;
      }
      return null;
    },
    [hoyLimaStr]
  );

  const esRangoActivo = (diasAtras: number) => {
    if (diasAtras === 0) return desde === hoyLimaStr && hasta === hoyLimaStr;
    if (diasAtras === 1) {
      const ayer = restarDiasLimaStr(1);
      return desde === ayer && hasta === ayer;
    }
    const fDesde = restarDiasLimaStr(diasAtras);
    return desde === fDesde && hasta === hoyLimaStr;
  };

  const aplicarFiltroRapido = (diasAtras: number) => {
    const fDesde =
      diasAtras === 0 ? hoyLimaStr : diasAtras === 1 ? restarDiasLimaStr(1) : restarDiasLimaStr(diasAtras);
    const fHasta = diasAtras === 1 ? restarDiasLimaStr(1) : hoyLimaStr;

    setDesde(fDesde);
    setHasta(fHasta);
    setErrorFechas(null);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setDesde('');
    setHasta('');
    setBusquedaCajero('');
    setErrorFechas(null);
    setPagina(1);
  };

  const cargarCierres = useCallback(async () => {
    if (session.rol !== 'Administrador') {
      setCargando(false);
      return;
    }

    const err = validarRangoFechas(desde, hasta);
    if (err) {
      setErrorFechas(err);
      return;
    }

    setErrorFechas(null);
    setCargando(true);
    setErrorCarga(null);

    try {
      const data: HistorialCierresPaginadoDto = await cajaService.obtenerHistorialCierres(
        {
          desde: desde || undefined,
          hasta: hasta || undefined,
          pagina,
          tamano: 20,
        },
        session.token
      );

      setCierres(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo cargar el historial de cierres. Intente nuevamente.';
      setErrorCarga(msg);
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, pagina, session.rol, session.token, validarRangoFechas]);

  useEffect(() => {
    cargarCierres();
  }, [cargarCierres]);

  // Filtrado de cajero en memoria para búsqueda instantánea
  const cierresFiltrados = useMemo(() => {
    if (!busquedaCajero.trim()) return cierres;
    const term = busquedaCajero.trim().toLowerCase();
    return cierres.filter((c) => {
      const cajeroStr = (c.cajero || c.cajeroApertura || '').toLowerCase();
      return cajeroStr.includes(term);
    });
  }, [cierres, busquedaCajero]);

  // Control de rol estricto in-situ: Solo Administrador
  if (session.rol !== 'Administrador') {
    return (
      <div className="p-8 text-center bg-surface border border-rose-200 rounded-2xl shadow-xs space-y-3 text-ink max-w-2xl mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">Acceso restringido</h2>
        <p className="text-sm text-neutral-600">
          Esta vista es exclusiva para el personal con rol Administrador. Si necesita consultar información de cierres, comuníquese con administración.
        </p>
      </div>
    );
  }

  const handleDescargarPdf = async (cajaId: string) => {
    if (descargandoPdfId) return;
    try {
      setDescargandoPdfId(cajaId);
      await cajaService.descargarCierrePdf(cajaId, session.token);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al descargar el comprobante de cierre PDF.';
      alert(msg);
    } finally {
      setDescargandoPdfId(null);
    }
  };

  const tieneFiltrosActivos = Boolean(desde || hasta || busquedaCajero.trim());

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <PageContainer>
        {/* 1. Encabezado Unificado del Módulo */}
        <PageHeader
          title="Historial de Cierres"
          subtitle="Auditoría de turnos, arqueos, cuadraturas de efectivo, sobrantes, faltantes y ajustes posteriores."
          count={totalItems}
          countLabel="cierres registrados"
          actions={
            <button
              type="button"
              onClick={() => cargarCierres()}
              disabled={cargando}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60 shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          }
        />

        {/* 2. Barra de Filtros Unificada */}
        <HistorialCierresFilterBar
          busquedaCajero={busquedaCajero}
          onBusquedaCajeroChange={setBusquedaCajero}
          desde={desde}
          onDesdeChange={(val) => {
            setDesde(val);
            setPagina(1);
          }}
          hasta={hasta}
          onHastaChange={(val) => {
            setHasta(val);
            setPagina(1);
          }}
          hoyLimaStr={hoyLimaStr}
          tieneFiltrosActivos={tieneFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
          esRangoActivo={esRangoActivo}
          onAplicarFiltroRapido={aplicarFiltroRapido}
          errorFechas={errorFechas}
        />

        {/* 3. Tabla Principal de Cierres con DataTable y TablePagination */}
        <HistorialCierresTable
          cierres={cierresFiltrados}
          cargando={cargando}
          errorCarga={errorCarga}
          onRetry={cargarCierres}
          tieneFiltrosActivos={tieneFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
          descargandoPdfId={descargandoPdfId}
          onVerDetalle={(cajaId) => {
            setCajaIdSeleccionada(cajaId);
            setDetalleModalOpen(true);
          }}
          onDescargarPdf={handleDescargarPdf}
        />

        {/* Paginación Unificada */}
        <TablePagination
          currentPage={pagina}
          totalPages={totalPaginas}
          totalItems={totalItems}
          itemsPerPage={20}
          entityName="cierres"
          onPageChange={setPagina}
        />

        {/* Modal Detalle (Vista 13.4) */}
        <CierreDetalleModal
          cajaId={cajaIdSeleccionada}
          isOpen={detalleModalOpen}
          onClose={() => {
            setDetalleModalOpen(false);
            setCajaIdSeleccionada(null);
          }}
          token={session.token}
        />
      </PageContainer>
    </div>
  );
};

export default HistorialCierresPage;
