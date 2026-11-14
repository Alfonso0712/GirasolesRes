import { describe, it, expect } from 'vitest';
import {
  construirSeleccion,
  alternarOpcion,
  alternarGrupo,
  alternarMenuCompleto,
  contarSeleccionados,
  formatearContadorGrupo,
  agruparCandidatos,
  hayCambios,
  validarMenu,
  armarSolicitud,
  MSG_219,
  MSG_224,
} from './menuDia';
import type { CandidatoMenuDto, MenuDiaResponseDto } from '../types/menuDia';

const candidatosDemo: CandidatoMenuDto[] = [
  { id: 'c-beb-1', nombre: 'Café pasado', tipo: 'Componente', rol: 'BebidaDesayuno' },
  { id: 'c-beb-2', nombre: 'Quinua con manzana', tipo: 'Componente', rol: 'BebidaDesayuno' },
  { id: 'c-pld-1', nombre: 'Tamal criollo', tipo: 'Componente', rol: 'PlatoDesayuno' },
  { id: 'c-sop-1', nombre: 'Caldo de gallina', tipo: 'Componente', rol: 'Sopa' },
  { id: 'c-ent-1', nombre: 'Papa a la huancaína', tipo: 'Componente', rol: 'Entrada' },
  { id: 'c-seg-1', nombre: 'Seco de res con frejoles', tipo: 'Componente', rol: 'Segundo' },
  { id: 'c-seg-2', nombre: 'Ají de gallina', tipo: 'Componente', rol: 'Segundo' },
  { id: 'p-car-1', nombre: 'Lomo saltado especial', tipo: 'Carta', categoria: 'PlatosExtras', precio: 24 },
  { id: 'p-car-2', nombre: 'Chicha morada 1 L', tipo: 'Carta', categoria: 'Bebidas', precio: 10 },
];

const menuHoyDemo: MenuDiaResponseDto = {
  fecha: '2026-11-14',
  definido: true,
  platos: [
    {
      productoId: 'p-car-1',
      nombre: 'Lomo saltado especial',
      categoria: 'PlatosExtras',
      precio: 24,
      agotado: false,
    },
  ],
  opciones: [
    { productoId: 'c-sop-1', nombre: 'Caldo de gallina', rol: 'Sopa', agotado: false },
    { productoId: 'c-seg-1', nombre: 'Seco de res con frejoles', rol: 'Segundo', agotado: false },
  ],
  menusCompletos: [
    { id: 1, nombre: 'Desayuno completo', precio: 7, incluye: 'Pan', disponible: false, partes: [] },
    {
      id: 2,
      nombre: 'Almuerzo completo',
      precio: 8,
      incluye: 'Refresco del día',
      disponible: true,
      partes: [
        {
          id: 3,
          nombre: 'Sopa o entrada',
          orden: 1,
          rolesPermitidos: ['Sopa', 'Entrada'],
          opciones: [{ productoId: 'c-sop-1', nombre: 'Caldo de gallina', agotado: false }],
        },
        {
          id: 4,
          nombre: 'Segundo',
          orden: 2,
          rolesPermitidos: ['Segundo'],
          opciones: [{ productoId: 'c-seg-1', nombre: 'Seco de res con frejoles', agotado: false }],
        },
      ],
    },
    { id: 3, nombre: 'Solo segundo', precio: 7, incluye: 'Refresco del día', disponible: false, partes: [] },
  ],
};

