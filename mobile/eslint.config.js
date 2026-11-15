import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export const ARCHIVOS_PROTEGIDOS = [
  'src/config/appConfig.ts',
  'src/config/serverConfig.ts',
  'src/config/demoAccounts.ts',
  'src/components/auth/ServidorConfigSheet.tsx',
  'src/components/auth/LoginView.tsx',
  'src/services/apiClient.ts',
  'src/services/http/**',
];

const SELECTORES_NOMBRES_GENERICOS = [
  {
    selector: 'VariableDeclarator > Identifier.id[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite nombres genéricos (data, item, info, temp, obj, cb, handle); use un nombre de dominio específico.',
  },
  {
    selector: ':function > Identifier.params[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite parámetros genéricos (data, item, info, temp, obj, cb, handle); use un nombre que revele la intención.',
  },
  {
    selector:
      ':function > AssignmentPattern.params > Identifier.left[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite parámetros genéricos (data, item, info, temp, obj, cb, handle); use un nombre que revele la intención.',
  },
  {
    selector:
      'ObjectPattern > Property > Identifier.value[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite variables desestructuradas genéricas (data, item, info, temp, obj, cb, handle); use un alias específico.',
  },
  {
    selector:
      'ArrayPattern > Identifier.elements[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite variables genéricas (data, item, info, temp, obj, cb, handle); use un nombre específico.',
  },
  {
    selector: 'FunctionDeclaration > Identifier.id[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message:
      'Evite nombres de función genéricos (data, item, info, temp, obj, cb, handle); use un nombre que revele la intención.',
  },
  {
    selector: 'CatchClause > Identifier.param[name=/^(data|item|info|temp|obj|cb|handle)$/]',
    message: 'Evite nombres genéricos en bloques catch.',
  },
];

const REGLAS_BASE_TS = {
  // Reglas estrictas y oficiales de React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  // Accesibilidad recomendada de interfaz (WCAG / a11y)
  ...jsxA11y.configs.recommended.rules,

  // Reglas estrictas de TypeScript: prohibido 'any'
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'android', 'scripts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ARCHIVOS_PROTEGIDOS,
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...REGLAS_BASE_TS,

      // Convención de nombres: prohibición de nombres genéricos en identificadores locales
      'no-restricted-syntax': ['error', ...SELECTORES_NOMBRES_GENERICOS],
    },
  },
  {
    files: ARCHIVOS_PROTEGIDOS,
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: REGLAS_BASE_TS,
  }
);
