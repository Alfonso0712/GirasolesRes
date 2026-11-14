// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DefinirMenuView } from './DefinirMenuView';
import {
  BannerMenuNoDefinido,
  TEXTO_MENU_NO_DEFINIDO_ADMIN,
  TEXTO_MENU_NO_DEFINIDO_OPERATIVO,
} from './BannerMenuNoDefinido';
import { MasPage } from '../../pages/MasPage';
import { PlatosPage } from '../../pages/PlatosPage';
import { ToastProvider } from '../../context/ToastContext';
import { menuDiaService } from '../../services/menuDiaService';
import { MSG_102, MSG_219, MSG_224 } from '../../utils/menuDia';
import type { CandidatoMenuDto, MenuDiaResponseDto } from '../../types/menuDia';

vi.mock('../../services/menuDiaService', () => ({
  menuDiaService: {
    obtenerMenuHoy: vi.fn(),
    obtenerMenuHoyCacheado: vi.fn().mockReturnValue(null),
    invalidarCache: vi.fn(),
    obtenerCandidatos: vi.fn(),
    guardarMenuHoy: vi.fn(),
    cambiarDisponibilidad: vi.fn(),
  },
}));

const candidatosMock: CandidatoMenuDto[] = [
  {
    id: 'sop-1',
    nombre: 'Sopa Criolla',
    tipo: 'Componente',
    rol: 'Sopa',
    categoria: 'Sopas',
    precio: null,
  },
  {
    id: 'sop-2',
    nombre: 'Caldo de Gallina',
    tipo: 'Componente',
    rol: 'Sopa',
    categoria: 'Sopas',
    precio: null,
  },
  {
    id: 'ent-1',
    nombre: 'Papa a la Huancaína',
    tipo: 'Componente',
    rol: 'Entrada',
    categoria: 'Entradas',
    precio: null,
  },
  {
    id: 'seg-1',
    nombre: 'Seco de Res con Frejoles',
    tipo: 'Componente',
    rol: 'Segundo',
    categoria: 'Segundos',
    precio: null,
  },
  {
    id: 'car-1',
    nombre: 'Lomo Saltado Especial',
    tipo: 'Carta',
    rol: null,
    categoria: 'PlatosExtras',
    precio: 28,
  },
  {
    id: 'car-2',
    nombre: 'Bisteck a lo Pobre',
    tipo: 'Carta',
    rol: null,
    categoria: 'PlatosExtras',
    precio: 30,
  },
];

const menuHoyDefinidoMock: MenuDiaResponseDto = {
  fecha: '2026-11-14',
  definido: true,
  desayuno: null,
  menusCompletos: [
    {
      id: 2,
      nombre: 'Almuerzo completo',
      precio: 8.0,
      incluye: 'Refresco del día',
      disponible: true,
      partes: [
        {
          id: 3,
          nombre: 'Sopa o entrada',
          orden: 1,
          rolesPermitidos: ['Sopa', 'Entrada'],
          opciones: [
            { productoId: 'sop-1', nombre: 'Sopa Criolla', agotado: false },
            { productoId: 'ent-1', nombre: 'Papa a la Huancaína', agotado: false },
          ],
        },
        {
          id: 4,
          nombre: 'Segundo',
          orden: 2,
          rolesPermitidos: ['Segundo'],
          opciones: [
            { productoId: 'seg-1', nombre: 'Seco de Res con Frejoles', agotado: false },
          ],
        },
      ],
    },
  ],
  opciones: [
    {
      productoId: 'sop-1',
      nombre: 'Sopa Criolla',
      rol: 'Sopa',
      agotado: false,
    },
    {
      productoId: 'ent-1',
      nombre: 'Papa a la Huancaína',
      rol: 'Entrada',
      agotado: false,
    },
    {
      productoId: 'seg-1',
      nombre: 'Seco de Res con Frejoles',
      rol: 'Segundo',
      agotado: false,
    },
  ],
  platos: [
    {
      productoId: 'car-1',
      nombre: 'Lomo Saltado Especial',
      categoria: 'PlatosExtras',
      precio: 28,
      agotado: true,
    },
  ],
};

const menuHoyNoDefinidoMock: MenuDiaResponseDto = {
  fecha: '2026-11-14',
  definido: false,
  desayuno: null,
  menusCompletos: [],
  opciones: [],
  platos: [],
};

