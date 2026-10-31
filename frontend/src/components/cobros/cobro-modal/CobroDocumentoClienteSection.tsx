import React from 'react';
import { AlertCircle, Search, Loader2 } from 'lucide-react';
import type { TipoComprobante } from '../../../types/cobro';

export interface CobroDocumentoClienteSectionProps {
  tipoComprobante: TipoComprobante;
  modoBoleta: 'simple' | 'dni';
  setModoBoleta: (modo: 'simple' | 'dni') => void;
  esExigidoDocumentoPorMonto: boolean;
  numDoc: string;
  setNumDoc: (num: string) => void;
  razonSocial: string;
  setRazonSocial: (val: string) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  buscandoDoc: boolean;
  docFeedback: { tipo: 'ok' | 'error'; texto: string } | null;
  onConsultarDocumento: () => Promise<void>;
}

export const CobroDocumentoClienteSection: React.FC<CobroDocumentoClienteSectionProps> = ({
  tipoComprobante,
  modoBoleta,
  setModoBoleta,
  esExigidoDocumentoPorMonto,
  numDoc,
  setNumDoc,
  razonSocial,
  setRazonSocial,
  direccion,
  setDireccion,
  buscandoDoc,
  docFeedback,
  onConsultarDocumento,
}) => {
  return (
    <>
      {/* Campos específicos de Boleta */}
      {tipoComprobante === 'Boleta' && (
        <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200/80 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink">Modalidad de Boleta:</span>
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-neutral-200 text-xs">
              <button
                type="button"
                disabled={esExigidoDocumentoPorMonto}
                onClick={() => setModoBoleta('simple')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  modoBoleta === 'simple'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                } ${esExigidoDocumentoPorMonto ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setModoBoleta('dni')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  modoBoleta === 'dni'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Con DNI
              </button>
            </div>
          </div>

          {esExigidoDocumentoPorMonto && (
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
              <span>Por normativa tributaria (SUNAT), ventas iguales o superiores a S/ 700.00 requieren DNI o RUC.</span>
            </div>
          )}

          {(modoBoleta === 'dni' || esExigidoDocumentoPorMonto) && (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="form-label-standard">
                  Número de DNI (8 dígitos)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={numDoc}
                    onChange={(e) => setNumDoc(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 44444444"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-sm tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={onConsultarDocumento}
                    disabled={buscandoDoc || numDoc.trim().length !== 8}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buscandoDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Consultar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label-standard">
                  Nombre o Titular
                </label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Nombres y Apellidos"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-sm bg-surface"
                />
              </div>

              {docFeedback && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    docFeedback.tipo === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {docFeedback.texto}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Campos específicos de Factura */}
      {tipoComprobante === 'Factura' && (
        <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200/80 space-y-2.5 animate-in fade-in duration-150">
          <div>
            <label className="form-label-standard">
              Número de RUC (11 dígitos, inicia con 10 o 20)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={11}
                value={numDoc}
                onChange={(e) => setNumDoc(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 20131312955"
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-sm tabular-nums"
              />
              <button
                type="button"
                onClick={onConsultarDocumento}
                disabled={buscandoDoc || numDoc.trim().length !== 11}
                className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buscandoDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Consultar</span>
              </button>
            </div>
          </div>

          <div>
            <label className="form-label-standard">
              Razón Social <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Razón Social de la Empresa"
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-sm bg-surface"
            />
          </div>

          <div>
            <label className="form-label-standard">
              Dirección Fiscal
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección Fiscal (Opcional)"
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-xs bg-surface"
            />
          </div>

          {docFeedback && (
            <div
              className={`text-xs p-2 rounded-lg ${
                docFeedback.tipo === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {docFeedback.texto}
            </div>
          )}
        </div>
      )}
    </>
  );
};
