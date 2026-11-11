import type { RolUsuario } from '../../types/auth';

export interface TareaAyuda {
  id: string;
  titulo: string;
  descripcionBreve: string;
  pasos: string[];
}

export interface GuiaRapidaRol {
  rol: RolUsuario;
  resumen: string;
  tareas: TareaAyuda[];
}

export const GUIA_RAPIDA_POR_ROL: Record<RolUsuario, GuiaRapidaRol> = {
  Mozo: {
    rol: 'Mozo',
    resumen: 'Como Mozo, usted registra pedidos de salón, atiende mesas y envía los pedidos a cocina.',
    tareas: [
      {
        id: 'mozo-tomar-pedido',
        titulo: 'Tomar un pedido en mesa',
        descripcionBreve: 'Registrar comensales y enviar la comanda inicial a cocina.',
        pasos: [
          'Abra el menú lateral y seleccione "Mesas y Salón".',
          'Haga clic en una mesa en estado "Libre".',
          'Seleccione los platos a la carta o arme menús completos con entrada, segundo y bebida.',
          'Presione "Confirmar pedido" para generar la comanda y enviarla inmediatamente a cocina.',
        ],
      },
      {
        id: 'mozo-ampliar-pedido',
        titulo: 'Ampliar un pedido existente',
        descripcionBreve: 'Agregar platos o bebidas adicionales a una mesa ya ocupada.',
        pasos: [
          'En "Mesas y Salón", haga clic sobre la mesa ocupada.',
          'Seleccione "Agregar productos a la mesa".',
          'Agregue los nuevos ítems solicitados por los clientes en el carrito.',
          'Presione "Confirmar ampliación" para despachar la nueva tanda a cocina.',
        ],
      },
      {
        id: 'mozo-consultar-pedidos',
        titulo: 'Consultar y anular pedidos',
        descripcionBreve: 'Ver el estado de atención y anular órdenes no preparadas ante cambios.',
        pasos: [
          'Diríjase a "Gestión de Pedidos" en el menú lateral.',
          'Localice el pedido por número o mesa en el listado del servicio.',
          'Presione "Ver detalle" para consultar el avance o "Anular pedido" si el cliente canceló antes de cocinarse.',
          'Confirme la anulación en el modal emergente para liberar la mesa si correspondía.',
        ],
      },
    ],
  },
  Cajero: {
    rol: 'Cajero',
    resumen: 'Como Cajero, usted administra el flujo de efectivo, cobra pedidos y registra órdenes para llevar.',
    tareas: [
      {
        id: 'cajero-abrir-caja',
        titulo: 'Abrir caja al inicio del turno',
        descripcionBreve: 'Registrar el fondo inicial de sencillo para habilitar cobranzas.',
        pasos: [
          'En el menú lateral, seleccione "Caja y Cobros".',
          'Presione el botón "Abrir caja".',
          'Ingrese el monto inicial en efectivo (fondo de sencillo).',
          'Confirme la apertura para habilitar el cobro de pedidos en el sistema.',
        ],
      },
      {
        id: 'cajero-pedido-llevar',
        titulo: 'Registrar un pedido para llevar',
        descripcionBreve: 'Crear órdenes directas de mostrador sin asignación de mesa física.',
        pasos: [
          'En "Mesas y Salón", haga clic en "Pedido para llevar".',
          'Ingrese el nombre del cliente o referencia de entrega.',
          'Agregue los platos solicitados al carrito de compra.',
          'Presione "Confirmar pedido" para enviar la comanda de despacho a cocina.',
        ],
      },
      {
        id: 'cajero-cobrar-pedido',
        titulo: 'Cobrar un pedido y emitir comprobante',
        descripcionBreve: 'Procesar el pago de salón o para llevar y generar el comprobante legal.',
        pasos: [
          'En "Caja y Cobros", seleccione el pedido pendiente de cobro.',
          'Presione "Cobrar pedido" para abrir el panel financiero.',
          'Seleccione el tipo de comprobante: Ticket, Boleta o Factura.',
          'Elija el método de pago (Efectivo, Yape, Plin o Tarjeta) e ingrese el monto recibido.',
          'Presione "Emitir comprobante" para registrar la venta y liberar automáticamente la mesa.',
        ],
      },
      {
        id: 'cajero-cerrar-caja',
        titulo: 'Realizar arqueo y cierre de caja',
        descripcionBreve: 'Contabilizar el dinero recaudado y emitir el balance del turno.',
        pasos: [
          'En "Caja y Cobros", presione el botón "Cierre de caja".',
          'Utilice el contador de denominaciones para ingresar billetes y monedas.',
          'Verifique el descuadre (sobrante o faltante) contra el efectivo del sistema.',
          'Confirme el cierre para descargar el acta de arqueo en formato PDF.',
        ],
      },
    ],
  },
  Cocinero: {
    rol: 'Cocinero',
    resumen: 'Como Cocinero, usted prepara las comandas en el tablero KDS y gestiona la disponibilidad del menú.',
    tareas: [
      {
        id: 'cocinero-preparar-comanda',
        titulo: 'Atender y preparar comandas en KDS',
        descripcionBreve: 'Organizar las órdenes entrantes y cambiar su estado en cocina.',
        pasos: [
          'Abra "Cocina (KDS)" en el menú lateral.',
          'Revise las tarjetas entrantes en la columna "Pendientes".',
          'Haga clic en "Empezar preparación" en la tarjeta elegida.',
          'La comanda avanzará a la columna "En Preparación" indicando el tiempo transcurrido.',
        ],
      },
      {
        id: 'cocinero-marcar-lista',
        titulo: 'Marcar comanda como lista',
        descripcionBreve: 'Notificar al personal de salón que los platos están listos para servirse.',
        pasos: [
          'Una vez finalizada la cocción, ubique la comanda en preparación.',
          'Presione el botón "Marcar como Lista".',
          'El sistema reproducirá el tono de aviso y notificará en pantalla a los mozos y caja.',
        ],
      },
      {
        id: 'cocinero-marcar-agotados',
        titulo: 'Marcar platos o componentes agotados',
        descripcionBreve: 'Bloquear platos terminados para evitar que mozos sigan pidiéndolos.',
        pasos: [
          'En el menú lateral, seleccione "Menú del día".',
          'Ubique la entrada, segundo o componente que se haya agotado en cocina.',
          'Haga clic en el botón "Marcar como Agotado".',
          'El plato quedará deshabilitado de inmediato en las cartas de pedido de todo el personal.',
        ],
      },
    ],
  },
  Administrador: {
    rol: 'Administrador',
    resumen: 'Como Administrador, usted supervisa todo el restaurante, configura cartas, gestiona usuarios y analiza reportes.',
    tareas: [
      {
        id: 'admin-menu-dia',
        titulo: 'Configurar menú del día y armar menús completos',
        descripcionBreve: 'Habilitar platos disponibles y combinaciones fijas del servicio.',
        pasos: [
          'En el menú lateral, diríjase a "Menú del día".',
          'Seleccione las entradas, segundos y refrescos disponibles para la jornada.',
          'Use la opción "Armar Menú Completo" para crear paquetes cerrados con precio especial.',
          'Presione "Guardar menú del día" para activar la carta en salón.',
        ],
      },
      {
        id: 'admin-productos',
        titulo: 'Registrar productos de carta y componentes',
        descripcionBreve: 'Mantener actualizado el catálogo de platos, bebidas y precios.',
        pasos: [
          'En el menú lateral, seleccione "Productos".',
          'Haga clic en "Nuevo producto" para abrir el formulario.',
          'Complete el nombre, categoría, precio de venta y tipo de producto.',
          'Presione "Guardar producto" para integrarlo en la carta permanente.',
        ],
      },
      {
        id: 'admin-usuarios',
        titulo: 'Gestionar usuarios y accesos del personal',
        descripcionBreve: 'Dar de alta personal y asignar roles de trabajo.',
        pasos: [
          'En el menú lateral, ingrese a "Usuarios".',
          'Presione "Nuevo usuario" y complete los datos del colaborador.',
          'Asigne el rol correspondiente: Administrador, Cajero, Mozo o Cocinero.',
          'Guarde el registro; puede activar o suspender accesos en cualquier momento desde la tabla.',
        ],
      },
      {
        id: 'admin-reportes',
        titulo: 'Consultar reportes y balance de ventas',
        descripcionBreve: 'Auditar ingresos, platos más vendidos y exportar resúmenes gerenciales.',
        pasos: [
          'En el menú lateral, haga clic en "Reportes".',
          'Filtre por rango de fechas (hoy, semana o mes).',
          'Revise los gráficos de ventas, métodos de cobro y platos con mayor rotación.',
          'Presione "Descargar PDF" o "Exportar CSV" para archivar los informes contables.',
        ],
      },
    ],
  },
};
