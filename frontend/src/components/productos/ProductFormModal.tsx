import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type {
  ProductoItem,
  TipoProducto,
  RolComponente,
  CategoriaProducto,
  CrearProductoData,
  ActualizarProductoData,
} from '../../types/producto';
import { normalizeText } from '../../utils/normalizeText';
import type { ApiClientError } from '../../services/apiClient';
import {
  ProductFormHeader,
  ProductTipoSelector,
  ProductNombreField,
  ProductCartaFields,
  ProductComponenteFields,
  ProductFormFooter,
  validarProductoForm,
} from './product-form';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearProductoData | ActualizarProductoData) => Promise<void>;
  producto?: ProductoItem | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  producto,
}) => {
  const isEditing = !!producto;
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoProducto>('Carta');
  const [rol, setRol] = useState<RolComponente>('Segundo');
  const [categoria, setCategoria] = useState<CategoriaProducto>('Almuerzo');
  const [precioStr, setPrecioStr] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  // Referencias para accesibilidad y foco (RV-38 / RNF-13)
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nombreInputRef = useRef<HTMLInputElement | null>(null);
  const rolSelectRef = useRef<HTMLSelectElement | null>(null);
  const categoriaSelectRef = useRef<HTMLSelectElement | null>(null);
  const precioInputRef = useRef<HTMLInputElement | null>(null);

  // Inicializar campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (producto) {
        setNombre(producto.nombre);
        setTipo(producto.tipo || 'Carta');
        setRol(producto.rol || 'Segundo');
        setCategoria(producto.categoria || 'Almuerzo');
        setPrecioStr(producto.precio != null ? producto.precio.toFixed(2) : '');
      } else {
        setNombre('');
        setTipo('Carta');
        setRol('Segundo');
        setCategoria('Almuerzo');
        setPrecioStr('');
      }
      setErrores({});
      setErrorServidor(null);
      setGuardando(false);

      // Foco automático en el campo Nombre (RV-38)
      setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, producto]);

  // Trampa de foco (Focus Trap) y cierre con Escape (Shneiderman / WCAG)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!guardando) onClose();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, guardando]);

  if (!isOpen) return null;

  // RV-42: Detectar si el precio cambió en edición para mostrar MSG-59
  const precioNumericoActual = parseFloat(precioStr.replace(',', '.')) || 0;
  const precioCambioEnEdicion =
    isEditing &&
    tipo === 'Carta' &&
    producto &&
    producto.precio != null &&
    !isNaN(precioNumericoActual) &&
    precioNumericoActual > 0 &&
    precioNumericoActual !== producto.precio;

  // Validación local antes de enviar (RV-33 a RV-38, RV-155, RV-156)
  const validarFormulario = (): boolean => {
    const nuevosErrores = validarProductoForm({
      nombre,
      tipo,
      categoria,
      rol,
      precioStr,
    });

    setErrores(nuevosErrores);

    // RV-38: El foco va al primer campo con error
    if (nuevosErrores.nombre) {
      nombreInputRef.current?.focus();
    } else if (nuevosErrores.categoria) {
      categoriaSelectRef.current?.focus();
    } else if (nuevosErrores.rol) {
      rolSelectRef.current?.focus();
    } else if (nuevosErrores.precio) {
      precioInputRef.current?.focus();
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return;

    if (!validarFormulario()) return;

    setGuardando(true);
    setErrorServidor(null);

    const precioFinal =
      tipo === 'Carta' ? parseFloat(precioStr.trim().replace(',', '.')) : null;

    const payload = {
      nombre: normalizeText(nombre),
      tipo,
      categoria: tipo === 'Carta' ? categoria : null,
      rol: tipo === 'Componente' ? rol : null,
      precio: precioFinal
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const apiErr = err as ApiClientError;
      if (apiErr?.errors && typeof apiErr.errors === 'object') {
        setErrores(apiErr.errors);
        if (apiErr.errors.nombre) nombreInputRef.current?.focus();
        else if (apiErr.errors.tipo) modalRef.current?.focus();
        else if (apiErr.errors.rol) rolSelectRef.current?.focus();
        else if (apiErr.errors.categoria) categoriaSelectRef.current?.focus();
        else if (apiErr.errors.precio) precioInputRef.current?.focus();
      } else {
        // MSG-53, MSG-216 u otros mensajes devueltos por el backend
        setErrorServidor(apiErr?.message || 'No se pudo completar la operación. Intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado fijo con marca visual */}
        <ProductFormHeader
          isEditing={isEditing}
          onClose={onClose}
          guardando={guardando}
        />

        {/* Formulario con scroll independiente */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 scroll-thin">
            {/* Banner de error general del servidor (ej. MSG-53, MSG-216) */}
            {errorServidor && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
                <span>{errorServidor}</span>
              </div>
            )}

            {/* Selector de Tipo de Producto (Carta vs Componente) */}
            <ProductTipoSelector
              tipo={tipo}
              onTipoChange={(t) => setTipo(t)}
              isEditing={isEditing}
              guardando={guardando}
            />

            {/* Campo 1: Nombre del producto (RV-33, RV-37) */}
            <ProductNombreField
              nombre={nombre}
              onNombreChange={(val) => {
                setNombre(val);
                if (errores.nombre) {
                  setErrores((prev) => ({ ...prev, nombre: '' }));
                }
              }}
              nombreInputRef={nombreInputRef}
              tipo={tipo}
              error={errores.nombre}
              guardando={guardando}
            />

            {/* CASO A: Producto de Carta (Categoría + Precio) */}
            {tipo === 'Carta' && (
              <ProductCartaFields
                categoria={categoria}
                onCategoriaChange={(cat) => {
                  setCategoria(cat);
                  if (errores.categoria) {
                    setErrores((prev) => ({ ...prev, categoria: '' }));
                  }
                }}
                categoriaSelectRef={categoriaSelectRef}
                precioStr={precioStr}
                onPrecioChange={(p) => {
                  setPrecioStr(p);
                  if (errores.precio) {
                    setErrores((prev) => ({ ...prev, precio: '' }));
                  }
                }}
                precioInputRef={precioInputRef}
                errores={errores}
                guardando={guardando}
                precioCambioEnEdicion={precioCambioEnEdicion}
              />
            )}

            {/* CASO B: Componente de Menú (Rol + Aviso sin precio) */}
            {tipo === 'Componente' && (
              <ProductComponenteFields
                rol={rol}
                onRolChange={(r) => {
                  setRol(r);
                  if (errores.rol) {
                    setErrores((prev) => ({ ...prev, rol: '' }));
                  }
                }}
                rolSelectRef={rolSelectRef}
                errores={errores}
                guardando={guardando}
              />
            )}
          </div>

          {/* Pie de modal fijo con botones de acción */}
          <ProductFormFooter
            onClose={onClose}
            guardando={guardando}
            isEditing={isEditing}
            tipo={tipo}
          />
        </form>
      </div>
    </div>
  );
};

