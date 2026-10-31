import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';

export const LandingContactoSection: React.FC = () => {
  return (
    <section id="contacto" className="py-16 lg:py-20 bg-[#3A2211] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold text-base">
              <MapPin className="w-5 h-5" />
              <span>Ubicación de Nuestro Local</span>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Jr. Mariscal Castilla N° 1023
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold text-base">
              <Clock className="w-5 h-5" />
              <span>Horarios de Atención</span>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              <strong>Lunes a Sábado:</strong> 07:00 AM – 04:00 PM
              <br />
              <strong>Domingos:</strong> Cerrado
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold text-base">
              <Phone className="w-5 h-5" />
              <span>Pedidos y Consultas</span>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Teléfono / WhatsApp: 934127923
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
