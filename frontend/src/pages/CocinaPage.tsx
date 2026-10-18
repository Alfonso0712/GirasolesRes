import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChefHat,
  Clock,
  Volume2,
  VolumeX,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
  Undo2,
  Flame,
  Check,
  AlertCircle
} from 'lucide-react';
import { comandaService } from '../services/comandaService';
import { PlatosAgotadosModal } from '../components/PlatosAgotadosModal';
import type { UserSession } from '../types/auth';
import type { ComandaKdsItem, ResumenProducto } from '../types/comanda';

interface CocinaPageProps {
  session: UserSession;
  onLogout: () => void;
}

interface AvisoDeshacer {
  comandaId: string;
  pedidoNumero: number;
  mensaje: string;
  segundosRestantes: number;
}

export const CocinaPage: React.FC<CocinaPageProps> = ({ session, onLogout }) => {
  const [comandas, setComandas] = useState<ComandaKdsItem[]>([]);
  const [resumen, setResumen] = useState<ResumenProducto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState(false);
  const [segundosSinConexion, setSegundosSinConexion] = useState(0);

  // Botón Sonido persistido en localStorage (RV-92)
  const [sonidoActivado, setSonidoActivado] = useState<boolean>(() => {
    return localStorage.getItem('kds_sonido_activado') !== 'false';
  });

  // Modal Platos Agotados (CUS05.2 / RN-83)
  const [abrirModalPlatosAgotados, setAbrirModalPlatosAgotados] = useState(false);

  // Comandas Nuevas (< 10 segundos) (RV-92)
  const [comandasNuevas, setComandasNuevas] = useState<Record<string, boolean>>({});
  const comandasPreviasRef = useRef<Set<string>>(new Set());

  // Aviso con DESHACER (RV-88 / 10 segundos)
  const [avisoDeshacer, setAvisoDeshacer] = useState<AvisoDeshacer | null>(null);
  const avisoTimerRef = useRef<any>(null);

  // Procesando estado por comanda (RV-89)
  const [procesandoIds, setProcesandoIds] = useState<Record<string, boolean>>({});

  // Temporizador de refresco (RNF-31: cada 5 segundos)
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState(0);
  const intervalRef = useRef<any>(null);
  const timerSegundosRef = useRef<any>(null);

  // Estabilidad de interacción táctil (RV-94)
  const tocandoTarjetaRef = useRef<boolean>(false);

  // Reproductor de sonido sintetizado Web Audio API (RV-92)
  const reproducirAvisoSonoro = useCallback(() => {
    if (!sonidoActivado) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Tono A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (err) {
      console.warn('Audio no habilitado en navegador:', err);
    }
  }, [sonidoActivado]);

  const toggleSonido = () => {
    const nuevo = !sonidoActivado;
    setSonidoActivado(nuevo);
    localStorage.setItem('kds_sonido_activado', String(nuevo));
  };

  // Carga de comandas (CUS10.2 / RNF-31)
  const cargarComandas = useCallback(
    async (silencioso = false) => {
      // Si el cocinero está tocando una tarjeta, no reordenar en este tick (RV-94)
      if (tocandoTarjetaRef.current && silencioso) {
        return;
      }

      if (!silencioso) setCargando(true);

      try {
        const res = await comandaService.listarComandas(session.token);
        setComandas(res.items);
        setResumen(res.resumen);
        setSinConexion(false);
        setSegundosSinConexion(0);
        setErrorCarga(null);
        setSegundosDesdeActualizacion(0);

        // Detectar comandas nuevas para resaltar como "NUEVA" y sonar (RV-92)
        const actualesIds = new Set(res.items.map((c) => c.id));
        const nuevasEncontradas: Record<string, boolean> = {};
        let huboNuevas = false;

        res.items.forEach((c) => {
          if (!comandasPreviasRef.current.has(c.id)) {
            nuevasEncontradas[c.id] = true;
            huboNuevas = true;
          }
        });

        if (comandasPreviasRef.current.size > 0 && huboNuevas) {
          reproducirAvisoSonoro();
          setComandasNuevas((prev) => ({ ...prev, ...nuevasEncontradas }));

          // Quitar etiqueta NUEVA a los 10 segundos
          setTimeout(() => {
            setComandasNuevas((prev) => {
              const copia = { ...prev };
              Object.keys(nuevasEncontradas).forEach((k) => delete copia[k]);
              return copia;
            });
          }, 10000);
        }

        comandasPreviasRef.current = actualesIds;
      } catch (err: any) {
        if (err.status === 401) {
          onLogout();
          return;
        }
        if (err.status === 403) {
          setErrorCarga('Acceso denegado. Solo el rol Cocinero puede gestionar comandas (MSG-39).');
          return;
        }

        // Si se pierde la conexión, franja MSG-132 y conservar comandas (RV-90 / Sección 7)
        setSinConexion(true);
        if (!silencioso) {
          setErrorCarga('No se pudieron cargar las comandas. Intente nuevamente. (MSG-125)');
        }
      } finally {
        if (!silencioso) setCargando(false);
      }
    },
    [session.token, reproducirAvisoSonoro, onLogout]
  );

  // Inicial y auto-refresco cada 5 segundos (RNF-31)
  useEffect(() => {
    cargarComandas(false);

    intervalRef.current = setInterval(() => {
      cargarComandas(true);
    }, 5000);

    timerSegundosRef.current = setInterval(() => {
      setSegundosDesdeActualizacion((prev) => prev + 1);
      setSinConexion((sc) => {
        if (sc) setSegundosSinConexion((s) => s + 1);
        return sc;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerSegundosRef.current) clearInterval(timerSegundosRef.current);
    };
  }, [cargarComandas]);

  // Manejo de DESHACER (RV-88, RN-78, RN-79 / 10 segundos)
  useEffect(() => {
    if (!avisoDeshacer) return;

    if (avisoTimerRef.current) clearInterval(avisoTimerRef.current);

    avisoTimerRef.current = setInterval(() => {
      setAvisoDeshacer((prev) => {
        if (!prev) return null;
        if (prev.segundosRestantes <= 1) {
          clearInterval(avisoTimerRef.current);
          return null;
        }
        return { ...prev, segundosRestantes: prev.segundosRestantes - 1 };
      });
    }, 1000);

    return () => {
      if (avisoTimerRef.current) clearInterval(avisoTimerRef.current);
    };
  }, [avisoDeshacer?.comandaId]);

  // Acción: Iniciar preparación (CUS10.3 / RV-87)
  const handleIniciarPreparacion = async (comanda: ComandaKdsItem) => {
    if (procesandoIds[comanda.id]) return; // Idempotencia (RV-89)

    setProcesandoIds((prev) => ({ ...prev, [comanda.id]: true }));
    try {
      const res = await comandaService.actualizarEstado(comanda.id, 'enPreparacion', session.token);

      // Actualizar estado local inmediatamente
      setComandas((prev) =>
        prev.map((c) => (c.id === comanda.id ? { ...c, estado: 'EnPreparacion' } : c))
      );

      // Activar aviso de 10s con DESHACER (RV-88 / MSG-126)
      setAvisoDeshacer({
        comandaId: comanda.id,
        pedidoNumero: comanda.pedidoNumero,
        mensaje: res.mensaje || `Comanda N.º ${comanda.pedidoNumero} en preparación.`,
        segundosRestantes: 10
      });
    } catch (err: any) {
      alert(err.message || 'No se pudo iniciar la preparación de la comanda.');
      cargarComandas(true);
    } finally {
      setProcesandoIds((prev) => {
        const c = { ...prev };
        delete c[comanda.id];
        return c;
      });
    }
  };

  // Acción: Marcar como lista (CUS10.3 / RV-87 / RN-81)
  const handleMarcarComoLista = async (comanda: ComandaKdsItem) => {
    if (procesandoIds[comanda.id]) return; // Idempotencia (RV-89)

    setProcesandoIds((prev) => ({ ...prev, [comanda.id]: true }));
    try {
      const res = await comandaService.actualizarEstado(comanda.id, 'lista', session.token);

      // Las comandas listas salen de la pantalla (RN-81)
      setComandas((prev) => prev.filter((c) => c.id !== comanda.id));

      // Activar aviso de 10s con DESHACER (RV-88 / MSG-127)
      setAvisoDeshacer({
        comandaId: comanda.id,
        pedidoNumero: comanda.pedidoNumero,
        mensaje: res.mensaje || `Comanda N.º ${comanda.pedidoNumero} marcada como lista.`,
        segundosRestantes: 10
      });

      // Refrescar resumen superior de por preparar
      cargarComandas(true);
    } catch (err: any) {
      alert(err.message || 'No se pudo marcar la comanda como lista.');
      cargarComandas(true);
    } finally {
      setProcesandoIds((prev) => {
        const c = { ...prev };
        delete c[comanda.id];
        return c;
      });
    }
  };

  // Acción: Deshacer cambio de estado (RV-88, RN-78, RN-79)
  const handleDeshacer = async () => {
    if (!avisoDeshacer) return;
    const { comandaId } = avisoDeshacer;

    setAvisoDeshacer(null);
    try {
      await comandaService.deshacerEstado(comandaId, session.token);
      cargarComandas(true);
    } catch (err: any) {
      alert(err.message || 'No se pudo deshacer el cambio de comanda (MSG-134).');
      cargarComandas(true);
    }
  };

  // Separar en Pendientes y En Preparación (RV-85)
  const comandasPendientes = comandas.filter((c) => c.estado === 'Pendiente');
  const comandasEnPreparacion = comandas.filter((c) => c.estado === 'EnPreparacion');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4EDE4] text-neutral-900 select-none overflow-hidden">
      {/* Franja superior de desconexión (MSG-132) */}
      {sinConexion && (
        <div
          role="alert"
          className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Sin conexión: las comandas pueden estar desactualizadas (datos de hace{' '}
              {segundosSinConexion} s).
            </span>
          </div>
          <button
            type="button"
            onClick={() => cargarComandas(false)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Encabezado KDS Superior */}
      <header className="p-4 sm:p-5 bg-[#482813] text-white flex flex-wrap items-center justify-between gap-4 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#D35400] flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
              Cocina en Vivo (KDS)
            </h1>
            <p className="text-xs text-amber-200/80">
              Gestión operativa de comandas de cocina · Restaurante Girasoles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botón PLATOS AGOTADOS (RN-83) */}
          <button
            type="button"
            onClick={() => setAbrirModalPlatosAgotados(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-2 border border-amber-400/30 transition-all cursor-pointer min-h-[44px]"
            title="Abrir disponibilidad de platos del menú"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            <span>PLATOS AGOTADOS</span>
          </button>

          {/* Botón SONIDO (RV-92) */}
          <button
            type="button"
            onClick={toggleSonido}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
              sonidoActivado
                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-600/40'
                : 'bg-white/10 text-neutral-300 border border-white/20 hover:bg-white/20'
            }`}
            title="Activar o desactivar sonido de nueva comanda"
          >
            {sonidoActivado ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-300" />
                <span>Sonido: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-400" />
                <span>Sonido: OFF</span>
              </>
            )}
          </button>

          {/* Contador y Actualizar Manual */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-200/80 font-mono hidden sm:inline">
              Hace {segundosDesdeActualizacion} s
            </span>
            <button
              type="button"
              onClick={() => cargarComandas(false)}
              disabled={cargando}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/15"
              title="Actualizar comandas ahora"
              aria-label="Actualizar comandas ahora"
            >
              <RotateCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#D35400]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Banda Superior "Por preparar" (RV-86, Nielsen 8) */}
      <section className="bg-white border-b border-amber-900/15 p-3.5 sm:px-6 shadow-2xs shrink-0 flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-300">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wide shrink-0">
          <Flame className="w-4 h-4 text-[#D35400]" />
          <span>Por preparar:</span>
        </div>

        {resumen.length === 0 ? (
          <span className="text-xs text-neutral-500 italic">
            Sin platos pendientes de preparación en cocina.
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {resumen.map((r) => (
              <div
                key={r.producto}
                className="px-3 py-1 rounded-xl bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 border border-amber-300/60 shadow-2xs"
              >
                <span className="text-[#D35400] text-sm">{r.cantidad} ×</span>
                <span className="truncate max-w-[200px]">{r.producto}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contenido Principal: Zonas "Pendientes" y "En preparación" (RV-85) */}
      <main className="flex-1 p-3 sm:p-5 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {cargando && comandas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-3">
            <RotateCw className="w-8 h-8 animate-spin text-[#D35400]" />
            <span className="text-base font-semibold">Cargando comandas de cocina…</span>
          </div>
        ) : errorCarga && comandas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h2 className="text-lg font-bold text-neutral-800 mb-1">{errorCarga}</h2>
            <button
              type="button"
              onClick={() => cargarComandas(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#D35400] text-white font-semibold text-sm hover:bg-[#b84600] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : comandas.length === 0 ? (
          /* Estado sin comandas (MSG-124 / Sección 7) */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/70 rounded-3xl border border-dashed border-amber-300 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-neutral-800 mb-1">
              No hay comandas pendientes
            </h2>
            <p className="text-sm text-neutral-500 max-w-md">
              Todo al día en cocina (MSG-124). Las nuevas comandas registradas por los mozos o en
              caja aparecerán aquí automáticamente en 5 segundos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* ZONA 1: PENDIENTES */}
            <section
              aria-label="Comandas Pendientes"
              className="flex flex-col gap-3.5"
              onPointerDown={() => {
                tocandoTarjetaRef.current = true;
              }}
              onPointerUp={() => {
                tocandoTarjetaRef.current = false;
              }}
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide">
                    Pendientes
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  {comandasPendientes.length} comanda
                  {comandasPendientes.length === 1 ? '' : 's'}
                </span>
              </div>

              {comandasPendientes.length === 0 ? (
                <div className="p-8 text-center bg-white/60 rounded-3xl border border-neutral-200 text-neutral-400 text-sm">
                  No hay comandas en espera de preparación.
                </div>
              ) : (
                comandasPendientes.map((c) => {
                  const esNueva = Boolean(comandasNuevas[c.id]);
                  const estaProcesando = Boolean(procesandoIds[c.id]);
                  const destino =
                    c.tipo === 'Mesa'
                      ? c.mesa || 'Mesa'
                      : `Para llevar${c.referencia ? ` (${c.referencia})` : ''}`;

                  return (
                    <article
                      key={c.id}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-sm transition-all flex flex-col justify-between gap-4 ${
                        esNueva
                          ? 'border-emerald-500 ring-4 ring-emerald-300/40 animate-pulse'
                          : c.esDemora
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-neutral-200/90'
                      }`}
                    >
                      {/* Cabecera de la tarjeta */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif">
                              N.º {c.pedidoNumero}
                            </span>

                            {/* Etiquetas especiales */}
                            {esNueva && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-600 text-white uppercase tracking-wider animate-bounce">
                                NUEVA
                              </span>
                            )}
                            {c.etiqueta && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white uppercase">
                                {c.etiqueta}
                              </span>
                            )}
                            {c.esDemora && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Demora
                              </span>
                            )}
                          </div>

                          {/* Tiempo de espera */}
                          <div className="text-right shrink-0">
                            <div
                              className={`text-sm font-bold flex items-center justify-end gap-1 ${
                                c.esDemora ? 'text-rose-700' : 'text-neutral-600'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>{c.minutosEspera} min</span>
                            </div>
                            <span className="text-[11px] text-neutral-400">Llegó: {c.horaLlegada}</span>
                          </div>
                        </div>

                        {/* Subtítulo: Destino y Mozo */}
                        <div className="text-sm text-neutral-600 mb-3 pb-3 border-b border-neutral-100 flex items-center justify-between">
                          <span className="font-bold text-[#D35400] text-base">{destino}</span>
                          <span className="text-xs text-neutral-500">Por: {c.registradoPor}</span>
                        </div>

                        {/* Líneas de Comanda con textos grandes y observaciones resaltadas */}
                        <ul className="space-y-2.5 mb-2">
                          {c.lineas.map((l, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-neutral-900">
                              <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                {l.cantidad}
                              </span>
                              <div className="flex-1">
                                <span className="font-bold text-base sm:text-lg leading-tight">
                                  {l.producto}
                                </span>
                                {l.observacion && (
                                  <div className="mt-1">
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300/80 inline-block">
                                      Obs: {l.observacion}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Botón Grande: INICIAR PREPARACIÓN (RV-93: >= 56px de alto) */}
                      <button
                        type="button"
                        onClick={() => handleIniciarPreparacion(c)}
                        disabled={estaProcesando}
                        className="w-full min-h-[56px] h-14 rounded-2xl bg-[#D35400] hover:bg-[#b84600] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        title={`Iniciar preparación del pedido N.º ${c.pedidoNumero}`}
                      >
                        {estaProcesando ? (
                          <>
                            <RotateCw className="w-5 h-5 animate-spin" />
                            <span>Actualizando…</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-5 h-5" />
                            <span>INICIAR PREPARACIÓN</span>
                          </>
                        )}
                      </button>
                    </article>
                  );
                })
              )}
            </section>

            {/* ZONA 2: EN PREPARACIÓN */}
            <section
              aria-label="Comandas En Preparación"
              className="flex flex-col gap-3.5"
              onPointerDown={() => {
                tocandoTarjetaRef.current = true;
              }}
              onPointerUp={() => {
                tocandoTarjetaRef.current = false;
              }}
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                  <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide">
                    En Preparación
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  {comandasEnPreparacion.length} comanda
                  {comandasEnPreparacion.length === 1 ? '' : 's'}
                </span>
              </div>

              {comandasEnPreparacion.length === 0 ? (
                <div className="p-8 text-center bg-white/60 rounded-3xl border border-neutral-200 text-neutral-400 text-sm">
                  No hay comandas en preparación en este momento.
                </div>
              ) : (
                comandasEnPreparacion.map((c) => {
                  const estaProcesando = Boolean(procesandoIds[c.id]);
                  const destino =
                    c.tipo === 'Mesa'
                      ? c.mesa || 'Mesa'
                      : `Para llevar${c.referencia ? ` (${c.referencia})` : ''}`;

                  return (
                    <article
                      key={c.id}
                      className={`bg-blue-50/40 rounded-3xl p-5 sm:p-6 border border-blue-200 shadow-sm transition-all flex flex-col justify-between gap-4 ${
                        c.esDemora ? 'border-rose-400 ring-2 ring-rose-200' : ''
                      }`}
                    >
                      {/* Cabecera de la tarjeta */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif">
                              N.º {c.pedidoNumero}
                            </span>

                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white uppercase flex items-center gap-1">
                              <ChefHat className="w-3.5 h-3.5" />
                              En cocina
                            </span>

                            {c.etiqueta && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white uppercase">
                                {c.etiqueta}
                              </span>
                            )}
                            {c.esDemora && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Demora
                              </span>
                            )}
                          </div>

                          {/* Tiempo de espera */}
                          <div className="text-right shrink-0">
                            <div
                              className={`text-sm font-bold flex items-center justify-end gap-1 ${
                                c.esDemora ? 'text-rose-700' : 'text-blue-900'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>{c.minutosEspera} min</span>
                            </div>
                            <span className="text-[11px] text-neutral-400">Llegó: {c.horaLlegada}</span>
                          </div>
                        </div>

                        {/* Subtítulo: Destino y Mozo */}
                        <div className="text-sm text-neutral-600 mb-3 pb-3 border-b border-blue-100 flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-base">{destino}</span>
                          <span className="text-xs text-neutral-500">Por: {c.registradoPor}</span>
                        </div>

                        {/* Líneas de Comanda con textos grandes y observaciones resaltadas */}
                        <ul className="space-y-2.5 mb-2">
                          {c.lineas.map((l, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-neutral-900">
                              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                {l.cantidad}
                              </span>
                              <div className="flex-1">
                                <span className="font-bold text-base sm:text-lg leading-tight">
                                  {l.producto}
                                </span>
                                {l.observacion && (
                                  <div className="mt-1">
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300/80 inline-block">
                                      Obs: {l.observacion}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Botón Grande: MARCAR COMO LISTA (RV-93: >= 56px de alto) */}
                      <button
                        type="button"
                        onClick={() => handleMarcarComoLista(c)}
                        disabled={estaProcesando}
                        className="w-full min-h-[56px] h-14 rounded-2xl bg-[#1B4332] hover:bg-[#143326] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        title={`Marcar pedido N.º ${c.pedidoNumero} como listo`}
                      >
                        {estaProcesando ? (
                          <>
                            <RotateCw className="w-5 h-5 animate-spin" />
                            <span>Actualizando…</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 stroke-[2.5]" />
                            <span>MARCAR COMO LISTA</span>
                          </>
                        )}
                      </button>
                    </article>
                  );
                })
              )}
            </section>
          </div>
        )}
      </main>

      {/* Aviso Inferior Flotante con Botón DESHACER (RV-88, RN-78, RN-79 - 10s) */}
      {avisoDeshacer && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white px-5 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 sm:gap-6 border border-neutral-700 animate-in slide-in-from-bottom-4 duration-200 max-w-lg w-[90%]"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{avisoDeshacer.mensaje}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Puede corregir esta acción en los próximos{' '}
              <strong className="text-amber-400">{avisoDeshacer.segundosRestantes} s</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeshacer}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            <Undo2 className="w-4 h-4 stroke-[2.5]" />
            <span>DESHACER</span>
          </button>
        </div>
      )}

      {/* Modal PLATOS AGOTADOS (CUS05.2 / RN-83) */}
      <PlatosAgotadosModal
        isOpen={abrirModalPlatosAgotados}
        onClose={() => setAbrirModalPlatosAgotados(false)}
        token={session.token}
      />
    </div>
  );
};

export default CocinaPage;
