import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { BannerMenuNoDefinido } from '../menu-dia/BannerMenuNoDefinido';
import { usePedidoLlevar } from '../../hooks/usePedidoLlevar';
import { CatalogoPedidoPanel } from '../pedidos/CatalogoPedidoPanel';
import { ComandaPanel } from '../pedidos/ComandaPanel';
import { ResumenComandaMovil } from '../pedidos/ResumenComandaMovil';
import { CampoReferenciaLlevar } from '../pedidos/CampoReferenciaLlevar';
import { ModalesPedido, construirNotaYMenuModales } from '../pedidos/ModalesPedido';
import type { ContenidoComandaProps } from '../pedidos/ContenidoComanda';

interface PedidoLlevarViewProps {
  onPedidoCreado: (mensaje: string) => void;
  onIrACobros?: () => void;
}

function construirContenidoLlevar(p: ReturnType<typeof usePedidoLlevar>): ContenidoComandaProps {
  return {
    config: { variante: 'llevar', lineas: p.lineas, total: p.total, totalItems: p.totalItems, errorEnvio: p.errorEnvio, enviando: p.enviando, sinConexion: p.sinConexion },
    extra: { esMozo: false, referencia: p.referencia },
    acciones: { onModificarCantidad: p.modificarCantidad, onEditarNota: (l) => { p.triggerLight(); p.setLineaParaNota(l); }, onEnviar: p.solicitarRegistroPedido },
  };
}

function construirModalesLlevar(p: ReturnType<typeof usePedidoLlevar>) {
  return {
    envio: { abierto: p.mostrarConfirmEnviar, titulo: 'Registrar pedido para llevar', mensaje: `¿Desea registrar el pedido para llevar a nombre de "${p.referencia.trim()}"? La comanda se enviará a cocina.`, etiquetaConfirmar: 'Registrar y enviar', onConfirmar: p.ejecutarRegistroPedidoLlevar, onCancelar: () => p.setMostrarConfirmEnviar(false) },
    descarte: { abierto: p.mostrarConfirmDescartar, titulo: 'Descartar pedido en curso', mensaje: '', mensajeDescarte: 'Tiene un pedido para llevar sin registrar. ¿Desea descartarlo? Los productos seleccionados no se guardarán.', etiquetaConfirmar: 'Descartar', onConfirmar: p.descartarPedido, onCancelar: () => p.setMostrarConfirmDescartar(false) },
    ...construirNotaYMenuModales(p, false),
  };
}

/**
 * Vista orquestadora para registrar pedidos rápidos para llevar desde mostrador.
 */
export const PedidoLlevarView: React.FC<PedidoLlevarViewProps> = ({ onPedidoCreado, onIrACobros }) => {
  const p = usePedidoLlevar({ onPedidoCreado, onIrACobros });
  const contenido = construirContenidoLlevar(p);

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      <PageHeader title="Pedido para Llevar" subtitle="Toma rápida de órdenes de mostrador" icon={<ShoppingBag className="w-5 h-5 text-white" aria-hidden="true" />} onRefresh={() => void p.cargarDatos(false)} isRefreshing={p.cargando} />
      {!p.cargando && p.menuDia !== null && !p.menuDia.definido && (
        <div className="px-4 pt-3 shrink-0"><BannerMenuNoDefinido rol="Cajero" /></div>
      )}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <CatalogoPedidoPanel
          variante="llevar"
          cabeceraExtra={<CampoReferenciaLlevar referencia={p.referencia} onChange={p.cambiarReferencia} />}
          filtros={{ busqueda: p.busqueda, onBusquedaChange: p.setBusqueda, categorias: p.categoriasDinamicas, categoriaActiva: p.categoriaActiva, onSelectCategoria: (cat) => { p.triggerLight(); p.setCategoriaActiva(cat); } }}
          estado={{ cargando: p.cargando, catalogoVacio: p.catalogo.length === 0, errorCarga: p.errorCarga, onReintentar: p.cargarDatos, lineas: p.lineas }}
          menus={p.menusFiltrados}
          productos={p.productosFiltrados}
          acciones={{ onArmarMenu: (m) => { p.triggerLight(); p.setMenuParaArmar(m); }, onAgregarProducto: p.agregarProducto, onModificarCantidad: p.modificarCantidad }}
        />
        <ComandaPanel contenido={contenido} tituloAside="Orden para Llevar" ariaLabelAside="Resumen del pedido para llevar" vacioTitulo="Sin productos seleccionados" vacioSubtitulo="Ingrese la referencia del cliente y elija productos del catálogo." />
      </div>
      <ResumenComandaMovil contenido={contenido} abierto={p.mostrarPanelOrden} tituloSheet="Orden para Llevar" onAbrir={() => { p.triggerLight(); p.setMostrarPanelOrden(true); }} onCerrar={() => p.setMostrarPanelOrden(false)} />
      <ModalesPedido orden="llevar" {...construirModalesLlevar(p)} />
    </div>
  );
};
