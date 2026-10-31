import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react';
import { reproducirSonidoKds, desbloquearAudioKds } from '../utils/audioKds';
import { comandaService } from '../services/comandaService';
import { renovarTokenService } from '../services/authService';
import { PlatosAgotadosModal } from '../components/menu-dia';
import {
  CocinaResumenBar,
  AvisoNuevoPedidoCocinaModal,
  CocinaDesconexionBanner,
  CocinaAvisoDeshacer,
  CocinaZonasBoard,
  type AvisoDeshacerInfo,
} from '../components/cocina';
import { PageHeader, PageContainer } from '../components/layout';
import type { UserSession } from '../types/auth';
import type { ComandaKdsItem, ResumenProducto } from '../types/comanda';

interface CocinaPageProps {
  session: UserSession;
  onLogout: () => void;
  onUpdateSession?: (session: UserSession) => void;
}

export const CocinaPage: React.FC<CocinaPageProps> = ({ session, onLogout, onUpdateSession }) => {
  // RN-20, RN-82: Mantener la sesión vigente mientras la pantalla de comandas esté abierta, renovando el token cada 20 minutos con /api/auth/renovar
  useEffect(() => {
    const INTERVALO_MS = 20 * 60 * 1000; // 20 minutos
    const intervalId = setInterval(async () => {
      try {
        const nuevoToken = await renovarTokenService(session.token);
        if (nuevoToken && onUpdateSession) {
          onUpdateSession({ ...session, token: nuevoToken });
        }
      } catch (err: unknown) {
        console.warn('Error al renovar token periódico de cocina:', err);
        const errorObj = err as { status?: number; message?: string };
        if (
          (errorObj?.status === 401 ||
            errorObj?.message?.toLowerCase().includes('sesión expiró') ||
            errorObj?.message?.toLowerCase().includes('vencida')) &&
          onLogout
        ) {
          onLogout();
        }
      }
    }, INTERVALO_MS);

    return () => clearInterval(intervalId);
  }, [session, onLogout, onUpdateSession]);

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
  const [avisoDeshacer, setAvisoDeshacer] = useState<AvisoDeshacerInfo | null>(null);
  const avisoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detección de primera carga y notificación de comanda nueva
  const esPrimeraCargaRef = useRef<boolean>(true);
  const [notificacionNueva, setNotificacionNueva] = useState<{
    pedidoNumero: number;
    destino: string;
    itemsCount: number;
    hora?: string;
  } | null>(null);

  // Desbloqueo de AudioContext ante interacción del usuario en la pantalla
  useEffect(() => {
    const handleInteraccion = () => {
      desbloquearAudioKds();
    };
    window.addEventListener('click', handleInteraccion, { passive: true });
    window.addEventListener('touchstart', handleInteraccion, { passive: true });
    window.addEventListener('keydown', handleInteraccion, { passive: true });
    return () => {
      window.removeEventListener('click', handleInteraccion);
      window.removeEventListener('touchstart', handleInteraccion);
      window.removeEventListener('keydown', handleInteraccion);
    };
  }, []);

  // Procesando estado por comanda (RV-89)
  const [procesandoIds, setProcesandoIds] = useState<Record<string, boolean>>({});

  // Temporizador de refresco (RNF-31: cada 5 segundos)
  const [segundosDesdeActualizacion, setSegundosDesdeActualizacion] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerSegundosRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Estabilidad de interacción táctil (RV-94)
  const tocandoTarjetaRef = useRef<boolean>(false);

  const toggleSonido = () => {
    const nuevo = !sonidoActivado;
    setSonidoActivado(nuevo);
    localStorage.setItem('kds_sonido_activado', String(nuevo));
    if (nuevo) {
      desbloquearAudioKds();
      reproducirSonidoKds('pendiente', true);
    }
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
          if (!comandasPreviasRef.current.has(c.id) && c.estado === 'Pendiente') {
            nuevasEncontradas[c.id] = true;
            huboNuevas = true;
          }
        });

        if (esPrimeraCargaRef.current) {
          esPrimeraCargaRef.current = false;
        } else if (huboNuevas) {
          reproducirSonidoKds('pendiente', sonidoActivado);
          setComandasNuevas((prev) => ({ ...prev, ...nuevasEncontradas }));

          // Mostrar notificación flotante prominente
          const primeraNueva = res.items.find((c) => nuevasEncontradas[c.id]);
          if (primeraNueva) {
            const destinoStr =
              primeraNueva.tipo === 'Mesa'
                ? primeraNueva.mesa || 'Mesa'
                : `Para llevar${primeraNueva.referencia ? ` (${primeraNueva.referencia})` : ''}`;

            setNotificacionNueva({
              pedidoNumero: primeraNueva.pedidoNumero,
              destino: destinoStr,
              itemsCount: primeraNueva.lineas.reduce((acc, l) => acc + l.cantidad, 0),
              hora: primeraNueva.horaLlegada,
            });
          }

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
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          onLogout();
          return;
        }
        if (status === 403) {
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
    [session.token, sonidoActivado, onLogout]
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
          if (avisoTimerRef.current) clearInterval(avisoTimerRef.current);
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

      // Sonido para cuando pase a preparación
      reproducirSonidoKds('preparacion', sonidoActivado);

      // Actualizar estado local inmediatamente
      setComandas((prev) =>
        prev.map((c) => (c.id === comanda.id ? { ...c, estado: 'EnPreparacion' } : c))
      );

      // Activar aviso de 10s con DESHACER (RV-88 / MSG-126)
      setAvisoDeshacer({
        comandaId: comanda.id,
        pedidoNumero: comanda.pedidoNumero,
        mensaje: res.mensaje || `Comanda N.º ${comanda.pedidoNumero} en preparación.`,
        segundosRestantes: 10,
      });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'No se pudo iniciar la preparación de la comanda.');
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

      // Sonido para cuando pase a Listo
      reproducirSonidoKds('lista', sonidoActivado);

      // Las comandas listas salen de la pantalla (RN-81)
      setComandas((prev) => prev.filter((c) => c.id !== comanda.id));

      // Activar aviso de 10s con DESHACER (RV-88 / MSG-127)
      setAvisoDeshacer({
        comandaId: comanda.id,
        pedidoNumero: comanda.pedidoNumero,
        mensaje: res.mensaje || `Comanda N.º ${comanda.pedidoNumero} marcada como lista.`,
        segundosRestantes: 10,
      });

      // Refrescar resumen superior de por preparar
      cargarComandas(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'No se pudo marcar la comanda como lista.');
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
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'No se pudo deshacer el cambio de comanda.');
      cargarComandas(true);
    }
  };

  // Separar en Pendientes y En Preparación (RV-85)
  const comandasPendientes = comandas.filter((c) => c.estado === 'Pendiente');
  const comandasEnPreparacion = comandas.filter((c) => c.estado === 'EnPreparacion');

  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[1600px]" className="lg:px-8 2xl:px-10 bg-canvas text-neutral-900 select-none">
        {/* Franja superior de desconexión (MSG-132) */}
        <CocinaDesconexionBanner
          sinConexion={sinConexion}
          segundosSinConexion={segundosSinConexion}
          onReintentar={() => cargarComandas(false)}
        />

        {/* 1. Encabezado Unificado */}
        <PageHeader
          title="Cocina (KDS)"
          subtitle="Gestión operativa de comandas de cocina y despacho de pedidos en tiempo real."
          count={resumen.reduce((acc, r) => acc + r.cantidad, 0)}
          countLabel="porciones por preparar"
          actions={
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {/* Botón PLATOS AGOTADOS */}
              <button
                type="button"
                onClick={() => setAbrirModalPlatosAgotados(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-accent text-xs font-semibold flex items-center gap-2 border border-amber-200 shadow-2xs transition-all cursor-pointer min-h-[40px]"
                title="Abrir disponibilidad de platos del menú"
              >
                <UtensilsCrossed className="w-4 h-4 text-accent" />
                <span>Platos agotados</span>
              </button>

              {/* Botón SONIDO */}
              <button
                type="button"
                onClick={toggleSonido}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer min-h-[40px] shadow-2xs ${
                  sonidoActivado
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-surface text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
                title="Activar o desactivar sonido de nueva comanda"
              >
                {sonidoActivado ? (
                  <>
                    <Volume2 className="w-4 h-4 text-success" />
                    <span>Sonido: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-neutral-500" />
                    <span>Sonido: OFF</span>
                  </>
                )}
              </button>

              {/* Contador y Actualizar Manual */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 tabular-nums hidden sm:inline">
                  Actualizado hace <span className="font-semibold text-neutral-700">{segundosDesdeActualizacion}</span> s
                </span>
                <button
                  type="button"
                  onClick={() => cargarComandas(false)}
                  disabled={cargando}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
                  title="Actualizar comandas manualmente"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
          }
        />

        {/* Banda Superior "Por preparar" (RV-86, Nielsen 8) */}
        <CocinaResumenBar resumen={resumen} />

        {/* Contenido Principal: Zonas "Pendientes" y "En preparación" (RV-85) */}
        <CocinaZonasBoard
          cargando={cargando}
          comandas={comandas}
          errorCarga={errorCarga}
          onReintentar={() => cargarComandas(false)}
          comandasPendientes={comandasPendientes}
          comandasEnPreparacion={comandasEnPreparacion}
          comandasNuevas={comandasNuevas}
          procesandoIds={procesandoIds}
          onIniciarPreparacion={handleIniciarPreparacion}
          onMarcarComoLista={handleMarcarComoLista}
          tocandoTarjetaRef={tocandoTarjetaRef}
        />

        {/* Aviso Inferior Flotante con Botón DESHACER (RV-88, RN-78, RN-79 - 10s) */}
        <CocinaAvisoDeshacer aviso={avisoDeshacer} onDeshacer={handleDeshacer} />

        {/* Modal emergente de NUEVA COMANDA (CUS10 / RV-92) */}
        <AvisoNuevoPedidoCocinaModal
          aviso={notificacionNueva}
          onCerrar={() => setNotificacionNueva(null)}
        />

        {/* Modal PLATOS AGOTADOS (CUS05.2 / RN-83) */}
        <PlatosAgotadosModal
          isOpen={abrirModalPlatosAgotados}
          onClose={() => setAbrirModalPlatosAgotados(false)}
          token={session.token}
        />
      </PageContainer>
    </div>
  );
};

export default CocinaPage;
