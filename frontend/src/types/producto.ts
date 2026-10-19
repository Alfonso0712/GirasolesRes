export type CategoriaProducto =
  | 'Desayuno'
  | 'Almuerzo'
  | 'PlatosExtras'
  | 'Combinados'
  | 'Bebidas'
  | 'Otro';

export interface CategoriaOpcion {
  valor: CategoriaProducto;
  etiqueta: string;
  descripcion: string;
}

export const CATEGORIAS_PRODUCTO: CategoriaOpcion[] = [
  {
    valor: 'Desayuno',
    etiqueta: 'Desayuno',
    descripcion: 'Bebidas de desayuno y panes/acompañamientos'
  },
  {
    valor: 'Almuerzo',
    etiqueta: 'Almuerzo',
    descripcion: 'Menú del día, sopas y entradas'
  },
  {
    valor: 'PlatosExtras',
    etiqueta: 'Platos Extras / A la Carta',
    descripcion: 'Lomo saltado, ceviche, bistec, pollo a la plancha, chaufa, etc.'
  },
  {
    valor: 'Combinados',
    etiqueta: 'Combinados',
    descripcion: 'Platos compuestos como chaufa + ceviche, chaufa + alitas, etc.'
  },
  {
    valor: 'Bebidas',
    etiqueta: 'Bebidas y Refrescos',
    descripcion: 'Gaseosas personales/familiares, agua mineral, y jarras de 500 ml y 1 L'
  },
  {
    valor: 'Otro',
    etiqueta: 'Otro',
    descripcion: 'Guarniciones y adicionales'
  }
];

export const CATEGORIA_LABELS: Record<string, string> = {
  Desayuno: 'Desayuno',
  Almuerzo: 'Almuerzo',
  PlatosExtras: 'Platos Extras / A la Carta',
  'Platos Extras': 'Platos Extras / A la Carta',
  'Platos Extras / A la Carta': 'Platos Extras / A la Carta',
  Combinados: 'Combinados',
  Bebidas: 'Bebidas y Refrescos',
  'Bebidas y Refrescos': 'Bebidas y Refrescos',
  Otro: 'Otro',
  Otros: 'Otro'
};

export const CATEGORIA_BADGE_LABELS: Record<string, string> = {
  Desayuno: 'Desayuno',
  Almuerzo: 'Almuerzo',
  PlatosExtras: 'Platos Extras',
  'Platos Extras': 'Platos Extras',
  'Platos Extras / A la Carta': 'Platos Extras',
  Combinados: 'Combinados',
  Bebidas: 'Bebidas',
  'Bebidas y Refrescos': 'Bebidas',
  Otro: 'Otro',
  Otros: 'Otro'
};

export interface ProductoItem {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  activo: boolean;
}

export interface PaginacionProductos {
  items: ProductoItem[];
  total: number;
}

export interface CrearProductoData {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
}

export interface ActualizarProductoData {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
}

export interface CambiarEstadoProductoResponse {
  activo: boolean;
  retiradoDelMenu: boolean;
}
