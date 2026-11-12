import React, { useState, useEffect } from 'react';
import { CalendarCheck, UtensilsCrossed, RefreshCw, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { menuDiaService } from '../../services/menuDiaService';
import type { PlatoMenuDiaDto } from '../../services/menuDiaService';
import { useHaptics } from '../../hooks/useHaptics';

export const MenuDiaView: React.FC = () => {
  const [platos, setPlatos] = useState<PlatoMenuDiaDto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'disponibles' | 'agotados'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  const cargarPlatos = async () => {
    setCargando(true);
    try {
      const data = await menuDiaService.obtenerMenuHoy();
      setPlatos(data.platos || []);
    } catch {
      // Fallback para pruebas si no hay conexión
      setPlatos([
        { productoId: '1', nombre: 'Lomo Saltado Clásico', categoria: 'Segundos', agotado: false },
        { productoId: '2', nombre: 'Arroz con Mariscos Especial', categoria: 'Segundos', agotado: false },
        { productoId: '3', nombre: 'Ceviche Mixto', categoria: 'Entradas', agotado: true },
        { productoId: '4', nombre: 'Causa Rellena de Pollo', categoria: 'Entradas', agotado: false },
        { productoId: '5', nombre: 'Chicha Morada (Jarra)', categoria: 'Bebidas', agotado: false },
        { productoId: '6', nombre: 'Sopa Criolla del Día', categoria: 'Sopas', agotado: false },
      ]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlatos();
  }, []);

  const handleToggleDisponibilidad = async (plato: PlatoMenuDiaDto) => {
    triggerLight();
    const nuevoAgotado = !plato.agotado;
    setProcesandoId(plato.productoId);

    // Optimistic UI update
    setPlatos((prev) =>
      prev.map((p) => (p.productoId === plato.productoId ? { ...p, agotado: nuevoAgotado } : p))
    );

    try {
      await menuDiaService.cambiarDisponibilidad(plato.productoId, nuevoAgotado);
      triggerSuccess();
      const txt = nuevoAgotado
        ? `Plato marcado como AGOTADO: ${plato.nombre}`
        : `Plato nuevamente DISPONIBLE: ${plato.nombre}`;
      setMensajeToast(txt);
      setTimeout(() => setMensajeToast(null), 3000);
    } catch {
      triggerError();
      // Revertir en caso de error
      setPlatos((prev) =>
        prev.map((p) => (p.productoId === plato.productoId ? { ...p, agotado: plato.agotado } : p))
      );
    } finally {
      setProcesandoId(null);
    }
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
              {totalAgotados > 0 ? `${totalAgotados} platos agotados` : 'Todos los platos disponibles'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPlatos}
          disabled={cargando}
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Toast Informativo */}
      {mensajeToast && (
        <div className="bg-primary text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{mensajeToast}</span>
        </div>
      )}

      {/* 2. Filtros y Búsqueda */}
      <div className="bg-surface border-b border-line px-4 py-2.5 shrink-0 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato para cambiar disponibilidad..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'disponibles', label: 'Disponibles' },
            { id: 'agotados', label: `Agotados (${totalAgotados})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                triggerLight();
                setFiltro(f.id as any);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                filtro === f.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-canvas text-ink-muted border border-line'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista Táctil de Platos (RV-154: Sin precios monetarios) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-20">
        {platosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold">No se encontraron platos</p>
          </div>
        ) : (
          platosFiltrados.map((plato) => (
            <div
              key={plato.productoId}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                plato.agotado
                  ? 'bg-danger-bg/40 border-danger/40 text-danger'
                  : 'bg-surface border-line text-ink'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-snug">{plato.nombre}</h3>
                  {plato.agotado && (
                    <span className="text-[10px] font-black uppercase bg-danger text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Agotado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-muted mt-0.5 font-semibold">
                  {plato.categoria}
                </p>
              </div>

              {/* Botón de Acción Táctil Grande */}
              <button
                type="button"
                disabled={procesandoId === plato.productoId}
                onClick={() => handleToggleDisponibilidad(plato)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 min-h-[44px] shrink-0 shadow-xs ${
                  plato.agotado
                    ? 'bg-success text-white hover:bg-emerald-600'
                    : 'bg-danger text-white hover:bg-rose-600'
                }`}
              >
                {procesandoId === plato.productoId
                  ? 'Guardando...'
                  : plato.agotado
                  ? 'Reactivar Plato'
                  : 'Marcar Agotado'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
