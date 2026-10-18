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

// Bloques Cajero
export interface BloqueCajaCajero {
  estado: string;
  ventas: number;
  efectivo: number;
  yape: number;
  total: number;
  montoInicial: number;
  totalEsperado: number;
}

export interface BloquePorCobrar {
  cantidad: number;
  monto: number;
}

export interface BloqueListos {
  cantidad: number;
}

// Bloques Mozo
export interface BloqueSimpleCantidad {
  cantidad: number;
}

// Bloques Cocinero
export interface BloqueComandasCocinero {
  pendientes: number;
  enPreparacion: number;
  masAntiguaMinutos: number;
}

export interface BloqueAgotadosCocinero {
  cantidad: number;
  platos: string[];
}

export interface InicioDashboardData {
  rol: string;
  fecha: string;
  bloques: {
    ventasHoy?: BloqueResultado<BloqueVentasHoy>;
    platosHoy?: BloqueResultado<BloquePlatosHoy>;
    pedidosPorEstado?: BloqueResultado<BloquePedidosPorEstado>;
    mesas?: BloqueResultado<BloqueMesas>;
    caja?: BloqueResultado<BloqueCajaAdmin | BloqueCajaCajero>;
    menu?: BloqueResultado<BloqueMenuAdmin>;
    ultimoCierre?: BloqueResultado<BloqueUltimoCierre>;
    alertas?: BloqueResultado<AlertaInicio[]>;
    porCobrar?: BloqueResultado<BloquePorCobrar>;
    listos?: BloqueResultado<BloqueListos>;
    misPedidosEnCurso?: BloqueResultado<BloqueSimpleCantidad>;
    misListos?: BloqueResultado<BloqueSimpleCantidad>;
    comandas?: BloqueResultado<BloqueComandasCocinero>;
    agotados?: BloqueResultado<BloqueAgotadosCocinero>;
    [key: string]: BloqueResultado<any> | undefined;
  };
}
