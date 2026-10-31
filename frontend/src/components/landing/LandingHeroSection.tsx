import React from 'react';
import {
  Flame,
  UtensilsCrossed,
  Calendar,
  Sparkles,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react';

export interface LandingHeroSectionProps {
  idsDefinidosCount: number;
  productosCount: number;
}

export const LandingHeroSection: React.FC<LandingHeroSectionProps> = ({
  idsDefinidosCount,
  productosCount,
}) => {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-[#3A2211] via-[#2E1A0C] to-[#26150A] text-white py-16 lg:py-24"
    >
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#26150A] via-[#3A2211]/90 to-[#3A2211]/80 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Mensaje principal */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Tradición, Sazón Criolla y Calidad Garantizada
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
              El auténtico sabor peruano en <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-[#D35400] font-serif italic">
                Restaurante Girasoles.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
              Comida criolla y gastronomía peruana preparada cada mañana con insumos frescos. Revisa
              nuestra oferta del día sincronizada en tiempo real con nuestra cocina o realiza tus
              pedidos en salón y para llevar.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <a
                href="#carta"
                className="w-full sm:w-auto min-h-[50px] px-6 sm:px-7 py-3.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer group text-center"
              >
                <UtensilsCrossed className="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
                <span>EXPLORAR CARTA DE HOY</span>
              </a>

              <a
                href="#menus-del-dia"
                className="w-full sm:w-auto min-h-[50px] px-6 sm:px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center"
              >
                <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                <span>VER MENÚ DEL DÍA</span>
              </a>
            </div>

            {/* Precios y Platos Activos */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-amber-400 font-extrabold text-xl sm:text-2xl tabular-nums">
                  S/ 7.00
                </p>
                <p className="text-xs text-amber-100/80">Desayunos completos</p>
              </div>
              <div>
                <p className="text-amber-400 font-extrabold text-xl sm:text-2xl tabular-nums">
                  S/ 8.00
                </p>
                <p className="text-xs text-amber-100/80">Almuerzo criollo del día</p>
              </div>
              <div>
                <p className="text-amber-400 font-extrabold text-xl sm:text-2xl tabular-nums">
                  {idsDefinidosCount > 0 ? `${idsDefinidosCount}` : (productosCount > 0 ? `${productosCount}` : '34')}
                </p>
                <p className="text-xs text-amber-100/80">Platos en menú de hoy</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Información y Contacto Rápido */}
          <div className="lg:col-span-5">
            <div className="bg-white text-[#26150A] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D35400] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Atención en Salón y Para Llevar
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#3A2211]">Visítanos o Haz tu Pedido</h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                  Lun a Sáb
                </span>
              </div>

              {/* Fila 1: Horario de atención */}
              <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-stone-200 flex items-center gap-3.5 shadow-xs hover:border-amber-300 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Horario de Atención
                  </span>
                  <h3 className="font-bold text-[#3A2211] text-sm sm:text-base mt-0.5">
                    7:00 AM – 4:00 PM
                  </h3>
                  <p className="text-xs text-stone-500">Desayunos y almuerzos criollos de lunes a sábado</p>
                </div>
              </div>

              {/* Fila 2: Dirección y ubicación */}
              <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#D35400] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-[#D35400]">
                      Dirección
                    </span>
                    <h3 className="font-bold text-[#3A2211] text-sm sm:text-base mt-0.5 truncate">
                      Jr. Mariscal Castilla N° 1023
                    </h3>
                    <p className="text-xs text-stone-500 truncate">Mesas cómodas en salón y recojo en mostrador</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jr.+Mariscal+Castilla+N%C2%B0+1023"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-amber-400 text-[#3A2211] hover:text-[#D35400] text-xs font-bold shrink-0 transition-colors cursor-pointer text-center"
                >
                  Ver mapa
                </a>
              </div>

              {/* Fila 3: Teléfono y pedidos */}
              <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Teléfono & Consultas
                    </span>
                    <h3 className="font-bold text-[#3A2211] text-sm sm:text-base mt-0.5 tabular-nums">
                      934 127 923
                    </h3>
                    <p className="text-xs text-stone-500 truncate">Consultas sobre platos del día o pedidos</p>
                  </div>
                </div>
                <a
                  href="tel:934127923"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer text-center"
                >
                  Llamar
                </a>
              </div>

              <p className="text-[11px] text-stone-500 text-center pt-1 font-medium">
                Aceptamos efectivo, Yape y Plin • Porciones generosas y atención rápida
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
