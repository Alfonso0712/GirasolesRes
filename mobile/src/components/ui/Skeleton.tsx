import React from 'react';

export interface SkeletonProps {
  variant?: 'block' | 'line' | 'circle';
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'block',
  className = '',
  width,
  height,
}) => {
  const variantStyles = {
    block: 'rounded-2xl',
    line: 'rounded-md h-3.5',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`bg-line/60 animate-pulse motion-reduce:animate-none ${variantStyles[variant]} ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface border border-line rounded-2xl p-4 shadow-xs space-y-3 animate-pulse motion-reduce:animate-none ${className}`}
    >
      <div className="flex justify-between items-center">
        <Skeleton variant="line" className="w-1/3 h-4" />
        <Skeleton variant="line" className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton variant="line" className="w-2/3 h-3" />
      <Skeleton variant="line" className="w-1/2 h-3" />
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
