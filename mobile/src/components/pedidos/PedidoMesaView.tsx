import React from 'react';
import type { MesaItem } from '../../types/mesa';
import type { MenuDiaResponseDto, MenuCompletoDiaDto } from '../../types/menuDia';
import type { RolUsuario } from '../../types/auth';
import { StatusBadge } from '../ui/StatusBadge';
import { PageHeader } from '../layout/PageHeader';
import { BannerMenuNoDefinido } from '../menu-dia/BannerMenuNoDefinido';
import { usePedidoMesa } from '../../hooks/usePedidoMesa';
import { CatalogoPedidoPanel } from './CatalogoPedidoPanel';
import { ComandaPanel } from './ComandaPanel';
import { ResumenComandaMovil } from './ResumenComandaMovil';
import { BannerBorradorMesa } from './BannerBorradorMesa';
import { ModalesPedido, construirNotaYMenuModales } from './ModalesPedido';
import type { ContenidoComandaProps } from './ContenidoComanda';

interface PedidoMesaViewProps {
  mesa: MesaItem;
  rol?: RolUsuario;
  menuDiaInicial?: MenuDiaResponseDto | null;
  onIrADefinirMenu?: () => void;
  onVolver: () => void;
  onPedidoExitoso: (mensaje: string) => void;
}

function construirContenidoMesa(p: ReturnType<typeof usePedidoMesa>): ContenidoComandaProps {
  return {
    config: { variante: 'mesa', lineas: p.lineas, total: p.total, totalItems: p.totalItems, errorEnvio: p.errorEnvio, enviando: p.enviando, sinConexion: p.sinConexion },
    extra: { esMozo: p.esMozo, esAmpliacion: p.esAmpliacion },
    acciones: { onModificarCantidad: p.modificarCantidad, onEditarNota: (l) => { p.triggerLight(); p.setLineaParaNota(l); }, onEnviar: p.solicitarEnvioComanda },
  };
}

function construirCatalogoMesa(p: ReturnType<typeof usePedidoMesa>) {
  return {
    filtros: { busqueda: p.busqueda, onBusquedaChange: p.setBusqueda, categorias: p.categoriasDinamicas, categoriaActiva: p.categoriaActiva, onSelectCategoria: (cat: string) => { p.triggerLight(); p.setCategoriaActiva(cat); } },
    estado: { cargando: p.cargando, catalogoVacio: p.catalogo.length === 0, errorCarga: p.errorCarga, onReintentar: p.cargarDatos, esMozo: p.esMozo, lineas: p.lineas },
    acciones: { onArmarMenu: (m: MenuCompletoDiaDto) => { p.triggerLight(); p.setMenuParaArmar(m); }, onAgregarProducto: p.agregarProducto, onModificarCantidad: p.modificarCantidad },
  };
}

function construirModalesMesa(p: ReturnType<typeof usePedidoMesa>, nombreMesa: string) {
  const msgEnvio = p.esAmpliacion && p.pedidoActivo
    ? `¿Desea enviar la ampliación del pedido N.º ${p.pedidoActivo.numero} de la ${nombreMesa} a cocina?`
    : `¿Desea enviar la comanda de la ${nombreMesa} a cocina?`;
  return {
    envio: { abierto: p.mostrarConfirmEnviar, titulo: p.esAmpliacion ? 'Enviar ampliación a cocina' : 'Enviar comanda a cocina', mensaje: msgEnvio, etiquetaConfirmar: p.esAmpliacion ? 'Enviar ampliación' : 'Enviar a cocina', onConfirmar: p.ejecutarEnvioComanda, onCancelar: () => p.setMostrarConfirmEnviar(false) },
    descarte: { abierto: p.mostrarConfirmDescartar, titulo: 'Descartar pedido en curso', mensaje: '', mensajeDescarte: 'Tiene un pedido con platos seleccionados sin registrar. ¿Desea descartarlo? Los platos no se enviarán a cocina.', etiquetaConfirmar: 'Descartar', onConfirmar: p.descartarYVolver, onCancelar: () => p.setMostrarConfirmDescartar(false) },
    ...construirNotaYMenuModales(p, p.esMozo),
  };
}

function renderBannersMesa(
  p: ReturnType<typeof usePedidoMesa>,
  rol: RolUsuario,
  onVolver: () => void,
  onIrADefinirMenu?: () => void
) {
  const irADefinir = onIrADefinirMenu ? () => { onVolver(); onIrADefinirMenu(); } : undefined;
  return (
    <>
      {!p.cargando && p.menuDia !== null && !p.menuDia.definido && (
        <div className="px-4 pt-3 shrink-0"><BannerMenuNoDefinido rol={rol} onDefinirMenu={irADefinir} /></div>
      )}
      {p.hayBorradorGuardado && p.borradorRecuperado && (
        <BannerBorradorMesa cantidadPlatos={p.borradorRecuperado.length} onDescartar={p.descartarBorradorGuardado} onContinuar={p.restaurarBorradorGuardado} />
      )}
    </>
  );
}

/**
 * Vista orquestadora de toma y ampliación de pedidos para una mesa de salón.
 */
export const PedidoMesaView: React.FC<PedidoMesaViewProps> = ({
  mesa, rol = 'Mozo', menuDiaInicial = null, onIrADefinirMenu, onVolver, onPedidoExitoso,
}) => {
  const p = usePedidoMesa({ mesa, rol, menuDiaInicial, onVolver, onPedidoExitoso });
  const contenido = construirContenidoMesa(p);
  const subtitulo = p.esAmpliacion && p.pedidoActivo ? `Ampliar pedido N.º ${p.pedidoActivo.numero}` : 'Toma de Pedido de Salón';

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      <PageHeader title={mesa.nombre} subtitle={subtitulo} onVolver={p.solicitarVolver} etiquetas={<StatusBadge estado={p.esAmpliacion ? 'Ocupada' : mesa.ocupacion} />} onRefresh={() => void p.cargarDatos(false)} isRefreshing={p.cargando} />
      {renderBannersMesa(p, rol, onVolver, onIrADefinirMenu)}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        <CatalogoPedidoPanel variante="mesa" {...construirCatalogoMesa(p)} menus={p.menusFiltrados} productos={p.productosFiltrados} />
        <ComandaPanel contenido={contenido} tituloAside="Comanda de Sala" ariaLabelAside="Comanda de la mesa" vacioTitulo="Comanda vacía" vacioSubtitulo="Seleccione productos o menús del catálogo para agregarlos a la orden." />
      </div>
      <ResumenComandaMovil contenido={contenido} abierto={p.mostrarPanelOrden} tituloSheet={`Comanda para ${mesa.nombre}`} onAbrir={() => { p.triggerLight(); p.setMostrarPanelOrden(true); }} onCerrar={() => p.setMostrarPanelOrden(false)} />
      <ModalesPedido orden="mesa" {...construirModalesMesa(p, mesa.nombre)} />
    </div>
  );
};
