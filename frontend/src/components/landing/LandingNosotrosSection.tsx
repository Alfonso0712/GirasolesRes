import React from 'react';
import { Heart, ShieldCheck, Clock } from 'lucide-react';

export const LandingNosotrosSection: React.FC = () => {
  return (
    <section id="nosotros" className="py-16 lg:py-24 bg-[#FAF7F4] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-[#D35400]" /> Nuestra Historia
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3A2211] leading-tight">
              Pasión por la comida casera y la tradición culinaria peruana.
            </h2>
            <p className="text-stone-600 leading-relaxed text-base">
              En <strong>Restaurante Girasoles</strong> creemos que la buena comida empieza con
              ingredientes de calidad, cariño en la sazón y un servicio atento. Desde nuestros
              desayunos con café recién pasado hasta nuestros almuerzos y combinados marinos, cada
              plato se prepara pensando en hacerte sentir como en casa.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="font-bold text-[#3A2211] text-sm">Higiene y Frescura</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Insumos seleccionados cada mañana del mercado local.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <Clock className="w-6 h-6 text-amber-600 mb-2" />
                <h4 className="font-bold text-[#3A2211] text-sm">Atención Rápida</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Servicio ágil tanto en salón como en pedidos para llevar.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                alt="Ambiente del Restaurante Girasoles"
                className="w-full h-[380px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#26150A]/90 via-[#26150A]/40 to-transparent p-6 text-white">
                <p className="font-bold text-lg">Un rincón acogedor para compartir</p>
                <p className="text-xs text-stone-300">Salón principal y patio exterior climatizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
