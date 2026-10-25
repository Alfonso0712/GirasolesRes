import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface NotaObservacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoNombre: string;
  observacionActual: string;
  onGuardar: (nuevaObservacion: string) => void;
}

const NOTAS_RAPIDAS = [
  'Presa de pechuga',
  'Presa de pescado',
  'Sin ensalada',
  'Sin picante',
  'Poco arroz',
  'Bien caliente',
  'Para compartir',
  'Salsa aparte'
];

export const NotaObservacionModal: React.FC<NotaObservacionModalProps> = ({
  isOpen,
  onClose,
  productoNombre,
  observacionActual,
  onGuardar,
}) => {
  const [nota, setNota] = useState(observacionActual);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNota(observacionActual);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, observacionActual]);

  if (!isOpen) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (nota.length > 100) return;
    onGuardar(nota.trim());
    onClose();
  };

  const agregarNotaRapida = (frase: string) => {
    if (nota.length + frase.length + 2 <= 100) {
      setNota((prev) => (prev ? `${prev.trim()}, ${frase}` : frase));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nota-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80">
        {/* Encabezado fijo */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex justify-between items-center bg-canvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-nota-title" className="text-xl font-sans font-bold text-ink">
                Nota para {productoNombre}
              </h2>
              <p className="text-xs text-ink-muted">
                Indique preferencias o detalles para la preparación en cocina.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal de nota"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll independiente */}
        <form onSubmit={handleGuardar} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label htmlFor="observacion-input" className="form-label-standard">
                Observación (máx. 100 caracteres)
              </label>
              <textarea
                id="observacion-input"
                ref={inputRef}
                value={nota}
                onChange={(e) => setNota(e.target.value.slice(0, 100))}
                rows={3}
                placeholder="Ej. presa de pescado, término medio..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none transition-all"
              />
              <div className="flex justify-between items-center mt-1 text-xs">
                <span className="text-ink-muted">Opcional</span>
                <span className={`tabular-nums ${nota.length >= 95 ? 'text-danger font-bold' : 'text-neutral-500'}`}>
                  {nota.length} / 100
                </span>
              </div>
            </div>

            {/* Sugerencias rápidas */}
            <div>
              <span className="block text-xs font-semibold text-neutral-500 mb-2">
                Atajos frecuentes para el mozo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NOTAS_RAPIDAS.map((frase) => (
                  <button
                    key={frase}
                    type="button"
                    onClick={() => agregarNotaRapida(frase)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-amber-50 hover:text-accent text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
                  >
                    + {frase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pie con botones */}
          <div className="shrink-0 p-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-primary hover:bg-primary-hover text-white font-medium"
            >
              <Check className="w-4 h-4 mr-1.5 inline" />
              Guardar Nota
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

