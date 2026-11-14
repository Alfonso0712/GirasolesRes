import React, { useMemo } from 'react';
import { Calendar, Check } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { obtenerHoyLimaYMD } from '../../utils/fechas';

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export interface OpcionMes {
  id: string;
  etiqueta: string;
  desde: string;
  hasta: string;
}

/**
 * Calcula el rango `{ id, etiqueta, desde, hasta }` en formato AAAA-MM-DD para un año y mes (1..12).
 * Para el mes actual (según `hoyLimaYMD`), `hasta` es la fecha de hoy en Lima.
 * Para meses anteriores, `hasta` es el último día calendario del mes (incluyendo años bisiestos).
 */
export function calcularRangoMes(
  anio: number,
  mes1a12: number,
  hoyLimaYMD: string = obtenerHoyLimaYMD()
): OpcionMes {
  const mesStr = String(mes1a12).padStart(2, '0');
  const id = `${anio}-${mesStr}`;
  const nombreMes = NOMBRES_MESES[mes1a12 - 1] || 'Mes';
  const etiqueta = `${nombreMes} ${anio}`;
  const desde = `${anio}-${mesStr}-01`;

  const ultimoDia = new Date(Date.UTC(anio, mes1a12, 0)).getUTCDate();
  const finDeMes = `${anio}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;

  const esMesActual = hoyLimaYMD.startsWith(`${id}-`);
  const hasta = esMesActual ? hoyLimaYMD : finDeMes;

  return { id, etiqueta, desde, hasta };
}

/**
 * Genera los últimos 12 meses a partir de `hoyLimaYMD` (el mes actual primero).
 */
export function generarUltimos12Meses(
  hoyLimaYMD: string = obtenerHoyLimaYMD()
): OpcionMes[] {
  const partes = hoyLimaYMD.split('-').map(Number);
  const anioBase = partes[0] || new Date().getFullYear();
  const mesBase = partes[1] || new Date().getMonth() + 1;

  const lista: OpcionMes[] = [];
  for (let i = 0; i < 12; i++) {
    let totalMeses = anioBase * 12 + (mesBase - 1) - i;
    const anio = Math.floor(totalMeses / 12);
    const mes0a11 = ((totalMeses % 12) + 12) % 12;
    const mes1a12 = mes0a11 + 1;
    lista.push(calcularRangoMes(anio, mes1a12, hoyLimaYMD));
  }
  return lista;
}

export interface MesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mesSeleccionadoId?: string | null;
  incluirTodos?: boolean;
  onSeleccionar: (opcion: OpcionMes) => void;
  hoyReferenciaYMD?: string;
}

export const MesSheet: React.FC<MesSheetProps> = ({
  isOpen,
  onClose,
  mesSeleccionadoId,
  incluirTodos = false,
  onSeleccionar,
  hoyReferenciaYMD,
}) => {
  const meses = useMemo(
    () => generarUltimos12Meses(hoyReferenciaYMD),
    [hoyReferenciaYMD]
  );

  const opcionTodos: OpcionMes = {
    id: 'todos',
    etiqueta: 'Todos los meses',
    desde: '',
    hasta: '',
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Seleccionar mes">
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {incluirTodos && (
          <button
            type="button"
            onClick={() => {
              onSeleccionar(opcionTodos);
              onClose();
            }}
            className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              mesSeleccionadoId === 'todos'
                ? 'bg-primary text-white border-primary font-bold'
                : 'bg-canvas text-ink border-line hover:bg-surface-warm font-semibold'
            }`}
          >
            <span className="inline-flex items-center gap-2.5 text-sm">
              <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Todos los meses</span>
            </span>
            {mesSeleccionadoId === 'todos' && (
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        )}

        {meses.map((mes) => {
          const activo = mesSeleccionadoId === mes.id;
          return (
            <button
              key={mes.id}
              type="button"
              onClick={() => {
                onSeleccionar(mes);
                onClose();
              }}
              className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                activo
                  ? 'bg-primary text-white border-primary font-bold'
                  : 'bg-canvas text-ink border-line hover:bg-surface-warm font-semibold'
              }`}
            >
              <span className="inline-flex items-center gap-2.5 text-sm">
                <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{mes.etiqueta}</span>
              </span>
              {activo && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
