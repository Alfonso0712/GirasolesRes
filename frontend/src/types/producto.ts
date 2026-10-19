export type TipoProducto = 'Carta' | 'Componente';

export type RolComponente =
  | 'BebidaDesayuno'
  | 'PlatoDesayuno'
  | 'Sopa'
  | 'Entrada'
  | 'Segundo';

export interface RolComponenteOpcion {
  valor: RolComponente;
  etiqueta: string;
  descripcion: string;
}

export const ROLES_COMPONENTE: RolComponenteOpcion[] = [
  {
    valor: 'BebidaDesayuno',
    etiqueta: 'Bebida de desayuno',
    descripcion: 'Café, té, quaker con leche, quinua, jugos surtidos'
  },
  {
    valor: 'PlatoDesayuno',
    etiqueta: 'Plato de desayuno',
    descripcion: 'Panes con chicharrón, palta, huevo, salchipollo, etc.'
  },
  {
    valor: 'Sopa',
    etiqueta: 'Sopa',
    descripcion: 'Caldo de gallina (entrada), sopa a la minuta, criolla'
  },
  {
    valor: 'Entrada',
    etiqueta: 'Entrada',
    descripcion: 'Papa a la huancaína (entrada), ocopa arequipeña'
  },
  {
    valor: 'Segundo',
    etiqueta: 'Segundo',
    descripcion: 'Lomo saltado, seco de pollo/res, chaufa, bistec a lo pobre'
  }
];

export const ROL_LABELS: Record<string, string> = {
  BebidaDesayuno: 'Bebida de desayuno',
  PlatoDesayuno: 'Plato de desayuno',
  Sopa: 'Sopa',
  Entrada: 'Entrada',
  Segundo: 'Segundo'
};

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
  tipo: TipoProducto;
  rol?: RolComponente | null;
  categoria?: CategoriaProducto | null;
  precio?: number | null;
  activo: boolean;
}

export interface PaginacionProductos {
  items: ProductoItem[];
  total: number;
}

export interface CrearProductoData {
  nombre: string;
  tipo: TipoProducto;
  categoria?: CategoriaProducto | null;
  rol?: RolComponente | null;
  precio?: number | null;
}

export interface ActualizarProductoData {
  nombre: string;
  tipo: TipoProducto;
  categoria?: CategoriaProducto | null;
  rol?: RolComponente | null;
  precio?: number | null;
}

export interface CambiarEstadoProductoResponse {
  activo: boolean;
  retiradoDelMenu: boolean;
}
