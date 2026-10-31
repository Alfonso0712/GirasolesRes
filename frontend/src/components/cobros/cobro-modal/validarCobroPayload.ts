import type { CobroRequest, TipoComprobante, PedidoPendienteCobro } from '../../../types/cobro';

export interface ValidarCobroParams {
  pedido: PedidoPendienteCobro | null;
  total: number;
  tipoComprobante: TipoComprobante;
  modoBoleta: 'simple' | 'dni';
  esExigidoDocumentoPorMonto: boolean;
  numDoc: string;
  razonSocial: string;
  direccion: string;
  metodo: 'efectivo' | 'yape';
  montoRecibido: number;
  faltante: number;
  yapeConfirmado: boolean;
  yapeReferencia: string;
  solicitudId: string;
}

export const validarYConstruirPayloadCobro = (
  params: ValidarCobroParams
): { error?: string; payload?: CobroRequest } => {
  const {
    pedido,
    total,
    tipoComprobante,
    modoBoleta,
    esExigidoDocumentoPorMonto,
    numDoc,
    razonSocial,
    direccion,
    metodo,
    montoRecibido,
    faltante,
    yapeConfirmado,
    yapeReferencia,
    solicitudId,
  } = params;

  if (tipoComprobante === 'Factura') {
    const ruc = numDoc.trim();
    if (ruc.length !== 11 || !/^\d+$/.test(ruc) || (!ruc.startsWith('10') && !ruc.startsWith('20'))) {
      return { error: 'Para emitir Factura se requiere un RUC válido de 11 dígitos (iniciando con 10 o 20).' };
    }
    if (!razonSocial.trim()) {
      return { error: 'La Razón Social es obligatoria para emitir una Factura.' };
    }
  } else if (tipoComprobante === 'Boleta') {
    if (esExigidoDocumentoPorMonto || modoBoleta === 'dni') {
      const dni = numDoc.trim();
      if (dni.length !== 8 || !/^\d+$/.test(dni)) {
        return { error: 'Para esta boleta se requiere ingresar un DNI válido de 8 dígitos.' };
      }
    }
  }

  if (metodo === 'efectivo') {
    if (isNaN(montoRecibido) || montoRecibido <= 0) {
      return { error: 'Ingrese un monto recibido válido.' };
    }
    if (montoRecibido < total) {
      return { error: `El monto recibido es insuficiente. Faltan S/ ${faltante.toFixed(2)}.` };
    }
    if (montoRecibido > 9999.99) {
      return { error: 'El monto recibido no puede exceder S/ 9,999.99.' };
    }
  } else if (metodo === 'yape') {
    if (!yapeConfirmado) {
      return { error: 'Debe confirmar la verificación del pago en el aplicativo Yape.' };
    }
    if (yapeReferencia && yapeReferencia.trim().length > 20) {
      return { error: 'La referencia de Yape no puede tener más de 20 caracteres.' };
    }
  }

  if (!pedido?.estaListo) {
    return { error: 'No se puede cobrar el pedido porque aún se encuentra en preparación en cocina.' };
  }

  const payload: CobroRequest = {
    pedidoId: pedido.pedidoId,
    solicitudId,
    totalMostrado: total,
    metodo,
    montoRecibido: metodo === 'efectivo' ? montoRecibido : total,
    yapeConfirmado: metodo === 'yape' ? true : undefined,
    yapeReferencia: metodo === 'yape' && yapeReferencia.trim() ? yapeReferencia.trim() : undefined,
    tipoComprobante,
    tipoDocReceptor:
      tipoComprobante === 'Factura'
        ? 'RUC'
        : tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto)
        ? 'DNI'
        : null,
    numDocReceptor:
      (tipoComprobante === 'Factura' ||
        (tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto))) &&
      numDoc.trim()
        ? numDoc.trim()
        : null,
    razonSocialReceptor:
      tipoComprobante === 'Factura' ||
      (tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto))
        ? razonSocial.trim() || undefined
        : tipoComprobante === 'Boleta'
        ? 'CLIENTES VARIOS'
        : undefined,
    direccionReceptor: tipoComprobante === 'Factura' && direccion.trim() ? direccion.trim() : undefined,
  };

  return { payload };
};
