import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface MenuDiaAvisosProps {
  errorValidacionGuardar?: string | null;
  avisoExito?: string | null;
  avisoError?: string | null;
}

export const MenuDiaAvisos: React.FC<MenuDiaAvisosProps> = ({
  errorValidacionGuardar,
  avisoExito,
  avisoError,
}) => {
  return (
    <>
      {errorValidacionGuardar && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
          <div className="flex-1 font-medium">{errorValidacionGuardar}</div>
        </div>
      )}

      {avisoExito && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-success" />
          <span className="font-medium">{avisoExito}</span>
        </div>
      )}

      {avisoError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
          <span className="font-medium">{avisoError}</span>
        </div>
      )}
    </>
  );
};
