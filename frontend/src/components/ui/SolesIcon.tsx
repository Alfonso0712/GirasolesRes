import React from 'react';

export interface SolesIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
}

/**
 * Ícono institucional de moneda peruana (Soles - S/)
 * Diseñado como drop-in replacement para íconos de Lucide (DollarSign, BadgeDollarSign).
 * Compatible con modo claro, modo oscuro (currentColor) y diferentes escalas (12px, 16px, 20px, 24px).
 */
export const SolesIcon = React.forwardRef<SVGSVGElement, SolesIconProps>(
  (
    {
      size = 24,
      className = '',
      color = 'currentColor',
      strokeWidth = 2,
      ...props
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <text
          x="12"
          y="12.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          stroke="none"
          fontFamily="var(--font-sans, system-ui, sans-serif)"
          fontSize="13"
          fontWeight="800"
          letterSpacing="-0.5px"
        >
          S/
        </text>
      </svg>
    );
  }
);

SolesIcon.displayName = 'SolesIcon';

export default SolesIcon;
