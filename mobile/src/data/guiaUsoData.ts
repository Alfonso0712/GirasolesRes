import type { RolUsuario } from '../types/auth';

export interface TareaGuia {
  id: string;
  titulo: string;
  descripcionBreve: string;
  pasos: string[];
}

export interface GuiaRol {
  rol: RolUsuario;
  resumen: string;
  tareas: TareaGuia[];
}

export const GUIA_USO_POR_ROL: Record<RolUsuario, GuiaRol> = {
  Mozo: {
    rol: 'Mozo',
    resumen: 'Como Mozo, usted atiende las mesas del salón, registra pedidos de comensales y envía las comandas a cocina.',
    tareas: [
      {
        id: 'mozo-tomar-pedido',
        titulo: 'Tomar pedido en mesa de Salón',
        descripcionBreve: 'Registrar la orden inicial y despachar la comanda a cocina.',
        pasos: [
          'Toque la pestaña "Salón" en la barra inferior.',
          'Seleccione una mesa con estado "Libre".',
          'Agregue los platos a la carta o arme menús completos con entrada, segundo y refresco.',
          'Toque "Confirmar pedido" para enviar inmediatamente la comanda a cocina.',
        ],
      },
      {
        id: 'mozo-ampliar-pedido',
        titulo: 'Ampliar una orden existente',
        descripcionBreve: 'Añadir productos adicionales a una mesa que ya está ocupada.',
        pasos: [
          'En la pestaña "Salón", toque la mesa en estado "Ocupada".',
          'Toque "Agregar productos a la mesa".',
          'Añada los nuevos platos o bebidas solicitados por los comensales.',
          'Toque "Confirmar ampliación" para despachar la tanda adicional a cocina.',
        ],
      },
      {
        id: 'mozo-seguimiento-pedidos',
        titulo: 'Seguimiento y anulación de pedidos',
        descripcionBreve: 'Supervisar el estado de preparación y anular órdenes no cocinadas.',
        pasos: [
          'Toque la pestaña "Pedidos" en la barra inferior.',
          'Consulte el estado de atención ("Pendiente", "En preparación", "Listo").',
          'Si el comensal cancela antes de la cocción, toque "Anular pedido" y confirme la liberación de la mesa.',
        ],
      },
    ],
  },
  Cajero: {
    rol: 'Cajero',
    resumen: 'Como Cajero, usted administra el flujo de dinero, procesa cobros de salón y para llevar, y realiza el arqueo de turno.',
    tareas: [
      {
        id: 'cajero-abrir-caja',
        titulo: 'Apertura de caja de turno',
        descripcionBreve: 'Registrar el fondo inicial en soles para habilitar cobranzas.',
        pasos: [
          'Toque la pestaña "Caja" en la barra inferior.',
          'Presione el botón "Abrir Caja de Turno".',
          'Digite con el teclado numérico el fondo inicial en efectivo (sencillo).',
          'Confirme la apertura para habilitar el cobro de pedidos en el terminal.',
        ],
      },
      {
        id: 'cajero-cobrar-cuenta',
        titulo: 'Cobro rápido y emisión de comprobantes',
        descripcionBreve: 'Procesar el pago de cuentas con Ticket, Boleta o Factura.',
        pasos: [
          'Toque la pestaña "Cobros" en la barra inferior.',
          'Seleccione la cuenta pendiente de cobro de la lista.',
          'Elija el tipo de comprobante: Ticket, Boleta (DNI si S/ 700+) o Factura (con RUC validado).',
          'Seleccione Efectivo (con cálculo en vivo de vuelto) o Yape/Plin (con confirmación en app).',
          'Toque "Confirmar Cobro" para registrar la venta y liberar automáticamente la mesa.',
        ],
      },
      {
        id: 'cajero-pedidos-llevar',
        titulo: 'Pedidos directos para llevar',
        descripcionBreve: 'Crear pedidos de mostrador sin asignación de mesa física.',
        pasos: [
          'Toque la pestaña "Llevar" en la barra inferior.',
          'Indique el nombre o referencia de entrega del cliente.',
          'Agregue los platos solicitados al carrito de pedido.',
          'Toque "Confirmar pedido" para enviar el ticket de despacho a cocina.',
        ],
      },
      {
        id: 'cajero-arqueo-cierre',
        titulo: 'Arqueo y cierre definitivo de caja',
        descripcionBreve: 'Contabilizar el dinero recaudado y emitir el balance del turno.',
        pasos: [
          'En la pestaña "Caja", toque "Realizar Cierre de Caja / Arqueo".',
          'Verifique que no existan pedidos pendientes de cobro (o cóbrelos previamente).',
          'Digite el efectivo contado para compararlo contra el saldo esperado del sistema.',
          'Revise el resultado del cuadre (Cuadra, Sobrante o Faltante) e ingrese observaciones si aplica.',
          'Toque "Confirmar Cierre" para asentar el acta formal de turno.',
        ],
      },
    ],
  },
  Cocinero: {
    rol: 'Cocinero',
    resumen: 'Como Cocinero, usted organiza las comandas en el tablero KDS y gestiona la disponibilidad del menú en tiempo real.',
    tareas: [
      {
        id: 'cocinero-kds-preparacion',
        titulo: 'Gestión de comandas en pantalla KDS',
        descripcionBreve: 'Visualizar pedidos entrantes y avanzar su ciclo de preparación.',
        pasos: [
          'Toque la pestaña "Cocina" en la barra inferior.',
          'Revise las tarjetas de comanda ordenadas cronológicamente con su tiempo transcurrido.',
          'Toque "Empezar preparación" en la tarjeta seleccionada para iniciar cocción.',
          'Al culminar la preparación, toque "Marcar como Lista" para avisar a salón y caja.',
        ],
      },
      {
        id: 'cocinero-platos-agotados',
        titulo: 'Control de platos y componentes agotados',
        descripcionBreve: 'Bloquear platos terminados para evitar que se sigan solicitando.',
        pasos: [
          'Toque la pestaña "Platos" en la barra inferior.',
          'Localice la entrada, segundo o componente que se haya agotado en cocina.',
          'Toque el control de disponibilidad para cambiar su estado a "Agotado".',
          'El plato quedará deshabilitado de inmediato en las cartas de pedido de todo el personal.',
        ],
      },
    ],
  },
  Administrador: {
    rol: 'Administrador',
    resumen: 'Como Administrador, usted supervisa la operación integral, audita balances de dinero y consulta reportes gerenciales.',
    tareas: [
      {
        id: 'admin-supervision-general',
        titulo: 'Supervisión general del restaurante',
        descripcionBreve: 'Monitorear métricas de venta en tiempo real y ocupación de salón.',
        pasos: [
          'En "Inicio", audite los indicadores clave de facturación, mesas y órdenes activas.',
          'En "Salón", visualice el estado y rotación de todas las mesas del restaurante.',
        ],
      },
      {
        id: 'admin-auditoria-ventas',
        titulo: 'Gestión y anulación fiscal de ventas',
        descripcionBreve: 'Revisar comprobantes emitidos y anularlos en caso de error formal.',
        pasos: [
          'En la pestaña "Caja", toque la sección "Ventas".',
          'Filtre por fecha o busque por número de comprobante.',
          'Toque una venta para ver el desglose tributario y consumo de la orden.',
          'Si requiere anularla, presione "Anular Venta", indique el motivo y el destino del pedido.',
        ],
      },
      {
        id: 'admin-historial-cierres',
        titulo: 'Auditoría de actas históricas de cierre',
        descripcionBreve: 'Consultar arqueos de caja anteriores y ajustes posteriores.',
        pasos: [
          'En la pestaña "Caja", toque la sección "Cierres".',
          'Seleccione un cierre histórico para auditar el fondo inicial, ventas y diferencias.',
          'Verifique si el cierre cuenta con ajustes posteriores por anulaciones fiscales.',
        ],
      },
      {
        id: 'admin-reportes-gerenciales',
        titulo: 'Reportes y balance gerencial',
        descripcionBreve: 'Analizar ingresos, métodos de cobro y platos de mayor rotación.',
        pasos: [
          'Toque la pestaña "Reportes" en la barra inferior.',
          'Seleccione el período de análisis (hoy, 7 días o mes).',
          'Revise el desglose de ventas por método de pago y el ranking de platos más vendidos.',
        ],
      },
    ],
  },
};