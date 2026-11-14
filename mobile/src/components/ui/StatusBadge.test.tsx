import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge - Glosario canónico e iconografía', () => {
  describe('Estados de Mesa (CUS06)', () => {
    it('debe renderizar estado "Libre"', () => {
      render(<StatusBadge status="Libre" category="mesa" />);
      expect(screen.getByText('Libre')).toBeInTheDocument();
    });

    it('debe renderizar estado "Ocupada"', () => {
      render(<StatusBadge status="Ocupada" category="mesa" />);
      expect(screen.getByText('Ocupada')).toBeInTheDocument();
    });

    it('debe renderizar estado "Inactiva"', () => {
      render(<StatusBadge status="Inactiva" category="mesa" />);
      expect(screen.getByText('Inactiva')).toBeInTheDocument();
    });
  });

  describe('Estados de Pedido y Comanda (CUS07..CUS09)', () => {
    it('debe renderizar "Pendiente"', () => {
      render(<StatusBadge status="Pendiente" />);
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('debe renderizar "En preparación"', () => {
      render(<StatusBadge status="En preparación" />);
      expect(screen.getByText('En preparación')).toBeInTheDocument();
    });

    it('debe renderizar "Listo"', () => {
      render(<StatusBadge status="Listo" />);
      expect(screen.getByText('Listo')).toBeInTheDocument();
    });

    it('debe renderizar "Pagado"', () => {
      render(<StatusBadge status="Pagado" />);
      expect(screen.getByText('Pagado')).toBeInTheDocument();
    });

    it('debe renderizar "Anulado"', () => {
      render(<StatusBadge status="Anulado" />);
      expect(screen.getByText('Anulado')).toBeInTheDocument();
    });
  });

  describe('Estados de Caja y Cuadre (CUS13 / Cierres)', () => {
    it('debe renderizar "Abierta" y "Cerrada"', () => {
      const { rerender } = render(<StatusBadge status="Abierta" category="caja" />);
      expect(screen.getByText('Abierta')).toBeInTheDocument();

      rerender(<StatusBadge status="Cerrada" category="caja" />);
      expect(screen.getByText('Cerrada')).toBeInTheDocument();
    });

    it('debe renderizar resultados de arqueo: "Cuadra", "Sobrante", "Faltante"', () => {
      const { rerender } = render(<StatusBadge status="Cuadra" category="caja" />);
      expect(screen.getByText('Cuadra')).toBeInTheDocument();

      rerender(<StatusBadge status="Sobrante" category="caja" />);
      expect(screen.getByText('Sobrante')).toBeInTheDocument();

      rerender(<StatusBadge status="Faltante" category="caja" />);
      expect(screen.getByText('Faltante')).toBeInTheDocument();
    });

    it('debe renderizar "Anterior sin cerrar"', () => {
      render(<StatusBadge status="anteriorSinCerrar" category="caja" />);
      expect(screen.getByText('Anterior sin cerrar')).toBeInTheDocument();
    });
  });

  describe('Valores booleanos', () => {
    it('debe mapear true a "Activo" y false a "Inactivo"', () => {
      const { rerender } = render(<StatusBadge status={true} />);
      expect(screen.getByText('Activo')).toBeInTheDocument();

      rerender(<StatusBadge status={false} />);
      expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });
  });
});
