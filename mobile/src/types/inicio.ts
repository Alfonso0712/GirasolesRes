export interface BloqueResultado<T> {
  estado: 'ok' | 'error';
  datos: T | null;
  error?: string | null;
}

export interface BloqueVentasHoy {
  nVentas: number;
  total: number;
  efectivo: number;
  yape: number;
}

export interface PlatoPrincipal {
  producto: string;
  cantidad: number;
}

export interface BloquePlatosHoy {
  total: number;
  principales: PlatoPrincipal[];
}

export interface BloquePedidosPorEstado {
  pendiente: number;
  enPreparacion: number;
  listo: number;
  porCobrar: number;
  pagado: number;
  anulado: number;
}

export interface BloqueMesas {
  libres: number;
  ocupadas: number;
}

export interface BloqueCajaAdmin {
  estado: 'Sin abrir' | 'Abierta' | 'Cerrada' | 'Anterior sin cerrar' | string;
  desde?: string | null;
  usuario?: string | null;
  efectivoEsperado?: number | null;
}

export interface BloqueMenuAdmin {
  definido: boolean;
  platos: number;
  agotados: number;
}

export interface BloqueUltimoCierre {
  fecha?: string | null;
  resultado?: 'Cuadra' | 'Sobrante' | 'Faltante' | string | null;
  diferencia?: number | null;
}

export interface AlertaInicio {
  tipo: string;
  texto: string;
  enlace: string;
  prioridad: number;
}

export interface InicioDashboardData {
  rol: string;
  fecha: string;
  bloques: {
    ventasHoy?: BloqueResultado<BloqueVentasHoy>;
    platosHoy?: BloqueResultado<BloquePlatosHoy>;
    pedidosPorEstado?: BloqueResultado<BloquePedidosPorEstado>;
    mesas?: BloqueResultado<BloqueMesas>;
    caja?: BloqueResultado<BloqueCajaAdmin>;
    menu?: BloqueResultado<BloqueMenuAdmin>;
    ultimoCierre?: BloqueResultado<BloqueUltimoCierre>;
    alertas?: BloqueResultado<AlertaInicio[]>;
    [key: string]: BloqueResultado<unknown> | undefined;
  };
}
