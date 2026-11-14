import React from 'react';
import { Button } from './Button';
import { useHandedness } from '../../hooks/useHandedness';

export interface SheetActionsProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary: () => void;
  primaryType?: 'button' | 'submit';
  primaryVariant?: 'primary' | 'danger';
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  isLoading?: boolean;
  primaryIcon?: React.ReactNode;
  primaryTitle?: string;
  className?: string;
}

/**
 * Pie de acciones para hojas inferiores (BottomSheet / ConfirmSheet) con dos botones
 * de igual tamaño (grid de 2 columnas, altura mínima de 48 px, texto en una línea).
 * Respeta la orientación del usuario: el botón principal se ubica del lado del pulgar
 * (a la derecha en modo diestro, a la izquierda en modo zurdo).
 */
export const SheetActions: React.FC<SheetActionsProps> = ({
  primaryLabel = 'Confirmar',
  secondaryLabel = 'Cancelar',
  onPrimary,
  onSecondary,
  primaryType = 'button',
  primaryVariant = 'primary',
  primaryDisabled = false,
  secondaryDisabled = false,
  isLoading = false,
  primaryIcon,
  primaryTitle,
  className = '',
}) => {
  const { isLeftHanded } = useHandedness();
  const esZurdo =
    isLeftHanded ||
    (typeof document !== 'undefined' &&
      (document.documentElement.classList.contains('zurdo') ||
        document.documentElement.classList.contains('left-handed')));

  const botonSecundario = (
    <Button
      key="secondary"
      type="button"
      variant="secondary"
      size="md"
      fullWidth
      disabled={secondaryDisabled || isLoading}
      onClick={onSecondary}
      className="min-h-12 whitespace-nowrap px-3 text-xs font-bold"
    >
      {secondaryLabel}
    </Button>
  );

  const botonPrincipal = (
    <Button
      key="primary"
      type={primaryType}
      variant={primaryVariant}
      size="md"
      fullWidth
      isLoading={isLoading}
      disabled={primaryDisabled || isLoading}
      title={primaryTitle}
      onClick={onPrimary}
      icon={primaryIcon}
      className="min-h-12 whitespace-nowrap px-3 text-xs font-bold"
    >
      {primaryLabel}
    </Button>
  );

  return (
    <div
      data-testid="sheet-actions"
      data-orientation={esZurdo ? 'zurdo' : 'diestro'}
      className={`grid grid-cols-2 gap-3 pt-2 ${className}`.trim()}
    >
      {esZurdo ? [botonPrincipal, botonSecundario] : [botonSecundario, botonPrincipal]}
    </div>
  );
};
