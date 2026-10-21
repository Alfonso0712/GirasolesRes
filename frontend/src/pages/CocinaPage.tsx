import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw, RotateCw,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
  Undo2,
  AlertCircle
} from 'lucide-react';
import { comandaService } from '../services/comandaService';
import { PlatosAgotadosModal } from '../components/menu-dia';
import { ComandaCard, CocinaResumenBar } from '../components/cocina';
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
          setErrorCarga('Acceso denegado. Solo el rol Cocinero puede gestionar comandas.');
          return;
        }

        // Si se pierde la conexión, franja MSG-132 y conservar comandas (RV-90 / Sección 7)
        setSinConexion(true);
        if (!silencioso) {
          setErrorCarga('No se pudieron cargar las comandas. Intente nuevamente.');
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
      alert(err.message || 'No se pudo deshacer el cambio de comanda.');
      cargarComandas(true);
    }
  };

  // Separar en Pendientes y En Preparación (RV-85)
  const comandasPendientes = comandas.filter((c) => c.estado === 'Pendiente');
  const comandasEnPreparacion = comandas.filter((c) => c.estado === 'EnPreparacion');

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3 bg-[#FAF7F4] text-neutral-900 select-none">
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

      {/* Encabezado Editorial Limpio */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Cocina en Vivo (KDS)
            </h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              Por preparar: {resumen.reduce((acc, r) => acc + r.cantidad, 0)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Gestión operativa de comandas de cocina y despacho de pedidos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Botón PLATOS AGOTADOS */}
          <button
            type="button"
            onClick={() => setAbrirModalPlatosAgotados(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B84600] text-xs font-semibold flex items-center gap-2 border border-amber-200 shadow-2xs transition-all cursor-pointer min-h-[38px]"
            title="Abrir disponibilidad de platos del menú"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#D35400]" />
            <span>Platos agotados</span>
          </button>

          {/* Botón SONIDO */}
          <button
            type="button"
            onClick={toggleSonido}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[38px] shadow-2xs ${
              sonidoActivado
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Activar o desactivar sonido de nueva comanda"
          >
            {sonidoActivado ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
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
            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
              Actualizado hace <span className="font-semibold text-neutral-700">{segundosDesdeActualizacion}</span> s
            </span>
            <button
              type="button"
              onClick={() => cargarComandas(false)}
              disabled={cargando}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] disabled:opacity-60"
              title="Actualizar comandas manualmente"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#D35400] ${cargando ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banda Superior "Por preparar" (RV-86, Nielsen 8) */}
      {/* Banda Superior "Por preparar" (RV-86, Nielsen 8) */}
      <CocinaResumenBar resumen={resumen} />

      {/* Contenido Principal: Zonas "Pendientes" y "En preparación" (RV-85) */}
      <div className="w-full">
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
            <h2 className="text-2xl font-bold font-sans text-neutral-800 mb-1">
              No hay comandas pendientes
            </h2>
            <p className="text-sm text-neutral-500 max-w-md">
              Todo al día en cocina. Las nuevas comandas registradas por los mozos o en
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
                  <h2 className="text-lg font-bold font-sans text-neutral-800 uppercase tracking-wide">
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
                comandasPendientes.map((c) => (
                  <ComandaCard
                    key={c.id}
                    comanda={c}
                    esNueva={Boolean(comandasNuevas[c.id])}
                    estaProcesando={Boolean(procesandoIds[c.id])}
                    tipoZona="pendiente"
                    onAccionPrincipal={handleIniciarPreparacion}
                  />
                ))
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
                  <h2 className="text-lg font-bold font-sans text-neutral-800 uppercase tracking-wide">
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
                comandasEnPreparacion.map((c) => (
                  <ComandaCard
                    key={c.id}
                    comanda={c}
                    estaProcesando={Boolean(procesandoIds[c.id])}
                    tipoZona="en_preparacion"
                    onAccionPrincipal={handleMarcarComoLista}
                  />
                ))
              )}            </section>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default CocinaPage;


