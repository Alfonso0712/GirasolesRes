import { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  LogIn,
  Utensils,
  UtensilsCrossed,
  Coffee,
  Flame,
  Calendar,
  ChefHat,
  RotateCcw,
  CheckCircle2,
  Search,
  X,
  Heart,
  ShieldCheck,
  Clock,
  CreditCard,
  Smartphone,
  ShoppingBag,
  MapPin,
  Phone,
  Sparkles,
  Menu as MenuIcon,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { landingService, type ProductoCartaPublica } from '../services/landingService';
import type { MenuDiaResponse } from '../types/menuDia';
import { formatCategoriaLabel } from '../utils/formatCategory';
import logoGirasoles from '../assets/LOGO_GIRASOLES.png';

interface LandingPageProps {
  onGoToLogin: () => void;
}

const CATEGORIAS_FILTRO = [
  { id: 'Todas', label: 'Todos los platos', icon: null },
  { id: 'Desayuno', label: 'Desayunos', icon: '☕' },
  { id: 'Almuerzo', label: 'Almuerzos & Extras', icon: '🍲' },
  { id: 'PlatosExtras', label: 'Platos a la Carta', icon: '🥩' },
  { id: 'Combinados', label: 'Combinados', icon: '🍛' },
  { id: 'Bebidas', label: 'Bebidas & Jarras', icon: '🍹' },
];

export function LandingPage({ onGoToLogin }: LandingPageProps) {
  const [productos, setProductos] = useState<ProductoCartaPublica[]>([]);
  const [menuDia, setMenuDia] = useState<MenuDiaResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorBackend, setErrorBackend] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);

  // Estado del modal de armado interactivo
  const [modalArmador, setModalArmador] = useState<{
    abierto: boolean;
    tipo: 'desayuno' | 'almuerzo' | 'segundo';
    titulo: string;
    precio: number;
  }>({
    abierto: false,
    tipo: 'almuerzo',
    titulo: '',
    precio: 0,
  });

  const [seleccionDesayunoBebida, setSeleccionDesayunoBebida] = useState<string>('');
  const [seleccionDesayunoPlato, setSeleccionDesayunoPlato] = useState<string>('');
  const [seleccionAlmuerzoEntrada, setSeleccionAlmuerzoEntrada] = useState<string>('');
  const [seleccionAlmuerzoSegundo, setSeleccionAlmuerzoSegundo] = useState<string>('');
  const [mensajeModalFeedback, setMensajeModalFeedback] = useState<string | null>(null);

  // Carga de datos en vivo desde el backend
  const cargarDatosEnVivo = async () => {
    try {
      setCargando(true);
      setErrorBackend(false);

      const [resProductos, resMenu] = await Promise.allSettled([
        landingService.obtenerCartaPublica(),
        landingService.obtenerMenuPublico(),
      ]);

      if (resProductos.status === 'fulfilled') {
        setProductos(resProductos.value);
      } else {
        setErrorBackend(true);
      }

      if (resMenu.status === 'fulfilled') {
        setMenuDia(resMenu.value);
      }
    } catch {
      setErrorBackend(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosEnVivo();
    // Actualización periódica en segundo plano cada 30 segundos
    const intervalo = setInterval(cargarDatosEnVivo, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Mapeo de platos agotados según la cocina hoy
  const productosAgotadosSet = useMemo(() => {
    const setAgotados = new Set<string>();
    if (menuDia) {
      if (menuDia.platos) {
        menuDia.platos.forEach((p) => {
          if (p.agotado) setAgotados.add(p.productoId);
        });
      }
      if (menuDia.opciones) {
        menuDia.opciones.forEach((o) => {
          if (o.agotado) setAgotados.add(o.productoId);
        });
      }
    }
    return setAgotados;
  }, [menuDia]);

  // Conjunto de IDs de productos definidos en el menú del día
  const idsDefinidosEnMenu = useMemo(() => {
    const setIds = new Set<string>();
    if (menuDia && menuDia.definido) {
      if (menuDia.desayuno?.id) {
        setIds.add(menuDia.desayuno.id);
      }
      menuDia.platos?.forEach((p) => {
        if (p.productoId) setIds.add(p.productoId);
      });
      menuDia.opciones?.forEach((o) => {
        if (o.productoId) setIds.add(o.productoId);
      });
      menuDia.menusCompletos?.forEach((mc) => {
        mc.partes?.forEach((parte) => {
          parte.opciones?.forEach((op) => {
            if (op.productoId) setIds.add(op.productoId);
          });
        });
      });
    }
    return setIds;
  }, [menuDia]);

  // Filtrado de la carta: muestra ÚNICAMENTE lo definido en el menú del día
  const productosFiltrados = useMemo(() => {
    let lista = productos;
    if (menuDia) {
      if (menuDia.definido) {
        lista = lista.filter((p) => idsDefinidosEnMenu.has(p.id));
      } else {
        lista = [];
      }
    }

    if (categoriaSeleccionada !== 'Todas') {
      lista = lista.filter((p) => {
        const cat = p.categoria || '';
        if (categoriaSeleccionada === 'PlatosExtras') {
          return cat === 'PlatosExtras' || cat === 'Platos Extras';
        }
        return cat.toLowerCase() === categoriaSeleccionada.toLowerCase();
      });
    }

    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(q));
    }

    return lista;
  }, [productos, menuDia, idsDefinidosEnMenu, categoriaSeleccionada, busqueda]);

  // Opciones para el armador interactivo extraídas de la carta / menú
  const bebidasDesayuno = useMemo(
    () => productos.filter((p) => p.rol === 'BebidaDesayuno' || p.categoria === 'Desayuno'),
    [productos]
  );
  const platosDesayuno = useMemo(
    () => productos.filter((p) => p.rol === 'PlatoDesayuno'),
    [productos]
  );
  const entradasAlmuerzo = useMemo(
    () => productos.filter((p) => p.rol === 'Entrada' || p.rol === 'Sopa'),
    [productos]
  );
  const segundosAlmuerzo = useMemo(
    () => productos.filter((p) => p.rol === 'Segundo' || p.categoria === 'Almuerzo'),
    [productos]
  );

  const abrirArmador = (tipo: 'desayuno' | 'almuerzo' | 'segundo') => {
    let titulo = 'Armar Almuerzo Completo';
    let precio = 8.0;

    if (tipo === 'desayuno') {
      titulo = 'Armar Desayuno Completo';
      precio = 7.0;
      setSeleccionDesayunoBebida(bebidasDesayuno[0]?.nombre || 'Café pasado tradicional');
      setSeleccionDesayunoPlato(platosDesayuno[0]?.nombre || 'Pan con chicharrón');
    } else if (tipo === 'segundo') {
      titulo = 'Elegir Solo Segundo';
      precio = 7.0;
      setSeleccionAlmuerzoSegundo(segundosAlmuerzo[0]?.nombre || 'Lomo saltado criollo');
    } else {
      titulo = 'Armar Almuerzo Completo Criollo';
      precio = 8.0;
      setSeleccionAlmuerzoEntrada(entradasAlmuerzo[0]?.nombre || 'Papa a la huancaína (Entrada)');
      setSeleccionAlmuerzoSegundo(segundosAlmuerzo[0]?.nombre || 'Bistec a lo pobre');
    }

    setMensajeModalFeedback(null);
    setModalArmador({ abierto: true, tipo, titulo, precio });
  };

  const confirmarCombinacion = () => {
    setMensajeModalFeedback('¡Excelente elección! Puedes solicitar esta combinación directamente en salón o mostrador al ingresar al restaurante.');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#26150A] font-sans selection:bg-[#D35400] selection:text-white">
            {/* ==================== ENCABEZADO Y NAVEGACIÓN ==================== */}
      <header className="bg-[#3A2211] text-white shadow-lg border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-[#3A2211]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:p-4">
          {/* Logo Oficial del Sistema */}
          <a href="#inicio" className="flex items-center gap-3.5 group focus:outline-none">
            <img
              src="/favicon.png"
              alt="Isotipo Girasoles"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0 shadow-md ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <img
                src={logoGirasoles}
                alt="Restaurante Girasoles"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-md"
              />
              <span className="text-[10px] sm:text-[11px] text-amber-200/80 tracking-wide font-medium -mt-1 hidden sm:block">
                Sabor Tradicional & Calidad
              </span>
            </div>
          </a>

          {/* Menú de navegación desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-200">
            <a href="#inicio" className="hover:text-amber-400 transition-colors">
              Inicio
            </a>
            <a href="#menus-del-dia" className="hover:text-amber-400 transition-colors">
              Menús del Día
            </a>
            <a href="#carta" className="hover:text-amber-400 transition-colors">
              Carta Completa
            </a>
            <a href="#nosotros" className="hover:text-amber-400 transition-colors">
              Nosotros
            </a>
            <a href="#servicios" className="hover:text-amber-400 transition-colors">
              Servicios & Pagos
            </a>
            <a href="#contacto" className="hover:text-amber-400 transition-colors">
              Horarios y Local
            </a>
          </nav>

          {/* Botón de Acción Principal (Login) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="min-h-[42px] sm:min-h-[44px] px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D35400] to-amber-600 hover:from-[#B84700] hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Iniciar Sesión</span>
            </button>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuAbierto(!mobileMenuAbierto)}
              className="lg:hidden p-2 rounded-xl text-stone-200 hover:bg-white/10"
              aria-label="Abrir menú de navegación"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuAbierto && (
          <div className="lg:hidden bg-[#2E1A0C] border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
            <a
              href="#inicio"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Inicio
            </a>
            <a
              href="#menus-del-dia"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Menús del Día
            </a>
            <a
              href="#carta"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Carta Completa
            </a>
            <a
              href="#nosotros"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Nosotros
            </a>
            <a
              href="#servicios"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Servicios & Pagos
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuAbierto(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              Horarios y Ubicación
            </a>
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuAbierto(false);
                  onGoToLogin();
                }}
                className="w-full py-3 rounded-xl bg-[#D35400] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ==================== HERO SECTION ==================== */}
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

              <p className="text-base sm:text-lg text-stone-200 max-w-2xl leading-relaxed">
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
                  <p className="text-xs text-stone-300">Desayunos completos</p>
                </div>
                <div>
                  <p className="text-amber-400 font-extrabold text-xl sm:text-2xl tabular-nums">
                    S/ 8.00
                  </p>
                  <p className="text-xs text-stone-300">Almuerzo criollo del día</p>
                </div>
                <div>
                  <p className="text-amber-400 font-extrabold text-xl sm:text-2xl tabular-nums">
                    {idsDefinidosEnMenu.size > 0 ? `${idsDefinidosEnMenu.size}` : (productos.length > 0 ? `${productos.length}` : '34')}
                  </p>
                  <p className="text-xs text-stone-300">Platos en menú de hoy</p>
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

      {/* ==================== SECCIÓN: MENÚS DEL DÍA ==================== */}
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
                onClick={cargarDatosEnVivo}
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
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <p className="font-bold text-xs uppercase text-[#D35400]">1. Bebida de Desayuno</p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Café pasado, Jugo de papaya, Quinua carretillera o Quaker con leche.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <p className="font-bold text-xs uppercase text-[#D35400]">2. Sánguche o Plato</p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Pan con chicharrón, Pan con pollo deshilachado, Pan con palta o queso fresco.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => abrirArmador('desayuno')}
                className="mt-6 w-full py-3 rounded-xl bg-amber-50 hover:bg-[#D35400] hover:text-white text-[#D35400] border border-[#D35400]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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

                <div className="mt-5 p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Precio
                  </span>
                  <span className="text-3xl font-extrabold text-[#D35400] tabular-nums">S/ 8.00</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Incluye vaso de Refresco del día</span>
                </div>

                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <p className="font-bold text-xs uppercase text-[#D35400]">
                      1. Sopa o Entrada del Día
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Sopa criolla, Sopa a la minuta, Papa a la huancaína u Ocopa arequipeña.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <p className="font-bold text-xs uppercase text-[#D35400]">
                      2. Plato de Fondo (Segundo)
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Bistec a lo pobre, Arroz chaufa de pollo, Seco de pollo con frejoles o Lomo saltado.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => abrirArmador('almuerzo')}
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
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <p className="font-bold text-xs uppercase text-[#D35400]">
                      1. Plato de Fondo del Día
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Elige directamente cualquiera de nuestros segundos criollos preparados hoy en cocina.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => abrirArmador('segundo')}
                className="mt-6 w-full py-3 rounded-xl bg-amber-50 hover:bg-[#D35400] hover:text-white text-[#D35400] border border-[#D35400]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Probar combinaciones
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECCIÓN: NUESTRA CARTA COMPLETA EN TIEMPO REAL ==================== */}
      <section id="carta" className="py-16 lg:py-24 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título y Buscador */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5 text-amber-700" /> Carta en Vivo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3A2211] mt-2">
                Nuestra Carta del Día
              </h2>
              <p className="text-stone-600 mt-1 text-sm sm:text-base">
                Platos disponibles definidos para el menú de hoy. Si un plato se agota en cocina, se refleja
                aquí al instante.
              </p>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre (ej. Lomo, Café)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF7F4] border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_FILTRO.map((cat) => {
                const activo = categoriaSeleccionada === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activo
                        ? 'bg-[#3A2211] text-white shadow-xs'
                        : 'bg-[#FAF7F4] hover:bg-stone-200 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-semibold text-stone-500 tabular-nums">
              {cargando
                ? 'Cargando carta...'
                : `Mostrando ${productosFiltrados.length} ${
                    productosFiltrados.length === 1 ? 'producto' : 'productos'
                  }`}
            </span>
          </div>

          {/* Grid de Platos */}
          {cargando && productos.length === 0 ? (
            <div className="py-20 text-center">
              <RotateCcw className="w-8 h-8 animate-spin mx-auto text-[#D35400] mb-3" />
              <p className="text-sm font-semibold text-stone-600">
                Cargando carta en tiempo real desde el restaurante...
              </p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF7F4] rounded-2xl border border-stone-200 p-8">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <p className="font-bold text-base text-[#3A2211]">
                {menuDia && !menuDia.definido
                  ? 'El menú del día aún no ha sido definido para hoy'
                  : 'No se encontraron platos'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {menuDia && !menuDia.definido
                  ? 'Nuestro equipo de cocina está definiendo la oferta del día. Consulta en unos minutos.'
                  : 'Prueba con otro término de búsqueda o selecciona otra categoría.'}
              </p>
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#D35400] text-white text-xs font-bold cursor-pointer hover:bg-[#B84700]"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {productosFiltrados.map((item) => {
                const estaAgotado = productosAgotadosSet.has(item.id);
                const precio = item.precio ?? 0;
                const categoriaLabel = formatCategoriaLabel(item.categoria || item.rol || 'Carta');

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {categoriaLabel}
                        </span>

                        {estaAgotado ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Disponible
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#D35400] transition-colors line-clamp-2">
                        {item.nombre}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-400 font-medium">Precio</span>
                      <span className="text-base font-extrabold text-[#D35400] tabular-nums">
                        {precio > 0 ? `S/ ${precio.toFixed(2)}` : 'Incluido en menú'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Aviso si el servidor no responde */}
          {errorBackend && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No fue posible sincronizar algunos datos en vivo. Puedes reintentar la conexión.
                </span>
              </div>
              <button
                onClick={cargarDatosEnVivo}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition shrink-0 cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================== SECCIÓN: SOBRE NOSOTROS ==================== */}
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

      {/* ==================== SECCIÓN: SERVICIOS Y MEDIOS DE PAGO ==================== */}
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

      {/* ==================== SECCIÓN: HORARIOS Y UBICACIÓN ==================== */}
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

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#26150A] text-stone-400 text-xs py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/favicon.png"
              alt="Isotipo Girasoles"
              className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-md ring-1 ring-white/20"
            />
            <div className="flex flex-col">
              <img
                src={logoGirasoles}
                alt="Restaurante Girasoles"
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs mb-1"
              />
              <p className="font-semibold text-stone-200">
                Restaurante Girasoles © 2026 • RUC 20481234567
              </p>
              <p className="text-stone-400 text-[11px]">
                Comida criolla preparada con cariño y servida con calidad.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onGoToLogin}
              className="text-amber-400 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ingreso al Sistema POS GirasolesRes</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ==================== MODAL DE ARMADO INTERACTIVO ==================== */}
      {modalArmador.abierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-stone-200 overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#3A2211]">{modalArmador.titulo}</h3>
                <p className="text-xs text-stone-500">Simula tu combinación favorita del menú</p>
              </div>
              <button
                onClick={() => setModalArmador((prev) => ({ ...prev, abierto: false }))}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {modalArmador.tipo === 'desayuno' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      1. Bebida de Desayuno
                    </label>
                    <select
                      value={seleccionDesayunoBebida}
                      onChange={(e) => setSeleccionDesayunoBebida(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                    >
                      {bebidasDesayuno.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      2. Sánguche / Plato
                    </label>
                    <select
                      value={seleccionDesayunoPlato}
                      onChange={(e) => setSeleccionDesayunoPlato(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                    >
                      {platosDesayuno.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modalArmador.tipo === 'almuerzo' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      1. Sopa o Entrada del Día
                    </label>
                    <select
                      value={seleccionAlmuerzoEntrada}
                      onChange={(e) => setSeleccionAlmuerzoEntrada(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                    >
                      {entradasAlmuerzo.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      2. Plato de Fondo (Segundo)
                    </label>
                    <select
                      value={seleccionAlmuerzoSegundo}
                      onChange={(e) => setSeleccionAlmuerzoSegundo(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                    >
                      {segundosAlmuerzo.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modalArmador.tipo === 'segundo' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    1. Plato de Fondo (Segundo Criollo)
                  </label>
                  <select
                    value={seleccionAlmuerzoSegundo}
                    onChange={(e) => setSeleccionAlmuerzoSegundo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                  >
                    {segundosAlmuerzo.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mensajeModalFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{mensajeModalFeedback}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <div>
                <span className="text-[11px] uppercase font-bold text-stone-400">Total</span>
                <p className="text-xl font-extrabold text-[#D35400] tabular-nums">
                  S/ {modalArmador.precio.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalArmador((prev) => ({ ...prev, abierto: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={confirmarCombinacion}
                  className="px-5 py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Elegir esta opción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