describe('utils/menuDia - funciones puras de dominio del menú del día (M-A)', () => {
  it('construirSeleccion inicializa opciones, productosCarta y menusCompletos desde hoy y candidatos', () => {
    const sel = construirSeleccion(menuHoyDemo, candidatosDemo);
    expect(sel.opciones).toEqual(['c-seg-1', 'c-sop-1']);
    expect(sel.productosCarta).toEqual(['p-car-1']);
    expect(sel.menusCompletos).toEqual([2]);
  });

  it('hayCambios devuelve false cuando original y actual tienen los mismos elementos sin importar el orden', () => {
    const original = construirSeleccion(menuHoyDemo, candidatosDemo);
    const copia = {
      ...original,
      opciones: ['c-sop-1', 'c-seg-1'],
      productosCarta: ['p-car-1'],
      menusCompletos: [2],
    };

    expect(hayCambios(original, copia)).toBe(false);
  });

  it('hayCambios detecta modificaciones en opciones, carta o menús completos', () => {
    const original = construirSeleccion(menuHoyDemo, candidatosDemo);

    const conOtraOpcion = alternarOpcion(original, 'c-ent-1', 'Componente', 'Entrada');
    expect(hayCambios(original, conOtraOpcion)).toBe(true);

    const conOtraCarta = alternarOpcion(original, 'p-car-2', 'Carta');
    expect(hayCambios(original, conOtraCarta)).toBe(true);

    const conOtroMenu = alternarMenuCompleto(original, 3);
    expect(hayCambios(original, conOtroMenu)).toBe(true);
  });

  it('alternarGrupo selecciona todos cuando el grupo está parcial o vacío y deselecciona todos cuando ya están marcados', () => {
    const inicial = construirSeleccion(null, candidatosDemo);
    const grupoBebidas = candidatosDemo.filter((c) => c.rol === 'BebidaDesayuno');

    // 0 de 2 -> selecciona los 2
    const todosMarcados = alternarGrupo(inicial, grupoBebidas, 'Componente');
    expect(contarSeleccionados(grupoBebidas, todosMarcados)).toBe(2);
    expect(formatearContadorGrupo(contarSeleccionados(grupoBebidas, todosMarcados), grupoBebidas.length)).toBe('2 de 2');

    // 2 de 2 -> deselecciona todos (0 de 2)
    const ningunoMarcado = alternarGrupo(todosMarcados, grupoBebidas, 'Componente');
    expect(contarSeleccionados(grupoBebidas, ningunoMarcado)).toBe(0);

    // 1 de 2 -> selecciona todos (2 de 2)
    const unoMarcado = alternarOpcion(ningunoMarcado, 'c-beb-1', 'Componente', 'BebidaDesayuno');
    expect(contarSeleccionados(grupoBebidas, unoMarcado)).toBe(1);
    const deNuevoTodos = alternarGrupo(unoMarcado, grupoBebidas, 'Componente');
    expect(contarSeleccionados(grupoBebidas, deNuevoTodos)).toBe(2);
  });

  it('maneja grupos vacíos sin alterar la selección y devuelve 0 en contarSeleccionados', () => {
    const inicial = construirSeleccion(menuHoyDemo, candidatosDemo);
    const sinCambio = alternarGrupo(inicial, [], 'Componente');
    expect(sinCambio).toBe(inicial);
    expect(contarSeleccionados([], inicial)).toBe(0);
    expect(contarSeleccionados({ items: [], seleccion: inicial })).toBe(0);
  });

  it('validarMenu retorna MSG-224 cuando no hay ningún plato de carta ni menú completo habilitado', () => {
    const vacia = construirSeleccion(null, candidatosDemo);
    const res = validarMenu(vacia);

    expect(res.valido).toBe(false);
    expect(res.mensaje).toBe(MSG_224);
    expect(res.errores).toContain(MSG_224);
  });

  it('validarMenu retorna MSG-219 cuando un menú completo habilitado tiene una parte obligatoria sin opciones', () => {
    let sel = construirSeleccion(null, candidatosDemo);
    // Habilitamos Almuerzo completo (id 2) y seleccionamos solo Sopa (falta "Segundo")
    sel = alternarMenuCompleto(sel, 2);
    sel = alternarOpcion(sel, 'c-sop-1', 'Componente', 'Sopa');

    const res = validarMenu(sel);
    const esperado = MSG_219('Almuerzo completo', 'Segundo');

    expect(res.valido).toBe(false);
    expect(res.mensaje).toBe(esperado);
    expect(res.erroresPorMenu[2]).toBe(esperado);
  });

  it('validarMenu aprueba Almuerzo completo cuando tiene Entrada (sin Sopa) y Segundo', () => {
    let sel = construirSeleccion(null, candidatosDemo);
    sel = alternarMenuCompleto(sel, 2);
    sel = alternarOpcion(sel, 'c-ent-1', 'Componente', 'Entrada');
    sel = alternarOpcion(sel, 'c-seg-2', 'Componente', 'Segundo');

    const res = validarMenu(sel);
    expect(res.valido).toBe(true);
    expect(res.mensaje).toBeNull();
    expect(res.errores).toHaveLength(0);
  });

  it('agruparCandidatos separa correctamente los 5 roles de componentes y las 5 categorías de carta', () => {
    const { gruposOpciones, gruposCarta } = agruparCandidatos(candidatosDemo);
    expect(gruposOpciones).toHaveLength(5);
    expect(gruposCarta).toHaveLength(5);
    expect(gruposOpciones.find((g) => g.clave === 'BebidaDesayuno')?.items).toHaveLength(2);
    expect(gruposCarta.find((g) => g.clave === 'PlatosExtras')?.items).toHaveLength(1);
  });

  it('armarSolicitud construye el payload GuardarMenuDiaRequest ordenado y sin duplicados', () => {
    const sel = construirSeleccion(menuHoyDemo, candidatosDemo);
    const payload = armarSolicitud(sel);

    expect(payload).toEqual({
      productosCarta: ['p-car-1'],
      opciones: ['c-seg-1', 'c-sop-1'],
      menusCompletos: [2],
    });
  });
});
