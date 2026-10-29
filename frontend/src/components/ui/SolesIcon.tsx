import React from 'react';

export interface SolesIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

/**
 * Ícono institucional de moneda peruana (Soles - S/)
 * Dibujado con paths vectoriales de trazo uniforme (strokeWidth=2, round/round)
 * siguiendo las especificaciones geométricas de Lucide en viewBox 0 0 24 24.
 */
export const SolesIcon = React.forwardRef<SVGSVGElement, SolesIconProps>(
  (
    {
      size = 24,
      className = '',
      color = 'currentColor',
      strokeWidth = 2,
      absoluteStrokeWidth = false,
      ...props
    },
    ref
  ) => {
    const calculatedStrokeWidth = absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number(size)
      : strokeWidth;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={calculatedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path d="M11.5 4.5H6.75a3.75 3.75 0 0 0 0 7.5h1.5a3.75 3.75 0 0 1 0 7.5H3" />
        <path d="M20.5 4L14.5 20" />
      </svg>
    );
  }
);

SolesIcon.displayName = 'SolesIcon';

export default SolesIcon;
