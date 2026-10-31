import React from 'react';
import { CreditCard, Smartphone, ShoppingBag } from 'lucide-react';

export const LandingServiciosSection: React.FC = () => {
  return (
    <section id="servicios" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#3A2211] text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-[#D35400]" /> Facilidades para el Cliente
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3A2211] mt-3">
            Comodidad, Rapidez y Pagos Simples
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Pensado para que disfrutes tu comida sin complicaciones al momento de pagar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#FAF7F4] border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3A2211] mb-2">Yape, Plin & Efectivo</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Aceptamos pagos digitales mediante Yape y Plin escaneando el código QR en caja, o
              efectivo con cambio exacto.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F4] border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3A2211] mb-2">Para Llevar y Salón</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Empaques térmicos seguros y ecológicos para llevar tu comida caliente o mesas cómodas
              para almorzar en el local.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
