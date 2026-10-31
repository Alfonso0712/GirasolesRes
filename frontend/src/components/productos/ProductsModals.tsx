import React from 'react';
import { ProductFormModal } from './ProductFormModal';
import { ProductConfirmModal } from './ProductConfirmModal';
import { MenuPrecioModal } from './MenuPrecioModal';
import { MenuEstadoModal } from './MenuEstadoModal';
import type { ProductoItem, CrearProductoData, ActualizarProductoData } from '../../types/producto';
import type { MenuCompletoItem } from '../../types/menuCompleto';

interface ProductsModalsProps {
  formModalOpen: boolean;
  onCloseForm: () => void;
  onSubmitForm: (data: CrearProductoData | ActualizarProductoData) => Promise<void>;
  productoAEditar: ProductoItem | null;

  confirmModalOpen: boolean;
  onCloseConfirm: () => void;
  onConfirmAccion: () => Promise<void>;
  productoAConfirmar: ProductoItem | null;
  confirmTipo: 'activar' | 'desactivar';
  procesandoConfirm: boolean;

  modalPrecioOpen: boolean;
  onClosePrecio: () => void;
  menuParaPrecio: MenuCompletoItem | null;
  nuevoPrecioStr: string;
  onPrecioChange: (val: string) => void;
  errorPrecio: string | null;
  guardandoPrecio: boolean;
  onSubmitPrecio: (e: React.FormEvent) => Promise<void>;

  modalEstadoMenuOpen: boolean;
  onCloseEstadoMenu: () => void;
  menuParaEstado: MenuCompletoItem | null;
  guardandoEstadoMenu: boolean;
  onConfirmEstadoMenu: () => Promise<void>;
}

export const ProductsModals: React.FC<ProductsModalsProps> = ({
  formModalOpen,
  onCloseForm,
  onSubmitForm,
  productoAEditar,

  confirmModalOpen,
  onCloseConfirm,
  onConfirmAccion,
  productoAConfirmar,
  confirmTipo,
  procesandoConfirm,

  modalPrecioOpen,
  onClosePrecio,
  menuParaPrecio,
  nuevoPrecioStr,
  onPrecioChange,
  errorPrecio,
  guardandoPrecio,
  onSubmitPrecio,

  modalEstadoMenuOpen,
  onCloseEstadoMenu,
  menuParaEstado,
  guardandoEstadoMenu,
  onConfirmEstadoMenu,
}) => {
  return (
    <>
      {/* Modales del CUS04 */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
        producto={productoAEditar}
      />

      <ProductConfirmModal
        isOpen={confirmModalOpen}
        onClose={onCloseConfirm}
        onConfirm={onConfirmAccion}
        producto={productoAConfirmar}
        tipo={confirmTipo}
        procesando={procesandoConfirm}
      />

      {/* Modal para Modificar Precio de Menú Completo (CUS04.5 / RV-160) */}
      <MenuPrecioModal
        isOpen={modalPrecioOpen}
        onClose={onClosePrecio}
        menu={menuParaPrecio}
        nuevoPrecioStr={nuevoPrecioStr}
        onPrecioChange={onPrecioChange}
        errorPrecio={errorPrecio}
        guardando={guardandoPrecio}
        onSubmit={onSubmitPrecio}
      />

      {/* Modal para Confirmar Cambio de Estado de Menú Completo (MSG-218) */}
      <MenuEstadoModal
        isOpen={modalEstadoMenuOpen}
        onClose={onCloseEstadoMenu}
        menu={menuParaEstado}
        guardando={guardandoEstadoMenu}
        onConfirm={onConfirmEstadoMenu}
      />
    </>
  );
};
