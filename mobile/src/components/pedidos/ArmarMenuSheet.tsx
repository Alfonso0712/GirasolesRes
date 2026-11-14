import React, { useState, useEffect } from 'react';
import { Utensils, Check, ArrowLeft, ArrowRight, PlusCircle } from 'lucide-react';
import type { MenuCompletoDiaDto } from '../../types/menuDia';
import type { LineaBorrador } from '../../types/pedido';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';

export interface ArmarMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuCompletoDiaDto | null;
  onAgregar: (linea: LineaBorrador) => void;
  esMozo?: boolean;
}

export const ArmarMenuSheet: React.FC<ArmarMenuSheetProps> = ({
  isOpen,
  onClose,
  menu,
  onAgregar,
  esMozo = false,
}) => {
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [elecciones, setElecciones] = useState<Record<string, { productoId: string; productoNombre: string }>>({});
  const [observacion, setObservacion] = useState<string>('');

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  useEffect(() => {
    if (isOpen && menu) {
      setPasoActual(0);
      setElecciones({});
      setObservacion('');
    }
  }, [isOpen, menu]);

  if (!isOpen || !menu) return null;

  const partes = [...menu.partes].sort((a, b) => a.orden - b.orden);
  const totalPartes = partes.length;
  const parteActual = partes[pasoActual];

  if (!parteActual) return null;

  const eleccionActual = elecciones[parteActual.nombre];
  const esUltimoPaso = pasoActual === totalPartes - 1;

  const handleSeleccionarOpcion = (productoId: string, productoNombre: string, agotado: boolean) => {
    if (agotado) {
      triggerError();
      return;
    }
    triggerLight();
    setElecciones((prev) => ({
      ...prev,
      [parteActual.nombre]: { productoId, productoNombre },
    }));
  };

  const handleSiguiente = () => {
    if (!eleccionActual) {
      triggerError();
      return;
    }
    triggerLight();
    if (esUltimoPaso) {
      // Completar y armar línea de comanda
      const listaElecciones = partes.map((p) => ({
        parte: p.nombre,
        productoId: elecciones[p.nombre].productoId,
        productoNombre: elecciones[p.nombre].productoNombre,
      }));

      const nuevaLinea: LineaBorrador = {
        id: `menu-${menu.id}-${Date.now()}`,
        menuCompletoId: menu.id,
        nombre: menu.nombre,
        incluye: menu.incluye,
        precioUnitario: menu.precio,
        cantidad: 1,
        observacion: observacion.trim(),
        subtotal: menu.precio,
        elecciones: listaElecciones,
      };

      triggerSuccess();
      onAgregar(nuevaLinea);
      onClose();
    } else {
      setPasoActual((prev) => prev + 1);
    }
  };

  const handleAtras = () => {
    triggerLight();
    if (pasoActual > 0) {
      setPasoActual((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Paso ${pasoActual + 1} de ${totalPartes}`}
    >
      <div className="space-y-4">
        {/* Encabezado del Menú Completo */}
        <div className="bg-canvas border border-line rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                {menu.nombre}
              </span>
              <p className="text-xs text-ink-muted">
                {parteActual.nombre}
              </p>
            </div>
          </div>
          {!esMozo ? (
            <span className="text-base font-black text-accent tabular-nums">
              {formatCurrency(menu.precio)}
            </span>
          ) : (
            <span className="text-xs font-bold text-ink-muted bg-surface border border-line px-2 py-1 rounded-lg">
              Menú Completo
            </span>
          )}
        </div>

        {/* Indicador visual de pasos */}
        <div className="flex gap-1.5">
          {partes.map((p, idx) => (
            <div
              key={p.id}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === pasoActual
                  ? 'bg-primary'
                  : idx < pasoActual
                  ? 'bg-success'
                  : 'bg-line'
              }`}
            />
          ))}
        </div>

        {/* Lista de opciones disponibles para esta parte */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {parteActual.opciones.map((opc) => {
            const seleccionada = eleccionActual?.productoId === opc.productoId;
            const agotada = opc.agotado;

            return (
              <Card
                key={opc.productoId}
                accent="none"
                padding="sm"
                interactive={!agotada}
                onClick={!agotada ? () => handleSeleccionarOpcion(opc.productoId, opc.nombre, agotada) : undefined}
                className={`flex items-center justify-between select-none min-h-[52px] ${
                  seleccionada
                    ? 'border-primary bg-primary/5 text-primary'
                    : agotada
                    ? 'opacity-50 bg-canvas'
                    : 'bg-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      seleccionada
                        ? 'border-primary bg-primary text-white'
                        : 'border-line bg-canvas'
                    }`}
                  >
                    {seleccionada && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  </div>
                  <span className={`text-sm font-bold leading-snug break-words min-w-0 ${seleccionada ? 'text-primary' : 'text-ink'}`}>
                    {opc.nombre}
                  </span>
                </div>

                {agotada && (
                  <span className="text-xs font-bold text-danger bg-danger-bg border border-danger-border px-2 py-0.5 rounded-md shrink-0">
                    Agotado
                  </span>
                )}
              </Card>
            );
          })}
        </div>

        {/* Campo de nota en el último paso */}
        {esUltimoPaso && (
          <div className="pt-2 border-t border-line space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="obs-menu" className="font-bold text-ink-muted">
                Nota para cocina (opcional):
              </label>
              <span className="text-ink-muted">{observacion.length}/100</span>
            </div>
            <input
              id="obs-menu"
              type="text"
              maxLength={100}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Sin ensalada, bien cocido..."
              className="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary"
            />
          </div>
        )}

        {/* Botones de Navegación del Asistente */}
        <div className="flex gap-2.5 pt-2">
          <Button
            size="md"
            variant="outline"
            onClick={handleAtras}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{pasoActual > 0 ? 'Atrás' : 'Cancelar'}</span>
          </Button>

          <Button
            size="md"
            variant="primary"
            disabled={!eleccionActual}
            onClick={handleSiguiente}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            {esUltimoPaso ? (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Agregar al pedido</span>
              </>
            ) : (
              <>
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
