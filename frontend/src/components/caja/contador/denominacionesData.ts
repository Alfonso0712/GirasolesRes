export interface DenominacionDef {
  id: string;
  valor: number;
  etiqueta: string;
  tipo: 'billete' | 'moneda';
}

export const DENOMINACIONES: DenominacionDef[] = [
  // Billetes
  { id: 'b200', valor: 200, etiqueta: 'S/ 200', tipo: 'billete' },
  { id: 'b100', valor: 100, etiqueta: 'S/ 100', tipo: 'billete' },
  { id: 'b50', valor: 50, etiqueta: 'S/ 50', tipo: 'billete' },
  { id: 'b20', valor: 20, etiqueta: 'S/ 20', tipo: 'billete' },
  { id: 'b10', valor: 10, etiqueta: 'S/ 10', tipo: 'billete' },
  // Monedas
  { id: 'm5', valor: 5, etiqueta: 'S/ 5.00', tipo: 'moneda' },
  { id: 'm2', valor: 2, etiqueta: 'S/ 2.00', tipo: 'moneda' },
  { id: 'm1', valor: 1, etiqueta: 'S/ 1.00', tipo: 'moneda' },
  { id: 'm050', valor: 0.50, etiqueta: 'S/ 0.50', tipo: 'moneda' },
  { id: 'm020', valor: 0.20, etiqueta: 'S/ 0.20', tipo: 'moneda' },
  { id: 'm010', valor: 0.10, etiqueta: 'S/ 0.10', tipo: 'moneda' },
];
