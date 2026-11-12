import React from 'react';

export const ViewSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-canvas p-4 space-y-4 animate-pulse select-none">
      {/* Barra de cabecera simulada */}
      <div className="h-12 bg-surface border border-line rounded-2xl w-full shrink-0" />
      {/* 3 bloques grises de contenido */}
      <div className="h-28 bg-surface border border-line rounded-2xl w-full" />
      <div className="h-28 bg-surface border border-line rounded-2xl w-full" />
      <div className="h-28 bg-surface border border-line rounded-2xl w-full" />
    </div>
  );
};
