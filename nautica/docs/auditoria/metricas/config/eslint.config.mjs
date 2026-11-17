import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/vendor/**', '**/node_modules/**', '.cache/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.serviceworker },
    },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      complexity: ['warn', 10],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 5],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-shadow': 'warn',
      'no-param-reassign': 'warn',
      'no-implicit-globals': 'warn',
      'no-console': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'consistent-return': 'warn',
      'default-case-last': 'warn',
      'no-await-in-loop': 'warn',
      'require-atomic-updates': 'warn',
      'no-use-before-define': ['warn', { functions: false, classes: true, variables: true }],
    },
  },
];
