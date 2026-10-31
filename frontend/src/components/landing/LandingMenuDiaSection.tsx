import React from 'react';
import {
  Calendar,
  ChefHat,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Sparkles,
  Utensils,
  Flame,
} from 'lucide-react';
import type { MenuDiaResponse } from '../../types/menuDia';

export interface LandingMenuDiaSectionProps {
  menuDia: MenuDiaResponse | null;
  cargando: boolean;
  onCargarDatos: () => void;
  onAbrirArmador: (tipo: 'desayuno' | 'almuerzo' | 'segundo') => void;
}

export const LandingMenuDiaSection: React.FC<LandingMenuDiaSectionProps> = ({
  menuDia,
  cargando,
  onCargarDatos,
  onAbrirArmador,
}) => {
  return (
    <section id="menus-del-dia" className="py-16 lg:py-24 bg-[#FAF7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#D35400] text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Oferta del Día
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3A2211] mt-3">
            Menús Completos del Día
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Opciones nutritivas y balanceadas para desayuno y almuerzo. Revisa las opciones y
            disponibilidad de cocina en este momento.
          </p>
        </div>

        {/* Barra de Estado del Menú */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-stone-500">Fecha Operativa:</span>
              <p className="text-sm font-bold text-[#3A2211]">
                {menuDia?.fecha
                  ? `Hoy, ${new Date(menuDia.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`
                  : 'Atención del día en curso'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Cocina en marcha
            </span>
            <button
              onClick={onCargarDatos}
              disabled={cargando}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
              <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* 3 Tarjetas de Fórmulas Oficiales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Desayuno Completo */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3A2211]">Desayuno completo</h3>
                    <p className="text-xs text-stone-500">Nutritivo y tradicional</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Disponible
                </span>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[#FAF7F4] border border-stone-200 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Precio
                </span>
                <span className="text-3xl font-extrabold text-[#D35400] tabular-nums">S/ 7.00</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Incluye Pan del día</span>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[#E8E2DC]">
                  <p className="font-bold text-xs uppercase text-[#D35400]">1. Bebida de Desayuno</p>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    Café pasado, Jugo de papaya, Quinua carretillera o Quaker con leche.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[#E8E2DC]">
                  <p className="font-bold text-xs uppercase text-[#D35400]">2. Sánguche o Plato</p>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    Pan con chicharrón, Pan con pollo deshilachado, Pan con palta o queso fresco.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAbrirArmador('desayuno')}
              className="mt-6 w-full py-3 rounded-xl bg-[#FFF6ED] hover:bg-[#D35400] hover:text-white text-[#D35400] border border-[#D35400]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Probar combinaciones
            </button>
          </div>

          {/* 2. Almuerzo Completo Criollo */}
          <div className="bg-white rounded-2xl border-2 border-[#D35400] shadow-lg hover:shadow-xl transition-all p-6 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D35400] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              El Favorito del Salón
            </div>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#D35400] flex items-center justify-center">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3A2211]">Almuerzo completo</h3>
                    <p className="text-xs text-stone-500">Menú criollo completo</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Disponible
                </span>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[#FFF6ED] border border-[#FDBA74] flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E55]">
                  Precio
                </span>
                <span className="text-3xl font-extrabold text-[#D35400] tabular-nums">S/ 8.00</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Incluye vaso de Refresco del día</span>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[#E8E2DC]">
                  <p className="font-bold text-xs uppercase text-[#D35400]">
                    1. Sopa o Entrada del Día
                  </p>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    Sopa criolla, Sopa a la minuta, Papa a la huancaína u Ocopa arequipeña.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[#E8E2DC]">
                  <p className="font-bold text-xs uppercase text-[#D35400]">
                    2. Plato de Fondo (Segundo)
                  </p>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    Bistec a lo pobre, Arroz chaufa de pollo, Seco de pollo con frejoles o Lomo saltado.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAbrirArmador('almuerzo')}
              className="mt-6 w-full py-3 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Probar combinaciones
            </button>
          </div>

          {/* 3. Solo Segundo */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3A2211]">Solo segundo</h3>
                    <p className="text-xs text-stone-500">Práctico y contundente</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Disponible
                </span>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[#FAF7F4] border border-stone-200 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Precio
                </span>
                <span className="text-3xl font-extrabold text-[#D35400] tabular-nums">S/ 7.00</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Incluye vaso de Refresco del día</span>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="p-3 rounded-xl bg-[#FAF7F4] border border-[#E8E2DC]">
                  <p className="font-bold text-xs uppercase text-[#D35400]">
                    1. Plato de Fondo del Día
                  </p>
                  <p className="text-xs text-[#5C4A3E] mt-0.5">
                    Elige directamente cualquiera de nuestros segundos criollos preparados hoy en cocina.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAbrirArmador('segundo')}
              className="mt-6 w-full py-3 rounded-xl bg-[#FFF6ED] hover:bg-[#D35400] hover:text-white text-[#D35400] border border-[#D35400]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Probar combinaciones
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
