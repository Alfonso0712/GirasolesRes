import React from 'react';

export const AuthBrandPanel: React.FC = () => {
  return (
    <aside className="hidden lg:flex lg:w-[60%] lg:max-w-[60%] lg:basis-[60%] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden shrink-0 grow-0 select-none h-full bg-ink-fill">
      {/* Fotografía gastronómica de fondo con imagen oficial del restaurante */}
      <img
        src="/bg-login-gastronomia.png"
        alt="Gastronomía Restaurante Girasoles"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Superposición con color café corporativo cálido y semitransparente para preservar contraste y legibilidad */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(36, 20, 11, 0.70) 0%, rgba(58, 34, 17, 0.52) 50%, rgba(44, 26, 14, 0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Cabecera de Logo superior izquierda */}
      <div className="relative z-10 flex items-center gap-3.5">
        <img
          src="/favicon.png"
          alt="Isotipo Girasoles"
          className="w-12 h-12 rounded-full object-cover shrink-0 shadow-lg ring-2 ring-white/20"
        />
        <img
          src="/LOGO_GIRASOLES.png"
          alt="Girasoles Restaurante"
          className="h-8 w-auto object-contain drop-shadow-md"
        />
      </div>

      {/* Textos Centrales alineados a la izquierda y centrados verticalmente */}
      <div className="relative z-10 my-auto py-8 max-w-xl text-left">
        <div className="mb-4">
          <span className="text-[#F39C12] font-bold tracking-widest text-xs uppercase block mb-2 drop-shadow">
            BIENVENIDOS A:
          </span>
          <div className="w-12 h-0.5 bg-[#F39C12] rounded-full shadow-sm" />
        </div>

        <h1 className="font-bold text-5xl lg:text-6xl text-white leading-tight mb-5 tracking-tight drop-shadow-lg">
          GirasolesRes.<br />
        </h1>

        <p className="text-white/95 font-sans text-base lg:text-lg max-w-md leading-relaxed drop-shadow-md font-medium">
          Restaurante de comida criolla y gastronomía peruana, preparada con cariño y servida con calidad.
        </p>
      </div>

      {/* Pie de página inferior institucional */}
      <footer className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/80 font-medium drop-shadow-sm">
        <span>Restaurante Girasoles &copy; {new Date().getFullYear()}</span>
        <span className="tracking-wide">Punto de Venta Profesional</span>
      </footer>
    </aside>
  );
};

export default AuthBrandPanel;
