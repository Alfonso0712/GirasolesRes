import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  Download,
  Eye,
  AlertCircle,
  ShieldAlert,
  Calendar,
  Filter,
  X,
  User,
} from 'lucide-react';
import { cajaService } from '../services/cajaService';
import { CierreDetalleModal } from '../components/caja';
import {
  StatusBadge,
  IconActionButton,
  TablePagination,
  DataTable,
  TableHead,
  TableBody,
} from '../components/ui';
import { formatCurrency, getFechaActualLimaStr, restarDiasLimaStr } from '../utils/formatters';
import { PageHeader, PageContainer } from '../components/layout';
import type { HistorialCierresItemDto, HistorialCierresPaginadoDto } from '../types/caja';
import type { UserSession } from '../types/auth';

interface HistorialCierresPageProps {
  session: UserSession;
  onLogout: () => void;
}


/**
 * Detecta defensivamente si el registro de caja corresponde a una caja actualmente abierta.
 */
const esCajaAbierta = (c: HistorialCierresItemDto): boolean => {
  return (
    c.esAbierta === true ||
    c.estado?.toLowerCase() === 'abierta' ||
    (!c.fechaCierre && (c.montoCierre === null || c.montoCierre === undefined))
  );
};

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
    } catch (err: any) {
      setErrorCarga(err.message || 'No se pudo cargar el historial de cierres. Intente nuevamente.');
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
      const downloadFn =
        (cajaService as any).descargarPdfCierre || cajaService.descargarCierrePdf;
      await downloadFn.call(cajaService, cajaId, session.token);
    } catch (err: any) {
      alert(err.message || 'Error al descargar el comprobante de cierre PDF.');
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
        <div className="bg-surface border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Búsqueda por Cajero */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar cajero(a)..."
                  value={busquedaCajero}
                  onChange={(e) => setBusquedaCajero(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50/50 hover:bg-surface focus:bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-all"
                />
              </div>

              {/* Fecha Desde */}
              <div className="flex items-center gap-2">
                <label htmlFor="filtro-desde" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Desde:
                </label>
                <input
                  id="filtro-desde"
                  type="date"
                  max={hoyLimaStr}
                  value={desde}
                  onChange={(e) => {
                    setDesde(e.target.value);
                    setPagina(1);
                  }}
                  className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
                />
              </div>

              {/* Fecha Hasta */}
              <div className="flex items-center gap-2">
                <label htmlFor="filtro-hasta" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Hasta:
                </label>
                <input
                  id="filtro-hasta"
                  type="date"
                  max={hoyLimaStr}
                  value={hasta}
                  onChange={(e) => {
                    setHasta(e.target.value);
                    setPagina(1);
                  }}
                  className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
                />
              </div>

              {tieneFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="text-xs font-semibold text-accent hover:text-accent p-2 rounded-xl hover:bg-amber-50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* Chips de Selección Rápida */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1 mr-1 select-none">
                <Filter className="w-3.5 h-3.5" />
                Rango rápido:
              </span>
              <button
                type="button"
                onClick={() => aplicarFiltroRapido(0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                  esRangoActivo(0)
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => aplicarFiltroRapido(1)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                  esRangoActivo(1)
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => aplicarFiltroRapido(7)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                  esRangoActivo(7)
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => aplicarFiltroRapido(30)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                  esRangoActivo(30)
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                30 días
              </button>
            </div>
          </div>

          {/* Alerta de Error en Rango de Fechas */}
          {errorFechas && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorFechas}</span>
            </div>
          )}
        </div>

        {/* 3. Tabla Principal de Cierres con DataTable y TablePagination */}
        <DataTable
          loading={cargando}
          error={errorCarga}
          onRetry={cargarCierres}
          isEmpty={cierresFiltrados.length === 0}
          emptyTitle="No se encontraron cierres de caja"
          emptyMessage={
            tieneFiltrosActivos
              ? 'No hay registros que coincidan con los filtros aplicados. Intente ajustar el rango de fechas o el cajero.'
              : 'Aún no se han registrado turnos o cierres de caja en el sistema.'
          }
          emptyActionLabel={tieneFiltrosActivos ? 'Ver todos los cierres' : undefined}
          onEmptyAction={tieneFiltrosActivos ? limpiarFiltros : undefined}
          minWidth="min-w-[900px]"
        >
          <TableHead>
            <tr>
              <th scope="col" className="px-3 py-3.5">Turno</th>
              <th scope="col" className="px-3 py-3.5">Cajero(a)</th>
              <th scope="col" className="px-3 py-3.5 text-right">Monto inicial</th>
              <th scope="col" className="px-3 py-3.5 text-right">Efectivo</th>
              <th scope="col" className="px-3 py-3.5 text-right">Yape</th>
              <th scope="col" className="px-3 py-3.5 text-right">Total ventas</th>
              <th scope="col" className="px-3 py-3.5 text-right">Contado</th>
              <th scope="col" className="px-3 py-3.5 text-right">Diferencia</th>
              <th scope="col" className="px-3 py-3.5 text-center">Estado</th>
              <th scope="col" className="px-3 py-3.5 text-center">Acciones</th>
            </tr>
          </TableHead>

          <TableBody>
            {cierresFiltrados.map((c) => {
              const abierta = esCajaAbierta(c);
              const diferenciaNum =
                c.diferencia !== null && c.diferencia !== undefined ? Number(c.diferencia) : null;
              const cajaId = c.cajaId || c.id || c.cierreId || '';
              const fechaAperturaStr =
                c.fechaAperturaLocal ||
                (c.fechaApertura
                  ? new Date(c.fechaApertura).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—');
              const fechaCierreStr =
                c.fechaCierreLocal ||
                (c.fechaCierre
                  ? new Date(c.fechaCierre).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null);

              return (
                <tr
                  key={cajaId}
                  className={`hover:bg-neutral-50/70 transition-colors border-b border-line-soft ${
                    abierta ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Turno en dos líneas: Apertura y Cierre */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-ink whitespace-nowrap">
                        Apertura: {fechaAperturaStr}
                      </span>
                      <span className="text-xs text-neutral-500 whitespace-nowrap mt-0.5">
                        {abierta ? 'En curso' : `Cierre: ${fechaCierreStr || '—'}`}
                      </span>
                    </div>
                  </td>

                  {/* Cajero */}
                  <td className="px-3 py-3 font-semibold text-sm text-ink whitespace-nowrap">
                    {c.cajero || c.cajeroApertura || 'Cajero'}
                  </td>

                  {/* Monto Inicial */}
                  <td className="px-3 py-3 text-right font-medium text-sm text-neutral-700 tabular-nums whitespace-nowrap">
                    {formatCurrency(c.montoInicial)}
                  </td>

                  {/* Efectivo */}
                  <td className="px-3 py-3 text-right font-medium text-sm text-ink tabular-nums whitespace-nowrap">
                    {formatCurrency(c.ventasEfectivo ?? c.efectivo)}
                  </td>

                  {/* Yape */}
                  <td className="px-3 py-3 text-right font-medium text-sm text-purple-900 tabular-nums whitespace-nowrap">
                    {formatCurrency(c.ventasYape ?? c.yape)}
                  </td>

                  {/* Total Ventas */}
                  <td className="px-3 py-3 text-right font-semibold text-sm text-accent tabular-nums whitespace-nowrap">
                    {formatCurrency(c.totalVentas ?? c.total)}
                  </td>

                  {/* Contado */}
                  <td className="px-3 py-3 text-right font-medium text-sm text-ink tabular-nums whitespace-nowrap">
                    {abierta ? (
                      <span className="text-neutral-400 font-normal">—</span>
                    ) : c.efectivoContado !== null && c.efectivoContado !== undefined ? (
                      <span className="tabular-nums font-semibold">{formatCurrency(Number(c.efectivoContado))}</span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Diferencia / Cuadre con StatusBadge */}
                  <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                    {abierta ? (
                      <span className="text-neutral-400 font-normal">—</span>
                    ) : diferenciaNum === null ? (
                      <span className="text-neutral-400">—</span>
                    ) : diferenciaNum === 0 ? (
                      <StatusBadge status="Cuadra" label="Cuadra · S/ 0.00" intent="success" />
                    ) : diferenciaNum > 0 ? (
                      <StatusBadge status="Sobrante" label={`+ ${formatCurrency(diferenciaNum)}`} intent="warning" />
                    ) : (
                      <StatusBadge status="Faltante" label={`- ${formatCurrency(Math.abs(diferenciaNum))}`} intent="danger" />
                    )}
                  </td>

                  {/* Estado con StatusBadge */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    {abierta ? (
                      <StatusBadge status="Abierta" intent="success" />
                    ) : c.conAjustes || c.tieneAjustesPosteriores ? (
                      <StatusBadge status="Con ajustes" intent="warning" />
                    ) : (
                      <StatusBadge status="Cerrada" intent="neutral" />
                    )}
                  </td>

                  {/* Acciones con IconActionButton */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <IconActionButton
                        icon={Eye}
                        label="Ver detalle del cierre"
                        variant="view"
                        onClick={() => {
                          setCajaIdSeleccionada(cajaId);
                          setDetalleModalOpen(true);
                        }}
                      />

                      <IconActionButton
                        icon={Download}
                        label="Descargar acta de cierre"
                        variant="download"
                        disabled={abierta || descargandoPdfId === cajaId}
                        disabledReason={abierta ? 'No disponible mientras la caja esté abierta' : 'Descargando...'}
                        onClick={() => handleDescargarPdf(cajaId)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </DataTable>

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
