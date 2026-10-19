import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  RotateCcw,
  Download,
  Eye,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Calendar,
} from 'lucide-react';
import { cajaService } from '../services/cajaService';
import { CierreDetalleModal } from '../components/caja/CierreDetalleModal';
import type { HistorialCierresItemDto, HistorialCierresPaginadoDto } from '../types/caja';
import type { UserSession } from '../types/auth';

interface HistorialCierresPageProps {
  session: UserSession;
  onLogout: () => void;
}

/**
 * Retorna la fecha actual en la zona horaria de Lima (UTC-5) en formato "YYYY-MM-DD".
 */
const getFechaActualLimaStr = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

/**
 * Retorna una fecha restando días en la zona horaria de Lima en formato "YYYY-MM-DD".
 */
const restarDiasLimaStr = (diasAtras: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

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

  // Filtros de fecha (Lima calendar dates)
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [errorFechas, setErrorFechas] = useState<string | null>(null);

  // Modal de Detalle (Vista 13.4)
  const [detalleModalOpen, setDetalleModalOpen] = useState<boolean>(false);
  const [cajaIdSeleccionada, setCajaIdSeleccionada] = useState<string | null>(null);

  const hoyLimaStr = useMemo(() => getFechaActualLimaStr(), []);

  // Validación defensiva de fechas (RV-130, MSG-188)
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
          tamano: 20, // RN-110, RV-131: 20 registros por página
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

  // Guard de rol estricto in-situ (RN-106, E-319): Solo Administrador
  if (session.rol !== 'Administrador') {
    return (
      <div className="p-8 text-center bg-[#FFFDF9] border border-red-200 rounded-2xl shadow-sm space-y-3 animate-fade-in text-[#482813] max-w-2xl mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-red-800">Acceso restringido</h2>
        <p className="text-sm text-stone-600">
          No tiene permisos para acceder al historial de cierres. Esta vista es exclusiva para el rol Administrador.
        </p>
      </div>
    );
  }

  const handleDescargarPdf = async (cajaId: string) => {
    try {
      setDescargandoPdfId(cajaId);
      const downloadFn =
        (cajaService as any).descargarPdfCierre || cajaService.descargarCierrePdf;
      await downloadFn.call(cajaService, cajaId, session.token);
    } catch (err: any) {
      alert(err.message || 'Error al descargar el PDF de cierre.');
    } finally {
      setDescargandoPdfId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3 text-[#482813] animate-fade-in">
      {/* 1. Encabezado Fijo del Módulo */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Historial de Cierres de Caja
            </h1>
            <div className="px-3.5 py-1 bg-amber-50/80 rounded-full border border-amber-200/80 text-xs font-semibold text-[#2C1A0E] flex items-center gap-2 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auditoría · Solo Administrador
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Auditoría de turnos, arqueos, cuadraturas de efectivo, sobrantes, faltantes y ajustes posteriores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => cargarCierres()}
          disabled={cargando}
          className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer min-h-[38px] shadow-2xs shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#D35400] ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros de Fecha (RV-130) */}
      <div className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl px-3.5 py-2.5 shadow-sm space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="filtro-desde" className="text-xs font-bold text-stone-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
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
                className="px-3 py-1.5 text-xs bg-white border border-[#E6D7C3] rounded-xl font-semibold text-[#482813] focus:outline-none focus:ring-2 focus:ring-[#D35400] min-h-[40px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="filtro-hasta" className="text-xs font-bold text-stone-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
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
                className="px-3 py-1.5 text-xs bg-white border border-[#E6D7C3] rounded-xl font-semibold text-[#482813] focus:outline-none focus:ring-2 focus:ring-[#D35400] min-h-[40px]"
              />
            </div>

            {(desde || hasta) && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-[#FAF6F0] border border-[#E6D7C3] rounded-xl cursor-pointer min-h-[40px] transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {/* Chips de Selección Rápida */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Rango rápido:</span>
            <button
              type="button"
              onClick={() => aplicarFiltroRapido(0)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6F0] hover:bg-[#F5EBE1] border border-[#E6D7C3] text-stone-700 transition-colors cursor-pointer min-h-[36px]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => aplicarFiltroRapido(1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6F0] hover:bg-[#F5EBE1] border border-[#E6D7C3] text-stone-700 transition-colors cursor-pointer min-h-[36px]"
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => aplicarFiltroRapido(7)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6F0] hover:bg-[#F5EBE1] border border-[#E6D7C3] text-stone-700 transition-colors cursor-pointer min-h-[36px]"
            >
              7 días
            </button>
            <button
              type="button"
              onClick={() => aplicarFiltroRapido(30)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6F0] hover:bg-[#F5EBE1] border border-[#E6D7C3] text-stone-700 transition-colors cursor-pointer min-h-[36px]"
            >
              30 días
            </button>
          </div>
        </div>

        {/* Alerta de Error en Rango de Fechas (MSG-188) */}
        {errorFechas && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorFechas}</span>
          </div>
        )}
      </div>

      {/* Tabla Principal de Cierres (RV-130, RV-131, E-313..E-321) */}
      <div className="bg-[#FFFDF9] border border-[#E6D7C3] rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="w-8 h-8 text-[#D35400] animate-spin" />
            <p className="text-sm font-semibold">Cargando cierres de caja…</p>
          </div>
        ) : errorCarga ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-800">
              No se pudo cargar el historial de cierres. Intente nuevamente.
            </p>
            <p className="text-xs text-stone-500">{errorCarga}</p>
            <button
              type="button"
              onClick={() => cargarCierres()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#D35400] hover:bg-[#B94600] rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Reintentar
            </button>
          </div>
        ) : cierres.length === 0 ? (
          <div className="py-20 text-center space-y-3 text-stone-500">
            <FileText className="w-12 h-12 mx-auto text-stone-300" />
            <p className="text-sm font-bold text-stone-700">
              {desde || hasta
                ? 'No se encontraron cierres de caja con ese criterio. Pruebe con otro rango de fechas.'
                : 'Aún no hay cierres de caja registrados.'}
            </p>
            {(desde || hasta) && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-1.5 text-xs font-semibold text-[#D35400] hover:underline cursor-pointer"
              >
                Ver todos los cierres
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#482813] text-amber-100 text-[10px] uppercase font-bold tracking-wider border-b border-[#3A1F0D]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Estado / Turno</th>
                  <th scope="col" className="px-4 py-3.5">Cajero(a)</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Monto Inicial</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Efectivo</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Yape</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Total Ventas</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Contado</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Diferencia</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Ajustes</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D7C3]">
                {cierres.map((c) => {
                  const abierta = esCajaAbierta(c);
                  const diferenciaNum =
                    c.diferencia !== null && c.diferencia !== undefined ? Number(c.diferencia) : null;
                  const cajaId = c.cajaId || c.id || c.cierreId || '';

                  return (
                    <tr
                      key={cajaId}
                      className={`hover:bg-[#FAF6F0]/60 transition-colors ${
                        abierta ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      {/* Estado / Turno */}
                      <td className="px-4 py-3">
                        {abierta ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Abierta
                            </span>
                            <p className="text-[10px] text-stone-500">
                              Desde{' '}
                              {c.fechaAperturaLocal?.split(' ')[1] ||
                                new Date(c.fechaApertura).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-[#482813]">
                              {c.fechaAperturaLocal?.split(' ')[0] ||
                                new Date(c.fechaApertura).toLocaleDateString('es-PE')}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              {c.fechaAperturaLocal?.split(' ')[1] ||
                                new Date(c.fechaApertura).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                              -{' '}
                              {c.fechaCierreLocal?.split(' ')[1] ||
                                (c.fechaCierre
                                  ? new Date(c.fechaCierre).toLocaleTimeString('es-PE', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '—')}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Cajero */}
                      <td className="px-4 py-3 font-semibold text-stone-800">
                        {c.cajero || c.cajeroApertura || 'Cajero'}
                      </td>

                      {/* Monto Inicial */}
                      <td className="px-4 py-3 text-right font-medium text-stone-600 tabular-nums">
                        S/ {(c.montoInicial ?? 0).toFixed(2)}
                      </td>

                      {/* Efectivo */}
                      <td className="px-4 py-3 text-right font-medium text-[#482813] tabular-nums">
                        S/ {(c.ventasEfectivo ?? c.efectivo ?? 0).toFixed(2)}
                      </td>

                      {/* Yape */}
                      <td className="px-4 py-3 text-right font-medium text-purple-900 tabular-nums">
                        S/ {(c.ventasYape ?? c.yape ?? 0).toFixed(2)}
                      </td>

                      {/* Total Ventas */}
                      <td className="px-4 py-3 text-right font-bold text-[#D35400] tabular-nums">
                        S/ {(c.totalVentas ?? c.total ?? 0).toFixed(2)}
                      </td>

                      {/* Contado */}
                      <td className="px-4 py-3 text-right font-semibold text-stone-800 tabular-nums">
                        {abierta ? (
                          <span className="text-stone-400 font-normal">—</span>
                        ) : c.efectivoContado !== null && c.efectivoContado !== undefined ? (
                          `S/ ${Number(c.efectivoContado).toFixed(2)}`
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Diferencia / Cuadre (RV-131, E-314) */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        {abierta ? (
                          <span className="text-stone-400 font-normal">—</span>
                        ) : diferenciaNum === null ? (
                          <span className="text-stone-400">—</span>
                        ) : diferenciaNum === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Cuadra · S/ 0.00
                          </span>
                        ) : diferenciaNum > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            + S/ {diferenciaNum.toFixed(2)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            - S/ {Math.abs(diferenciaNum).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Badge Con Ajustes (RN-113, RV-131) */}
                      <td className="px-4 py-3 text-center">
                        {c.conAjustes || c.tieneAjustesPosteriores ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300"
                            title="Contiene ventas anuladas después del cierre sin alterar el arqueo histórico"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            Con ajustes
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCajaIdSeleccionada(cajaId);
                              setDetalleModalOpen(true);
                            }}
                            className="p-2 text-stone-600 hover:text-[#D35400] hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Ver detalle del turno de caja"
                            aria-label={`Ver detalle del cierre ${cajaId}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!abierta ? (
                            <button
                              type="button"
                              onClick={() => handleDescargarPdf(cajaId)}
                              disabled={descargandoPdfId === cajaId}
                              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#FAF6F0] disabled:opacity-40 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Descargar comprobante de cierre PDF"
                              aria-label={`Descargar PDF del cierre ${cajaId}`}
                            >
                              {descargandoPdfId === cajaId ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#D35400]" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="p-2 text-stone-300 cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="No disponible mientras la caja esté abierta"
                              aria-label="PDF no disponible para caja abierta"
                            >
                              <Download className="w-4 h-4 opacity-40" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación (RN-110, RV-131) */}
        {totalPaginas > 1 && (
          <div className="bg-[#FAF6F0] px-4 py-3 border-t border-[#E6D7C3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-600 font-medium">
              Mostrando {cierres.length} de {totalItems} registros (20 por página)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagina <= 1 || cargando}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                className="p-2 border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold tabular-nums px-2">
                Pág. {pagina} de {totalPaginas}
              </span>
              <button
                type="button"
                disabled={pagina >= totalPaginas || cargando}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                className="p-2 border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
      </div>
    </div>
  );
};
