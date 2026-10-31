import { formatCurrency } from '../../utils/formatters';
import type { CandidatoMenu } from '../../types/menuDia';

export const formatearBadgeClasificacion = (item: { tipo: string; clasificacion: string; precio?: number }) => {
  if (item.tipo === 'Carta') {
    return item.precio != null ? `Carta · ${formatCurrency(item.precio)}` : 'Carta';
  }
  const rol = item.clasificacion || '';
  const MAPEO_ROLES: Record<string, string> = {
    BebidaDesayuno: 'Bebida desayuno',
    PlatoDesay: 'Plato desayuno',
    PlatoDesayuno: 'Plato desayuno',
    Sopa: 'Sopa',
    Entrada: 'Entrada',
    Segundo: 'Segundo',
    Postre: 'Postre',
    Refresco: 'Refresco',
    Bebida: 'Bebida',
  };
  if (MAPEO_ROLES[rol]) return MAPEO_ROLES[rol];
  return (
    rol
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase()) || 'Opción'
  );
};

export const agruparCandidatos = (candidatos: CandidatoMenu[]) => {
  const componentesActivos = candidatos.filter((c) => c.tipo === 'Componente');
  const cartaActiva = candidatos.filter((c) => c.tipo === 'Carta');

  return {
    compBebidasDesayuno: componentesActivos.filter((c) => c.rol === 'BebidaDesayuno'),
    compPlatosDesayuno: componentesActivos.filter((c) => c.rol === 'PlatoDesayuno'),
    compSopas: componentesActivos.filter((c) => c.rol === 'Sopa'),
    compEntradas: componentesActivos.filter((c) => c.rol === 'Entrada'),
    compSegundos: componentesActivos.filter((c) => c.rol === 'Segundo'),

    cartaDesayunos: cartaActiva.filter((c) => c.categoria === 'Desayuno'),
    cartaAlmuerzos: cartaActiva.filter(
      (c) => c.categoria === 'Almuerzo' || c.categoria === 'PlatosExtras' || c.categoria === 'Platos Extras'
    ),
    cartaCombinados: cartaActiva.filter((c) => c.categoria === 'Combinados'),
    cartaBebidas: cartaActiva.filter(
      (c) => c.categoria === 'Bebidas' || c.categoria === 'Bebidas y Refrescos'
    ),
    cartaOtros: cartaActiva.filter((c) => c.categoria === 'Otro' || c.categoria === 'Otros'),
  };
};
