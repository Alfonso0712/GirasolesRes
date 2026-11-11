import { NAVIGATION_GROUPS } from './navigationConfig';
import type { RolUsuario } from '../types/auth';
import type { GuiaRol, GuiaSeccion } from '../types/guia';

interface ContenidoGuiaRol {
  resumen: string;
  /** Descripción de cada módulo accesible, indexada por el id del menú lateral. */
  descripciones: Record<string, string>;
  flujoHabitual: string[];
}

const CONTENIDO_POR_ROL: Record<RolUsuario, ContenidoGuiaRol> = {
  Administrador: {
    resumen:
      'Como Administrador, usted supervisa la operación y gestiona la carta, el personal, las ventas y los reportes.',
    descripciones: {
      mesas: 'Supervise el salón, registre pedidos de mesa y cree o edite las mesas del restaurante.',
      pedidos: 'Consulte el detalle de los pedidos del servicio y anúlelos cuando corresponda.',
      ventas: 'Revise los comprobantes emitidos y anule ventas con recálculo automático de totales.',
      'historial-cierres': 'Audite los cierres de caja y sus arqueos, y descargue el comprobante en PDF.',
      'menu-dia': 'Defina el menú del día, arme los menús completos y marque los platos agotados.',
      productos: 'Registre productos de carta y componentes, y modifique el precio de los menús completos.',
      usuarios: 'Registre al personal, asigne su rol y active o desactive sus accesos al sistema.',
      reportes: 'Consulte los platos vendidos y el balance de ventas, y descárguelos en PDF o CSV.',
    },
    flujoHabitual: [
      'Defina el menú del día.',
      'Supervise el salón de mesas y los pedidos en curso.',
      'Revise las ventas y anule las que correspondan.',
      'Audite los cierres de caja y consulte los reportes.',
    ],
  },
  Cajero: {
    resumen:
      'Como Cajero, usted abre y cierra la caja, cobra los pedidos y registra los pedidos para llevar.',
    descripciones: {
      mesas: 'Revise el estado del salón, cobre las mesas ocupadas y registre pedidos para llevar.',
      pedidos: 'Consulte, modifique o anule los pedidos del servicio en salón y para llevar.',
      caja: 'Abra y cierre la caja, cobre pedidos y emita comprobantes; debe abrir la caja antes de cobrar.',
      ventas: 'Consulte los tickets, boletas y facturas emitidos y el detalle de cada venta.',
    },
    flujoHabitual: [
      'Abra la caja con el monto inicial.',
      'Registre los pedidos para llevar.',
      'Cobre los pedidos y emita el comprobante.',
      'Cierre la caja con el arqueo de efectivo.',
    ],
  },
  Mozo: {
    resumen: 'Como Mozo, usted registra los pedidos de las mesas y los envía a cocina.',
    descripciones: {
      mesas: 'Registre pedidos en mesas libres o agregue productos a las ocupadas; requiere menú del día definido.',
      pedidos: 'Consulte el estado de los pedidos, modifíquelos o anúlelos cuando corresponda.',
    },
    flujoHabitual: [
      'Abra el salón de mesas.',
      'Seleccione una mesa libre y registre el pedido.',
      'Confirme el pedido para enviarlo a cocina.',
      'Agregue productos si el cliente lo solicita.',
    ],
  },
  Cocinero: {
    resumen:
      'Como Cocinero, usted prepara las comandas recibidas y controla la disponibilidad de los platos.',
    descripciones: {
      cocina: 'Inicie la preparación de cada comanda y márquela como lista para su despacho.',
      'menu-dia': 'Consulte el menú del día y marque los platos agotados o nuevamente disponibles.',
    },
    flujoHabitual: [
      'Revise las comandas nuevas en Cocina (KDS).',
      'Inicie la preparación de cada comanda.',
      'Márquela como lista al terminar.',
      'Marque los platos agotados cuando se acaben.',
    ],
  },
};

/**
 * Construye las secciones a partir del menú lateral: los títulos e íconos son
 * los mismos del Sidebar y solo se incluyen los módulos visibles para el rol.
 */
const construirSecciones = (rol: RolUsuario, descripciones: Record<string, string>): GuiaSeccion[] =>
  NAVIGATION_GROUPS.map((grupo) => ({
    id: grupo.id,
    titulo: grupo.title,
    items: grupo.items
      .filter((item) => item.roles.includes(rol) && descripciones[item.id] !== undefined)
      .map((item) => ({
        id: item.id,
        titulo: item.label,
        descripcion: descripciones[item.id],
        icono: item.icon,
      })),
  })).filter((seccion) => seccion.items.length > 0);

const construirGuia = (rol: RolUsuario): GuiaRol => {
  const { resumen, descripciones, flujoHabitual } = CONTENIDO_POR_ROL[rol];
  return { rol, resumen, secciones: construirSecciones(rol, descripciones), flujoHabitual };
};

/** Fuente única del contenido de la guía por rol. */
export const GUIA_POR_ROL: Record<RolUsuario, GuiaRol> = {
  Administrador: construirGuia('Administrador'),
  Cajero: construirGuia('Cajero'),
  Mozo: construirGuia('Mozo'),
  Cocinero: construirGuia('Cocinero'),
};
