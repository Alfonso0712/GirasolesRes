import tseslint from 'typescript-eslint';
import baseConfig, { ARCHIVOS_PROTEGIDOS } from './eslint.config.js';

export default tseslint.config(...baseConfig, {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ARCHIVOS_PROTEGIDOS,
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['src/hooks/useHandedness.test.tsx'],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // Chequeo con información de tipos separado de `lint` por superar +50% de tiempo en CI
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['variable', 'parameter'],
        types: ['boolean'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        prefix: [
          'es',
          'tiene',
          'esta',
          'hay',
          'puede',
          'debe',
          'mostrar',
          'is',
          'has',
          'can',
          'should',
          'show',
        ],
        filter: {
          regex:
            '^(checked|disabled|open|loading|selected|required|readOnly|autoFocus|hidden)$',
          match: false,
        },
      },
    ],
  },
});
