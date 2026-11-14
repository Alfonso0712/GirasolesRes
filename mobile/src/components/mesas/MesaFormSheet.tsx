import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import { normalizeText, canonicalizarMesa } from '../../utils/canonico';
import { BottomSheet } from '../ui/BottomSheet';
import { SheetActions } from '../ui/SheetActions';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export interface MesaFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mesaAEditar?: MesaItem | null;
  todasLasMesas?: MesaItem[];
  onSave: (nombre: string) => Promise<void>;
}

export const MesaFormSheet: React.FC<MesaFormSheetProps> = ({
  isOpen,
  onClose,
  mesaAEditar,
  todasLasMesas = [],
  onSave,
}) => {
  const isEdit = Boolean(mesaAEditar);
  const { sinConexion } = useNetworkStatus();
  const [nombre, setNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNombre(mesaAEditar?.nombre || '');
      setErrorNombre(null);
      setGuardando(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mesaAEditar]);

  const handleBlur = () => {
    const limpio = normalizeText(nombre);
    setNombre(limpio);
    if (errorNombre) {
      validar(limpio);
    }
  };

  const validar = (valor: string): boolean => {
    const limpio = normalizeText(valor);

    // RV-51: Obligatorio
    if (!limpio) {
      setErrorNombre('Ingrese el número o nombre de la mesa.');
      return false;
    }

    // RV-51: Longitud 1 a 20 caracteres y caracteres permitidos
    if (limpio.length < 1 || limpio.length > 20) {
      setErrorNombre('El nombre de la mesa debe tener entre 1 y 20 caracteres.');
      return false;
    }

    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.]+$/;
    if (!regex.test(limpio)) {
      setErrorNombre('El nombre de la mesa debe tener entre 1 y 20 caracteres.');
      return false;
    }

    // RV-52: Unicidad canonicalizada
    const canonNuevo = canonicalizarMesa(limpio);
    const duplicada = todasLasMesas.some((m) => {
      if (isEdit && m.id === mesaAEditar?.id) return false;
      return canonicalizarMesa(m.nombre) === canonNuevo;
    });

    if (duplicada) {
      setErrorNombre('Esa mesa ya está registrada. Use otro número o nombre.');
      return false;
    }

    setErrorNombre(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = normalizeText(nombre);
    setNombre(limpio);

    if (!validar(limpio)) {
      inputRef.current?.focus();
      return;
    }

    setGuardando(true);
    try {
      await onSave(limpio);
      onClose();
    } catch (err: unknown) {
      setGuardando(false);
      const msg = err instanceof Error ? err.message : 'No se pudo completar la operación. Intente nuevamente.';
      setErrorNombre(msg);
      inputRef.current?.focus();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Mesa' : 'Nueva Mesa'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label htmlFor="nombre-mesa-input" className="block text-xs font-bold text-ink-muted mb-1.5">
            Nombre o número de la mesa
          </label>
          <div className="relative">
            <input
              id="nombre-mesa-input"
              ref={inputRef}
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errorNombre) setErrorNombre(null);
              }}
              onBlur={handleBlur}
              placeholder="Ej. Mesa 1, Terraza A, Barra"
              maxLength={20}
              disabled={guardando}
              aria-invalid={Boolean(errorNombre)}
              aria-describedby={errorNombre ? 'error-nombre-mesa' : undefined}
              className={`w-full px-3.5 py-3 rounded-xl border bg-canvas text-ink text-sm font-semibold placeholder:text-ink-muted/50 focus:outline-hidden focus:ring-2 transition-all ${
                errorNombre
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-line focus:border-accent focus:ring-accent/20'
              }`}
            />
            <span className="absolute right-3 top-3.5 text-xs font-semibold text-ink-muted tabular-nums">
              {nombre.length}/20
            </span>
          </div>

          {errorNombre && (
            <div
              id="error-nombre-mesa"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-xs text-danger font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorNombre}</span>
            </div>
          )}

          <p className="mt-1.5 text-xs text-ink-muted">
            Permite letras, números, guiones y puntos (máximo 20 caracteres).
          </p>
        </div>

        <SheetActions
          secondaryLabel="Cancelar"
          primaryLabel={sinConexion ? 'Sin conexión' : 'Guardar'}
          primaryType="submit"
          primaryVariant="primary"
          isLoading={guardando}
          primaryDisabled={guardando || sinConexion}
          secondaryDisabled={guardando}
          primaryTitle={sinConexion ? 'Sin conexión a internet' : undefined}
          onSecondary={onClose}
        />
      </form>
    </BottomSheet>
  );
};
