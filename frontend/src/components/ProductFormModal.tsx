import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Info, AlertCircle, Utensils, Layers, BookOpen } from 'lucide-react';
import {
  type ProductoItem,
  type TipoProducto,
  type RolComponente,
  type CategoriaProducto,
  type CrearProductoData,
  type ActualizarProductoData,
  CATEGORIAS_PRODUCTO,
  ROLES_COMPONENTE
} from '../types/producto';
import { normalizeText } from '../utils/normalizeText';
import type { ApiClientError } from '../services/apiClient';

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
  producto
}) => {
  const isEditing = !!producto;

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoProducto>('Carta');
  const [rol, setRol] = useState<RolComponente>('Segundo');
  const [categoria, setCategoria] = useState<CategoriaProducto>('Almuerzo');
  const [precioStr, setPrecioStr] = useState('');

  // Errores por campo (RV-38)
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
    const nuevosErrores: Record<string, string> = {};
    const nombreTrim = normalizeText(nombre);

    // RV-33: 3 a 50 caracteres (letras, números, espacios, tildes y . , - ( ))
    const regexNombre = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,\-\(\)]+$/;

    if (!nombreTrim) {
      nuevosErrores.nombre = 'Ingrese el nombre del producto.'; // MSG-51
    } else if (nombreTrim.length < 3 || nombreTrim.length > 50 || !regexNombre.test(nombreTrim)) {
      nuevosErrores.nombre = 'El nombre debe tener entre 3 y 50 caracteres.'; // MSG-52
    }

    // RV-155: Tipo obligatorio
    if (!tipo) {
      nuevosErrores.tipo = 'Seleccione el tipo de producto.'; // MSG-213
    } else if (tipo === 'Carta') {
      // RV-35: Categoría obligatoria para carta
      if (!categoria) {
        nuevosErrores.categoria = 'Seleccione una categoría.'; // MSG-54
      }

      // RV-36: Precio obligatorio, > 0 y <= 999.99 con hasta 2 decimales
      const precioNormalizadoStr = precioStr.trim().replace(',', '.');
      const regexDecimal = /^\d+(\.\d{1,2})?$/;

      if (!precioNormalizadoStr) {
        nuevosErrores.precio = 'Ingrese el precio.'; // MSG-55
      } else if (
        !regexDecimal.test(precioNormalizadoStr) ||
        parseFloat(precioNormalizadoStr) <= 0 ||
        parseFloat(precioNormalizadoStr) > 999.99
      ) {
        nuevosErrores.precio =
          'Ingrese un precio válido, mayor a S/ 0.00 y con hasta 2 decimales (ejemplo: 8.00).'; // MSG-56
      }
    } else {
      // RV-156: Rol obligatorio para componentes de menú
      if (!rol) {
        nuevosErrores.rol = 'Seleccione el rol del componente.'; // MSG-214
      }
    }

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
    } catch (err: any) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado fijo con marca visual */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-amber-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F4] border border-amber-900/10 flex items-center justify-center text-[#D35400]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-lg sm:text-xl font-sans font-bold text-[#2C1A0E] leading-tight"
              >
                {isEditing ? 'Editar Producto' : 'Nuevo Producto o Componente'}
              </h2>
              <p className="text-xs text-[#7C6F66]">
                {isEditing
                  ? 'Modifique el nombre, categoría, rol o precio del ítem.'
                  : 'Defina un producto independiente de carta o un componente de menú.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar ventana"
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con scroll independiente */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
            {/* Banner de error general del servidor (ej. MSG-53, MSG-216) */}
            {errorServidor && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorServidor}</span>
              </div>
            )}

            {/* Selector de Tipo de Producto (Carta vs Componente) */}
            <div>
              <label className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5">
                Tipo de producto <span className="text-[#D35400]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) setTipo('Carta');
                  }}
                  disabled={isEditing || guardando}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    tipo === 'Carta'
                      ? 'bg-white text-[#D35400] shadow-sm border border-neutral-200/60'
                      : 'text-neutral-600 hover:text-neutral-900'
                  } ${isEditing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Producto de carta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) setTipo('Componente');
                  }}
                  disabled={isEditing || guardando}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    tipo === 'Componente'
                      ? 'bg-white text-emerald-700 shadow-sm border border-neutral-200/60'
                      : 'text-neutral-600 hover:text-neutral-900'
                  } ${isEditing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Componente de menú</span>
                </button>
              </div>
              {isEditing && (
                <p className="mt-1 text-[11px] text-neutral-500 italic">
                  El tipo no se puede modificar en productos existentes para preservar el historial.
                </p>
              )}
            </div>

            {/* Campo 1: Nombre del producto (RV-33, RV-37) */}
            <div>
              <label
                htmlFor="prod-nombre"
                className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
              >
                Nombre {tipo === 'Componente' ? 'del componente' : 'del producto'}{' '}
                <span className="text-[#D35400]">*</span>
              </label>
              <input
                id="prod-nombre"
                ref={nombreInputRef}
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errores.nombre) {
                    setErrores((prev) => ({ ...prev, nombre: '' }));
                  }
                }}
                onBlur={() => setNombre(normalizeText(nombre))}
                maxLength={50}
                placeholder={
                  tipo === 'Componente'
                    ? 'Ej. Sopa a la minuta, Papa a la huancaína (Entrada)'
                    : 'Ej. Lomo saltado, Jarra de chicha morada 1L'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden ${
                  errores.nombre
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-neutral-200 bg-white text-neutral-900 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                }`}
                disabled={guardando}
              />
              {errores.nombre ? (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errores.nombre}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#7C6F66]">
                  De 3 a 50 caracteres.
                </p>
              )}
            </div>

            {/* CASO A: Producto de Carta (Categoría + Precio) */}
            {tipo === 'Carta' && (
              <>
                {/* Campo 2: Categoría de Carta (RV-35) */}
                <div>
                  <label
                    htmlFor="prod-categoria"
                    className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
                  >
                    Categoría de Carta <span className="text-[#D35400]">*</span>
                  </label>
                  <select
                    id="prod-categoria"
                    ref={categoriaSelectRef}
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value as CategoriaProducto);
                      if (errores.categoria) {
                        setErrores((prev) => ({ ...prev, categoria: '' }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden bg-white ${
                      errores.categoria
                        ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-neutral-200 text-neutral-900 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={guardando}
                  >
                    {CATEGORIAS_PRODUCTO.map((cat) => (
                      <option key={cat.valor} value={cat.valor}>
                        {cat.etiqueta} — ({cat.descripcion})
                      </option>
                    ))}
                  </select>
                  {errores.categoria && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errores.categoria}
                    </p>
                  )}
                </div>

                {/* Campo 3: Precio de Venta (RV-36 / RNF-13) */}
                <div>
                  <label
                    htmlFor="prod-precio"
                    className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
                  >
                    Precio de Venta (S/) <span className="text-[#D35400]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-semibold text-sm">
                      S/
                    </span>
                    <input
                      id="prod-precio"
                      ref={precioInputRef}
                      type="text"
                      inputMode="decimal"
                      value={precioStr}
                      onChange={(e) => {
                        setPrecioStr(e.target.value);
                        if (errores.precio) {
                          setErrores((prev) => ({ ...prev, precio: '' }));
                        }
                      }}
                      placeholder="0.00"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-sans font-medium transition-all outline-hidden ${
                        errores.precio
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                          : 'border-neutral-200 bg-white text-neutral-900 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                      }`}
                      disabled={guardando}
                    />
                  </div>

                  {errores.precio && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errores.precio}
                    </p>
                  )}

                  {/* Mensaje informativo cuando se edita el precio */}
                  {precioCambioEnEdicion && !errores.precio && (
                    <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-2 text-xs text-amber-900 animate-in fade-in duration-200">
                      <Info className="w-4 h-4 text-[#D35400] shrink-0 mt-0.5" />
                      <span>
                        El nuevo precio se aplicará solo a los pedidos nuevos. Los pedidos y ventas ya registrados no cambian.
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* CASO B: Componente de Menú (Rol + Aviso sin precio) */}
            {tipo === 'Componente' && (
              <>
                {/* Campo Rol del Componente */}
                <div>
                  <label
                    htmlFor="prod-rol"
                    className="block text-xs font-semibold text-[#2C1A0E] uppercase tracking-wider mb-1.5"
                  >
                    Rol del Componente <span className="text-[#D35400]">*</span>
                  </label>
                  <select
                    id="prod-rol"
                    ref={rolSelectRef}
                    value={rol}
                    onChange={(e) => {
                      setRol(e.target.value as RolComponente);
                      if (errores.rol) {
                        setErrores((prev) => ({ ...prev, rol: '' }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden bg-white ${
                      errores.rol
                        ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-neutral-200 text-neutral-900 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={guardando}
                  >
                    {ROLES_COMPONENTE.map((r) => (
                      <option key={r.valor} value={r.valor}>
                        {r.etiqueta} — ({r.descripcion})
                      </option>
                    ))}
                  </select>
                  {errores.rol && (
                    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errores.rol}
                    </p>
                  )}
                </div>

                {/* Aviso informativo: Sin precio individual */}
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-950">Componente incluido dentro del menú completo (sin precio individual).</p>
                    <p className="mt-0.5 text-emerald-800 leading-relaxed">
                      Los componentes no llevan precio: se integran en los menús completos (Desayuno completo, Almuerzo completo o Solo segundo) definidos por la administración.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pie de modal fijo con botones de acción */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 font-medium text-sm transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : tipo === 'Componente' ? (
                'Guardar componente'
              ) : (
                'Guardar producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
