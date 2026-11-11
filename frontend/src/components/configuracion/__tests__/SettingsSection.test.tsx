import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Settings } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';

describe('SettingsSection Component', () => {
  it('debe renderizar el título, descripción y contenido hijo', () => {
    render(
      <SettingsSection
        id="test-sec"
        icon={Settings}
        title="Sección de prueba"
        description="Descripción de la sección"
      >
        <p>Contenido interior</p>
      </SettingsSection>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Sección de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Descripción de la sección')).toBeInTheDocument();
    expect(screen.getByText('Contenido interior')).toBeInTheDocument();
  });
});
