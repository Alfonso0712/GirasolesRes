import React from 'react';
import type { LineaBorrador } from '../../types/pedido';
import type { MenuCompletoDiaDto } from '../../types/menuDia';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { NotaCocinaSheet } from './NotaCocinaSheet';
import { ArmarMenuSheet } from './ArmarMenuSheet';

export interface ConfigConfirmModal {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  etiquetaConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export interface ModalesPedidoProps {
  orden: 'mesa' | 'llevar';
  envio: ConfigConfirmModal;
  descarte: ConfigConfirmModal & { mensajeDescarte: string };
  nota: {
    linea: LineaBorrador | null;
    onCerrar: () => void;
    onGuardar: (texto: string) => void;
  };
  armarMenu: {
    menu: MenuCompletoDiaDto | null;
    esMozo: boolean;
    onCerrar: () => void;
    onAgregar: (linea: LineaBorrador) => void;
  };
}

export interface FuenteNotaYMenuModal {
  lineaParaNota: LineaBorrador | null;
  setLineaParaNota: (linea: LineaBorrador | null) => void;
  actualizarObservacion: (lineaId: string, texto: string) => void;
  menuParaArmar: MenuCompletoDiaDto | null;
  setMenuParaArmar: (menu: MenuCompletoDiaDto | null) => void;
  setLineas: React.Dispatch<React.SetStateAction<LineaBorrador[]>>;
}

/**
 * Construye la configuración de nota de cocina y armado de menú para ModalesPedido.
 */
export function construirNotaYMenuModales(p: FuenteNotaYMenuModal, esMozo: boolean) {
  return {
    nota: {
      linea: p.lineaParaNota,
      onCerrar: () => p.setLineaParaNota(null),
      onGuardar: (texto: string) => {
        if (p.lineaParaNota) {
          p.actualizarObservacion(p.lineaParaNota.id, texto);
          p.setLineaParaNota(null);
        }
      },
    },
    armarMenu: {
      menu: p.menuParaArmar,
      esMozo,
      onCerrar: () => p.setMenuParaArmar(null),
      onAgregar: (nueva: LineaBorrador) => {
        p.setLineas((prev) => [...prev, nueva]);
        p.setMenuParaArmar(null);
      },
    },
  };
}

function renderSheetNota(nota: ModalesPedidoProps['nota']) {
  return (
    <NotaCocinaSheet
      isOpen={Boolean(nota.linea)}
      onClose={nota.onCerrar}
      nombrePlato={nota.linea?.nombre || ''}
      notaInicial={nota.linea?.observacion || ''}
      onGuardarNota={nota.onGuardar}
    />
  );
}

function renderSheetDescarte(descarte: ModalesPedidoProps['descarte']) {
  return (
    <ConfirmSheet
      isOpen={descarte.abierto}
      titulo="Descartar pedido en curso"
      mensaje={descarte.mensajeDescarte}
      etiquetaConfirmar="Descartar"
      etiquetaCancelar="Seguir editando"
      tono="peligro"
      onConfirmar={descarte.onConfirmar}
      onCancelar={descarte.onCancelar}
    />
  );
}

function renderSheetArmar(armarMenu: ModalesPedidoProps['armarMenu']) {
  return (
    <ArmarMenuSheet
      isOpen={Boolean(armarMenu.menu)}
      onClose={armarMenu.onCerrar}
      menu={armarMenu.menu}
      esMozo={armarMenu.esMozo}
      onAgregar={armarMenu.onAgregar}
    />
  );
}

/**
 * Agrupa las hojas de confirmación, armado de menú y nota para cocina sin nodos DOM extra.
 */
export const ModalesPedido: React.FC<ModalesPedidoProps> = ({ orden, envio, descarte, nota, armarMenu }) => (
  <>
    <ConfirmSheet
      isOpen={envio.abierto}
      titulo={envio.titulo}
      mensaje={envio.mensaje}
      etiquetaConfirmar={envio.etiquetaConfirmar}
      etiquetaCancelar="Seguir editando"
      tono="normal"
      onConfirmar={envio.onConfirmar}
      onCancelar={envio.onCancelar}
    />
    {orden === 'mesa' ? (
      <>
        {renderSheetNota(nota)}
        {renderSheetDescarte(descarte)}
        {renderSheetArmar(armarMenu)}
      </>
    ) : (
      <>
        {renderSheetDescarte(descarte)}
        {renderSheetArmar(armarMenu)}
        {renderSheetNota(nota)}
      </>
    )}
  </>
);
