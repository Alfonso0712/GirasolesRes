import React, { useState, useEffect } from 'react';
import { CalendarCheck, RefreshCw, AlertTriangle, Search, UtensilsCrossed } from 'lucide-react';
import { menuDiaService } from '../../services/menuDiaService';
import type { PlatoMenuDiaDto } from '../../services/menuDiaService';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { useToast } from '../../context/ToastContext';
import { pluralizar } from '../../utils/format';

export const MenuDiaView: React.FC = () => {
  const [platos, setPlatos] = useState<PlatoMenuDiaDto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'disponibles' | 'agotados'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [platoParaAgotar, setPlatoParaAgotar] = useState<PlatoMenuDiaDto | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const cargarPlatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await menuDiaService.obtenerMenuHoy();
      setPlatos(data.platos || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar el menú del día';
      setError(msg);
      setPlatos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlatos();
  }, []);

  const ejecutarCambioDisponibilidad = async (plato: PlatoMenuDiaDto, nuevoAgotado: boolean) => {
    triggerLight();
    setProcesandoId(plato.productoId);

    // Optimistic UI update
    setPlatos((prev) =>
      prev.map((p) => (p.productoId === plato.productoId ? { ...p, agotado: nuevoAgotado } : p))
    );

    try {
      await menuDiaService.cambiarDisponibilidad(plato.productoId, nuevoAgotado);
      triggerSuccess();
      if (nuevoAgotado) {
        mostrar({
          tipo: 'aviso',
          mensaje: `Plato marcado como agotado: ${plato.nombre}`,
        });
      } else {
        mostrar({
          tipo: 'exito',
          mensaje: `Plato reactivado correctamente: ${plato.nombre}`,
        });
      }
    } catch {
      triggerError();
      // Revertir en caso de error
      setPlatos((prev) =>
        prev.map((p) => (p.productoId === plato.productoId ? { ...p, agotado: plato.agotado } : p))
      );
      mostrar({
        tipo: 'error',
        mensaje: `No se pudo actualizar la disponibilidad de ${plato.nombre}`,
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const handleToggleDisponibilidad = (plato: PlatoMenuDiaDto) => {
    if (!plato.agotado) {
      // Marcar como agotado requiere confirmación
      setPlatoParaAgotar(plato);
    } else {
      // Reactivar plato no requiere confirmación
      void ejecutarCambioDisponibilidad(plato, false);
    }
  };

  const handleConfirmarAgotado = async () => {
    if (!platoParaAgotar) return;
    const plato = platoParaAgotar;
    setPlatoParaAgotar(null);
    await ejecutarCambioDisponibilidad(plato, true);
  };

  const platosFiltrados = platos.filter((p) => {
    if (filtro === 'disponibles' && p.agotado) return false;
    if (filtro === 'agotados' && !p.agotado) return false;
    if (busqueda.trim() && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalAgotados = platos.filter((p) => p.agotado).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* 1. Header Fijo */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Control de Platos (Cocina)</h2>
            <p className="text-xs text-ink-muted">
              {totalAgotados > 0
                ? pluralizar(totalAgotados, 'plato agotado', 'platos agotados')
                : 'Todos los platos disponibles'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPlatos}
          disabled={cargando}
          aria-label="Actualizar platos"
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-accent' : ''}`} />
        </button>
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="p-4 space-y-3 bg-surface border-b border-line shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato en el menú de hoy..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-canvas text-xs focus:outline-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'todos' as const, label: `Todos (${platos.length})` },
            { id: 'disponibles' as const, label: `Disponibles (${platos.length - totalAgotados})` },
            { id: 'agotados' as const, label: `Agotados (${totalAgotados})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                triggerLight();
                setFiltro(f.id);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                filtro === f.id ? 'bg-primary text-white shadow-xs' : 'bg-canvas text-ink-muted border border-line'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Platos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarPlatos}
            className="my-4"
          />
        )}

        {!error && !cargando && platos.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            titulo="Menú no registrado"
            subtitulo="No se ha registrado el menú del día de hoy. Solicite al administrador o cajero que lo defina en el sistema web."
          />
        )}

        {platosFiltrados.map((plato) => {
          const estaAgotado = plato.agotado;
          const procesando = procesandoId === plato.productoId;

          return (
            <div
              key={plato.productoId}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs select-none ${
                estaAgotado
                  ? 'bg-danger-bg/40 border-danger-border/70'
                  : 'bg-surface border-line'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-base font-extrabold ${
                      estaAgotado ? 'text-danger line-through opacity-80' : 'text-ink'
                    }`}
                  >
                    {plato.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted font-semibold bg-canvas px-2 py-0.5 rounded-lg border border-line">
                    {plato.categoria}
                  </span>
                  {estaAgotado && (
                    <span className="text-xs font-bold text-danger uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Agotado</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Botón táctil grande tipo switch de cocina */}
              <button
                type="button"
                disabled={procesando}
                onClick={() => handleToggleDisponibilidad(plato)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-transform active:scale-95 min-h-[44px] shrink-0 border ${
                  estaAgotado
                    ? 'bg-danger text-white border-danger shadow-xs'
                    : 'bg-canvas text-ink border-line hover:border-danger hover:text-danger'
                }`}
              >
                {procesando ? 'Actualizando...' : estaAgotado ? 'Marcar Disponible' : 'Marcar Agotado'}
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmSheet
        isOpen={Boolean(platoParaAgotar)}
        titulo="Marcar plato agotado"
        mensaje={`¿Confirmar que el plato '${platoParaAgotar?.nombre}' se encuentra agotado? No podrá ser seleccionado en nuevos pedidos.`}
        etiquetaConfirmar="Marcar Agotado"
        tono="peligro"
        cargando={Boolean(procesandoId && platoParaAgotar)}
        onConfirmar={handleConfirmarAgotado}
        onCancelar={() => setPlatoParaAgotar(null)}
      />
    </div>
  );
};
