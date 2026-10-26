export type TipoSonidoKds = 'pendiente' | 'preparacion' | 'lista';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  return sharedAudioCtx;
}

/**
 * Desbloquea el contexto de audio del navegador ante cualquier interacción de usuario
 */
export function desbloquearAudioKds(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch((err) => {
      console.warn('No se pudo reanudar AudioContext:', err);
    });
  }
}

/**
 * Reproduce un sonido sintetizado con Web Audio API según el evento de cocina:
 * - 'pendiente': Campana doble nítida al entrar nueva comanda
 * - 'preparacion': Tono dinámico ascendente al iniciar preparación
 * - 'lista': Acorde alegre de 3 notas de servicio al marcar como lista
 */
export function reproducirSonidoKds(tipo: TipoSonidoKds, activado = true): void {
  if (!activado) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    if (tipo === 'pendiente') {
      // 1. PENDIENTE: Campana doble de cocina (Ding-Dong / G5 784Hz -> C6 1046.5Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, t);
      gain1.gain.setValueAtTime(0.28, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.22);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, t + 0.16);
      gain2.gain.setValueAtTime(0.32, t + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.16);
      osc2.stop(t + 0.58);
    } else if (tipo === 'preparacion') {
      // 2. PREPARACIÓN: Tono dinámico de inicio en fogón (440Hz -> 587Hz en onda suave)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(587.33, t + 0.18);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    } else if (tipo === 'lista') {
      // 3. LISTO: Acorde de servicio listo (C5: 523.25, E5: 659.25, G5: 784.00)
      const notas = [523.25, 659.25, 784.0];
      notas.forEach((freq, idx) => {
        const start = t + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    }
  } catch (err) {
    console.warn('Error al reproducir sonido KDS:', err);
  }
}