describe('Definir el menú del día y permisos por rol (M-B, M-C, M-D, M-E)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuHoyDefinidoMock);
    vi.mocked(menuDiaService.obtenerCandidatos).mockResolvedValue(candidatosMock);
    vi.mocked(menuDiaService.guardarMenuHoy).mockResolvedValue({
      success: true,
      message: 'El menú del día ha sido guardado exitosamente.',
      data: menuHoyDefinidoMock,
    });
  });

  describe('DefinirMenuView', () => {
    it('muestra contadores de pestañas, permite alternar opciones, "Seleccionar todos" y muestra barra de cambios sin guardar', async () => {
      render(
        <ToastProvider>
          <DefinirMenuView />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Menús completos (1)' })).toBeTruthy();
      });

      expect(screen.getByRole('tab', { name: 'Opciones (3)' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Carta (1)' })).toBeTruthy();
      expect(screen.queryByText('Tiene cambios sin guardar')).toBeNull();

      // Ir a la pestaña Opciones
      fireEvent.click(screen.getByRole('tab', { name: 'Opciones (3)' }));

      // Verificar contador "1 de 2" en Sopas del Día
      expect(screen.getByLabelText('Seleccionados 1 de 2')).toBeTruthy();

      // Alternar opción individual ("Caldo de Gallina")
      const filaCaldo = screen.getByRole('checkbox', { name: /Caldo de Gallina/i });
      expect(filaCaldo.getAttribute('aria-checked')).toBe('false');
      fireEvent.click(filaCaldo);

      expect(filaCaldo.getAttribute('aria-checked')).toBe('true');
      expect(screen.getByLabelText('Seleccionados 2 de 2')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Opciones (4)' })).toBeTruthy();
      expect(screen.getByText('Tiene cambios sin guardar')).toBeTruthy();

      // Usar el Switch "Seleccionar todos" del grupo Sopas del Día para desmarcar ambos
      const switchSopas = screen.getByRole('switch', {
        name: /Seleccionar todos en Sopas del Día/i,
      });
      expect(switchSopas.getAttribute('aria-checked')).toBe('true');
      fireEvent.click(switchSopas);

      expect(screen.getByLabelText('Seleccionados 0 de 2')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Opciones (2)' })).toBeTruthy();
    });

    it('valida en línea MSG-219 cuando un menú completo habilitado queda con una parte sin opciones', async () => {
      render(
        <ToastProvider>
          <DefinirMenuView seccionInicial="opciones" />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /Seco de Res con Frejoles/i })).toBeTruthy();
      });

      // Desmarcar el único segundo seleccionado mientras Almuerzo completo está habilitado
      fireEvent.click(screen.getByRole('checkbox', { name: /Seco de Res con Frejoles/i }));

      // Intentar guardar
      fireEvent.click(screen.getByRole('button', { name: /Guardar menú del día/i }));

      expect(screen.getByRole('alert').textContent).toContain(
        MSG_219('Almuerzo completo', 'Segundo')
      );
      expect(menuDiaService.guardarMenuHoy).not.toHaveBeenCalled();
    });

    it('valida en línea MSG-224 cuando se deshabilitan todos los menús completos y platos de carta', async () => {
      vi.mocked(menuDiaService.obtenerMenuHoy).mockResolvedValue(menuHoyNoDefinidoMock);

      render(
        <ToastProvider>
          <DefinirMenuView seccionInicial="opciones" />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /Sopa Criolla/i })).toBeTruthy();
      });

      // Seleccionar solo una opción de componente sin habilitar ningún menú completo ni plato de carta
      fireEvent.click(screen.getByRole('checkbox', { name: /Sopa Criolla/i }));

      fireEvent.click(screen.getByRole('button', { name: /Guardar menú del día/i }));

      expect(screen.getByRole('alert').textContent).toContain(MSG_224);
      expect(menuDiaService.guardarMenuHoy).not.toHaveBeenCalled();
    });

    it('solicita confirmación (MSG-102) al intentar volver con cambios sin guardar y guarda tras confirmar en ConfirmSheet', async () => {
      const onVolver = vi.fn();

      render(
        <ToastProvider>
          <DefinirMenuView onVolver={onVolver} seccionInicial="carta" />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /Bisteck a lo Pobre/i })).toBeTruthy();
      });

      // Marcar un plato adicional de carta
      fireEvent.click(screen.getByRole('checkbox', { name: /Bisteck a lo Pobre/i }));
      expect(screen.getByText('Tiene cambios sin guardar')).toBeTruthy();

      // Intentar volver atrás con el botón del encabezado
      fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

      // Debe abrir ConfirmSheet con MSG-102 y no llamar a onVolver todavía
      expect(screen.getByText(MSG_102)).toBeTruthy();
      expect(onVolver).not.toHaveBeenCalled();

      // Elegir "Seguir editando"
      fireEvent.click(screen.getByRole('button', { name: 'Seguir editando' }));
      expect(onVolver).not.toHaveBeenCalled();

      // Ahora pulsar "Guardar menú del día" en la barra inferior y confirmar en el ConfirmSheet
      fireEvent.click(screen.getByRole('button', { name: /Guardar menú del día/i }));
      expect(
        screen.getByText(
          '¿Desea guardar el menú del día de hoy? El personal verá estas opciones al registrar pedidos.'
        )
      ).toBeTruthy();

      const botonesGuardar = screen.getAllByRole('button', { name: /Guardar menú del día/i });
      fireEvent.click(botonesGuardar[botonesGuardar.length - 1]);

      await waitFor(() => {
        expect(menuDiaService.guardarMenuHoy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('MasPage, PlatosPage y BannerMenuNoDefinido por rol', () => {
    it('MasPage muestra "Menú del día" y "Perfil y ajustes" para Administrador y AccesoRestringido para otros roles', async () => {
      const { unmount } = render(
        <ToastProvider>
          <MasPage
            session={{
              id: 'u-1',
              nombre: 'Admin',
              apellido: 'Sistema',
              correo: 'admin@girasoles.pe',
              rol: 'Administrador',
              token: 't',
            }}
            isDark={false}
            onToggleDarkMode={vi.fn()}
            onLogout={vi.fn()}
            onVolverAlInicio={vi.fn()}
          />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Menú del día')).toBeTruthy();
        expect(screen.getByText('Menú definido')).toBeTruthy();
      });
      expect(screen.getByText('Perfil y ajustes')).toBeTruthy();
      unmount();

      render(
        <ToastProvider>
          <MasPage
            session={{
              id: 'u-2',
              nombre: 'Mozo 1',
              apellido: 'Salón',
              correo: 'mozo@girasoles.pe',
              rol: 'Mozo',
              token: 't',
            }}
            isDark={false}
            onToggleDarkMode={vi.fn()}
            onLogout={vi.fn()}
            onVolverAlInicio={vi.fn()}
          />
        </ToastProvider>
      );

      expect(screen.getByText('Acceso restringido')).toBeTruthy();
    });

    it('PlatosPage muestra solo Disponibilidad para Cocinero y control segmentado (Disponibilidad / Definir menú) para Administrador', async () => {
      const { unmount } = render(
        <ToastProvider>
          <PlatosPage rol="Cocinero" onVolverAlInicio={vi.fn()} />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Lomo Saltado Especial')).toBeTruthy();
      });
      // El Cocinero no ve la pestaña "Definir menú" porque el backend restringe PUT /api/menu-dia/hoy a Administrador
      expect(screen.queryByRole('tab', { name: 'Definir menú' })).toBeNull();
      unmount();

      render(
        <ToastProvider>
          <PlatosPage rol="Administrador" onVolverAlInicio={vi.fn()} />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Disponibilidad' })).toBeTruthy();
        expect(screen.getByRole('tab', { name: 'Definir menú' })).toBeTruthy();
      });
    });

    it('BannerMenuNoDefinido muestra botón "Definir menú" para Administrador y texto informativo sin botón para Mozo y Cajero', () => {
      const onDefinir = vi.fn();
      const { unmount } = render(
        <BannerMenuNoDefinido rol="Administrador" onDefinirMenu={onDefinir} />
      );

      expect(screen.getByText(TEXTO_MENU_NO_DEFINIDO_ADMIN)).toBeTruthy();
      const btnDefinir = screen.getByRole('button', { name: /Definir menú/i });
      fireEvent.click(btnDefinir);
      expect(onDefinir).toHaveBeenCalledTimes(1);
      unmount();

      render(<BannerMenuNoDefinido rol="Mozo" onDefinirMenu={onDefinir} />);
      expect(screen.getByText(TEXTO_MENU_NO_DEFINIDO_OPERATIVO)).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Definir menú/i })).toBeNull();
    });
  });
});
