import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface InactivityModalProps {
  isOpen: boolean;
  onContinue: () => Promise<void>;
  onTimeout: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  onContinue,
  onTimeout
}) => {
  const [segundosRestantes, setSegundosRestantes] = useState(120); // 2 minutos
  const [renovando, setRenovando] = useState(false);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  // Reiniciar contador al abrirse y colocar foco en CONTINUAR (RV-32)
  useEffect(() => {
    if (isOpen) {
      setSegundosRestantes(120);
      setRenovando(false);
      setTimeout(() => {
        continueBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Cuenta regresiva de 2 minutos
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onTimeout]);

  if (!isOpen) return null;

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormateado = `${minutos}:${segundos.toString().padStart(2, '0')}`;

  const handleContinueClick = async () => {
    setRenovando(true);
    try {
      await onContinue();
    } finally {
      setRenovando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-title"
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-amber-200 text-center relative"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-xs">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        {/* MSG-42 */}
        <h3 id="inactivity-title" className="text-xl font-sans font-bold text-[#2C1A0E] mb-2">
          Aviso de inactividad
        </h3>

        <p className="text-sm text-neutral-600 mb-2 leading-relaxed">
          Su sesión vencerá en <strong className="text-amber-700 font-bold tabular-nums">{tiempoFormateado}</strong> por inactividad.
        </p>
        <p className="text-xs text-neutral-500 mb-6">
          ¿Desea continuar trabajando en el sistema?
        </p>

        <button
          ref={continueBtnRef}
          type="button"
          onClick={handleContinueClick}
          disabled={renovando}
          className={`w-full py-2.5 px-4 rounded-xl bg-[#C74E00] hover:bg-[#B84600] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            renovando ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {renovando ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Renovando sesión…</span>
            </>
          ) : (
            'CONTINUAR'
          )}
        </button>
      </div>
    </div>
  );
};

export default InactivityModal;
