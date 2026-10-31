import { useState, useEffect, useRef, useCallback } from 'react';
import { pedidoService } from '../services/pedidoService';
import { comandaService } from '../services/comandaService';
import { desbloquearAudioKds, reproducirSonidoKds } from '../utils/audioKds';
import type { UserSession } from '../types/auth';
import type { AvisoComandaDto } from '../types/pedido';
import type { NuevoPedidoCocinaInfo } from '../components/cocina';

export interface UseKitchenNotificationsProps {
  session: UserSession;
  paginaActiva: string;
}

export function useKitchenNotifications({ session, paginaActiva }: UseKitchenNotificationsProps) {
  // Desbloqueo de AudioContext ante cualquier interacción de usuario en la app
  useEffect(() => {
    const handleGlobalInteraction = () => {
      desbloquearAudioKds();
    };
    window.addEventListener('click', handleGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });
    window.addEventListener('keydown', handleGlobalInteraction, { passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
    };
  }, []);

  // CUS09.3: Avisos de comandas listas para recoger (HU27 / RF-27 / RN-71)
  const [avisosPendientes, setAvisosPendientes] = useState<AvisoComandaDto[]>([]);
  const [cerrandoAviso, setCerrandoAviso] = useState(false);
  const avisosPreviosRef = useRef<Set<string>>(new Set());

  // Sondeo cada 5 segundos para avisos de pedidos listos
  const consultarAvisos = useCallback(async () => {
    if (session.rol !== 'Mozo' && session.rol !== 'Cajero' && session.rol !== 'Administrador') return;
    try {
      const data = await pedidoService.obtenerAvisosPendientes(session.token);
      if (Array.isArray(data)) {
        setAvisosPendientes(data);
        const hayNuevos = data.some((a) => !avisosPreviosRef.current.has(a.id));
        if (hayNuevos && avisosPreviosRef.current.size > 0) {
          reproducirSonidoKds('lista', true);
        }
        avisosPreviosRef.current = new Set(data.map((a) => a.id));
      }
    } catch (err) {
      console.warn('Error al consultar avisos de pedidos listos:', err);
    }
  }, [session.rol, session.token]);

  useEffect(() => {
    consultarAvisos();
    const interval = setInterval(consultarAvisos, 5000);
    return () => clearInterval(interval);
  }, [consultarAvisos]);

  const handleCerrarAviso = async (comandaId: string) => {
    setCerrandoAviso(true);
    try {
      await pedidoService.marcarAvisoVisto(comandaId, session.token);
      setAvisosPendientes((prev) => prev.filter((a) => a.id !== comandaId));
    } catch (err) {
      console.error('Error al marcar aviso visto:', err);
    } finally {
      setCerrandoAviso(false);
    }
  };

  // Notificación de nueva comanda para Cocinero si está fuera de la pantalla de cocina
  const comandasPreviasCocineroRef = useRef<Set<string>>(new Set());
  const primeraCargaCocineroRef = useRef<boolean>(true);
  const [avisoNuevaComandaCocinero, setAvisoNuevaComandaCocinero] = useState<NuevoPedidoCocinaInfo | null>(null);

  useEffect(() => {
    if (session.rol !== 'Cocinero' || paginaActiva === 'cocina') return;

    const verificarComandasCocinero = async () => {
      try {
        const res = await comandaService.listarComandas(session.token);
        const ids = new Set(res.items.map((c) => c.id));

        if (primeraCargaCocineroRef.current) {
          primeraCargaCocineroRef.current = false;
        } else {
          const nuevas = res.items.filter(
            (c) => !comandasPreviasCocineroRef.current.has(c.id) && c.estado === 'Pendiente'
          );
          if (nuevas.length > 0) {
            const sonidoActivado = localStorage.getItem('kds_sonido_activado') !== 'false';
            reproducirSonidoKds('pendiente', sonidoActivado);

            const n = nuevas[0];
            const destinoStr =
              n.tipo === 'Mesa' ? n.mesa || 'Mesa' : `Para llevar${n.referencia ? ` (${n.referencia})` : ''}`;
            setAvisoNuevaComandaCocinero({
              comandaId: n.id,
              pedidoNumero: n.pedidoNumero,
              destino: destinoStr,
              itemsCount: n.lineas.reduce((acc, l) => acc + l.cantidad, 0),
              hora: n.horaLlegada
            });
          }
        }
        comandasPreviasCocineroRef.current = ids;
      } catch (err) {
        console.warn('Error al verificar comandas en inicio:', err);
      }
    };

    verificarComandasCocinero();
    const interval = setInterval(verificarComandasCocinero, 5000);
    return () => clearInterval(interval);
  }, [session.rol, session.token, paginaActiva]);

  return {
    avisosPendientes,
    cerrandoAviso,
    handleCerrarAviso,
    avisoNuevaComandaCocinero,
    setAvisoNuevaComandaCocinero,
  };
}
