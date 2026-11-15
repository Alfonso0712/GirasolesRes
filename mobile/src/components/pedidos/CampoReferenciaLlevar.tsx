import React from 'react';
import { User } from 'lucide-react';

export interface CampoReferenciaLlevarProps {
  referencia: string;
  onChange: (valor: string) => void;
}

/**
 * Campo obligatorio de referencia del cliente (2-30 caracteres) para pedidos para llevar.
 */
export const CampoReferenciaLlevar: React.FC<CampoReferenciaLlevarProps> = ({
  referencia,
  onChange,
}) => {
  const esValida = referencia.trim().length >= 2 && referencia.trim().length <= 30;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <label htmlFor="ref-cliente" className="font-bold text-ink">
          Cliente / Referencia <span className="text-danger">*</span>
        </label>
        <span className={`font-mono text-xs ${esValida ? 'text-success' : 'text-ink-muted'}`}>
          {referencia.length}/30
        </span>
      </div>
      <div className="relative">
        <User className="w-4 h-4 text-ink-muted absolute left-3 top-3" aria-hidden="true" />
        <input
          id="ref-cliente"
          type="text"
          maxLength={30}
          value={referencia}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nombre o referencia del cliente (ej. Juan P.)"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-canvas text-xs focus:outline-hidden focus:border-primary text-ink font-medium"
        />
      </div>
    </div>
  );
};
