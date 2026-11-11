import React, { useRef } from 'react';
import { BookOpen, Info } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Button } from '../ui/Button';
import { GuiaItemCard } from './GuiaItemCard';
import { GuiaFlujoHabitual } from './GuiaFlujoHabitual';
import { useAccesibilidadDialogo } from '../../hooks/useAccesibilidadDialogo';
import type { GuiaRol } from '../../types/guia';

export interface GuiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  guia: GuiaRol;
}

const TITULO = 'Guía del sistema';
const AVISO = 'Esta guía muestra los módulos y acciones disponibles para su rol.';
const SIN_MODULOS = 'No hay módulos asignados a su rol.';
const TEXTO_CERRAR = 'Entendido';

/** Modal informativo con los módulos y el flujo habitual del rol en sesión. */
export const GuiaModal: React.FC<GuiaModalProps> = ({ isOpen, onClose, guia }) => {
  const anclaRef = useRef<HTMLDivElement>(null);
  const entendidoRef = useRef<HTMLButtonElement>(null);

  useAccesibilidadDialogo({ isOpen, onClose, anclaRef, focoInicialRef: entendidoRef });

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={TITULO}
      subtitle={`Lo que puede hacer como ${guia.rol}`}
      icon={BookOpen}
      iconClassName="bg-brand-tint text-accent"
      maxWidth="3xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">Guía según su rol · {guia.rol}</span>
          <Button ref={entendidoRef} variant="primary" fullWidth={false} onClick={onClose}>
            {TEXTO_CERRAR}
          </Button>
        </div>
      }
    >
      <div ref={anclaRef} className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg border border-info-border text-info">
          <Info className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold">{AVISO}</p>
            <p className="mt-1">{guia.resumen}</p>
          </div>
        </div>

        {guia.secciones.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">{SIN_MODULOS}</p>
        ) : (
          guia.secciones.map((seccion) => (
            <section key={seccion.id} aria-label={seccion.titulo}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                {seccion.titulo}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {seccion.items.map((item) => (
                  <GuiaItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}

        <GuiaFlujoHabitual pasos={guia.flujoHabitual} />
      </div>
    </ModalWrapper>
  );
};

export default GuiaModal;
