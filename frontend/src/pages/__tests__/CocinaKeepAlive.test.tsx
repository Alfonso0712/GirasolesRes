import '@testing-library/jest-dom/vitest';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CocinaPage } from '../CocinaPage';
import type { UserSession } from '../../types/auth';
import * as authService from '../../services/authService';

// Mock de servicios de comandas para evitar llamadas de red
vi.mock('../../services/comandaService', () => ({
  comandaService: {
    obtenerComandas: vi.fn().mockResolvedValue([]),
    obtenerResumen: vi.fn().mockResolvedValue([]),
    marcarEnPreparacion: vi.fn(),
    marcarLista: vi.fn(),
    deshacerEstado: vi.fn(),
  },
}));

// Mock de renovarTokenService
vi.mock('../../services/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof authService>();
  return {
    ...actual,
    renovarTokenService: vi.fn().mockResolvedValue('nuevo-jwt-renovado-token'),
  };
});

describe('CocinaPage Keep-Alive (RN-20, RN-82)', () => {
  const mockSession: UserSession = {
    nombre: 'Carlos Chef',
    usuario: 'cocinero1',
    rol: 'Cocinero',
    token: 'jwt-token-original-cocina',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('llama a /api/auth/renovar exactamente a los 20 minutos y NO antes', async () => {
    const onLogoutMock = vi.fn();
    const onUpdateSessionMock = vi.fn();

    render(
      <CocinaPage
        session={mockSession}
        onLogout={onLogoutMock}
        onUpdateSession={onUpdateSessionMock}
      />
    );

    // 1. Inmediatamente al montar, no debe haber llamado a renovarTokenService
    expect(authService.renovarTokenService).not.toHaveBeenCalled();

    // 2. Transcurren 19 minutos (19 * 60 * 1000 ms) -> Aún NO debe llamarse
    await act(async () => {
      vi.advanceTimersByTime(19 * 60 * 1000);
    });
    expect(authService.renovarTokenService).not.toHaveBeenCalled();

    // 3. Transcurre 1 minuto más (total 20 minutos) -> Ahora SÍ se ejecuta la renovación
    await act(async () => {
      vi.advanceTimersByTime(1 * 60 * 1000);
    });
    expect(authService.renovarTokenService).toHaveBeenCalledTimes(1);
    expect(authService.renovarTokenService).toHaveBeenCalledWith('jwt-token-original-cocina');

    // 4. Se actualiza la sesión con el nuevo token obtenido
    expect(onUpdateSessionMock).toHaveBeenCalledWith({
      ...mockSession,
      token: 'nuevo-jwt-renovado-token',
    });

    // 5. Transcurren otros 20 minutos -> Se ejecuta la segunda renovación
    await act(async () => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });
    expect(authService.renovarTokenService).toHaveBeenCalledTimes(2);
  });
});
