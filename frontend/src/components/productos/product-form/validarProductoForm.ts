import type { TipoProducto, CategoriaProducto, RolComponente } from '../../../types/producto';
import { normalizeText } from '../../../utils/normalizeText';

export interface ValidarProductoParams {
  nombre: string;
  tipo: TipoProducto;
  categoria: CategoriaProducto;
  rol: RolComponente;
  precioStr: string;
}

export function validarProductoForm({
  nombre,
  tipo,
  categoria,
  rol,
  precioStr,
}: ValidarProductoParams): Record<string, string> {
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

  return nuevosErrores;
}
