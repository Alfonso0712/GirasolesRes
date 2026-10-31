import { useState, useEffect, useMemo } from 'react';
import { landingService, type ProductoCartaPublica } from '../services/landingService';
import type { MenuDiaResponse } from '../types/menuDia';
import {
  LandingHeader,
  LandingHeroSection,
  LandingMenuDiaSection,
  LandingCartaSection,
  LandingNosotrosSection,
  LandingServiciosSection,
  LandingContactoSection,
  LandingFooter,
  LandingArmadorModal,
} from '../components/landing';

interface LandingPageProps {
  onGoToLogin: () => void;
}

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

  // Asegurar que la landing page pública permanezca siempre en modo claro e inmune al tema del POS
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
      <LandingHeader
        onGoToLogin={onGoToLogin}
        mobileMenuAbierto={mobileMenuAbierto}
        setMobileMenuAbierto={setMobileMenuAbierto}
      />

      {/* ==================== HERO SECTION ==================== */}
      <LandingHeroSection
        idsDefinidosCount={idsDefinidosEnMenu.size}
        productosCount={productos.length}
      />

      {/* ==================== SECCIÓN: MENÚS DEL DÍA ==================== */}
      <LandingMenuDiaSection
        menuDia={menuDia}
        cargando={cargando}
        onCargarDatos={cargarDatosEnVivo}
        onAbrirArmador={abrirArmador}
      />

      {/* ==================== SECCIÓN: NUESTRA CARTA COMPLETA EN TIEMPO REAL ==================== */}
      <LandingCartaSection
        productos={productos}
        productosFiltrados={productosFiltrados}
        productosAgotadosSet={productosAgotadosSet}
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        cargando={cargando}
        errorBackend={errorBackend}
        menuDia={menuDia}
        onCargarDatos={cargarDatosEnVivo}
      />

      {/* ==================== SECCIÓN: SOBRE NOSOTROS ==================== */}
      <LandingNosotrosSection />

      {/* ==================== SECCIÓN: SERVICIOS Y MEDIOS DE PAGO ==================== */}
      <LandingServiciosSection />

      {/* ==================== SECCIÓN: HORARIOS Y UBICACIÓN ==================== */}
      <LandingContactoSection />

      {/* ==================== FOOTER ==================== */}
      <LandingFooter onGoToLogin={onGoToLogin} />

      {/* ==================== MODAL DE ARMADO INTERACTIVO ==================== */}
      <LandingArmadorModal
        modalArmador={modalArmador}
        onCerrar={() => setModalArmador((prev) => ({ ...prev, abierto: false }))}
        seleccionDesayunoBebida={seleccionDesayunoBebida}
        setSeleccionDesayunoBebida={setSeleccionDesayunoBebida}
        seleccionDesayunoPlato={seleccionDesayunoPlato}
        setSeleccionDesayunoPlato={setSeleccionDesayunoPlato}
        seleccionAlmuerzoEntrada={seleccionAlmuerzoEntrada}
        setSeleccionAlmuerzoEntrada={setSeleccionAlmuerzoEntrada}
        seleccionAlmuerzoSegundo={seleccionAlmuerzoSegundo}
        setSeleccionAlmuerzoSegundo={setSeleccionAlmuerzoSegundo}
        bebidasDesayuno={bebidasDesayuno}
        platosDesayuno={platosDesayuno}
        entradasAlmuerzo={entradasAlmuerzo}
        segundosAlmuerzo={segundosAlmuerzo}
        mensajeModalFeedback={mensajeModalFeedback}
        onConfirmar={confirmarCombinacion}
      />
    </div>
  );
}
