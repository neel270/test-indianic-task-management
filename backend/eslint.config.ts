import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

// Correct import for typescript-eslint plugin
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// Additional plugins
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';

export default {
  ignores: ['node_modules/**', 'dist/**', 'build/**', '*.log', '.env'],
  languageOptions: {
    ecmaVersion: 2020,
    parser: tsParser,
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: __dirname,
    },
    globals: {
      ...globals.node,
      ...globals.es2020,
    },
  },
  plugins: {
    prettier,
    import: importPlugin,
    sonarjs,
    'unused-imports': unusedImports,
    '@typescript-eslint': tsPlugin,
  },
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/no-implied-eval': 'error',
    'no-throw-literal': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',

    // Node.js specific
    'no-console': 'off',
    'no-process-exit': 'off',
    'no-process-env': 'off',
    'handle-callback-err': 'error',
    'no-buffer-constructor': 'error',
    'no-mixed-requires': 'error',
    'no-new-require': 'error',
    'no-path-concat': 'error',
    'no-restricted-modules': ['error', 'fs'],
    'no-sync': 'warn',

    // Import rules
    'import/order': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // SonarJS (code smell detection)
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-identical-functions': 'warn',

    // General JS rules
    'prettier/prettier': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-unneeded-ternary': 'error',
    'prefer-object-spread': 'error',
    'no-nested-ternary': 'warn',
    complexity: ['warn', 15],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 500],
    'max-params': ['warn', 5],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2, 10, 100, 1000] }],
  },
  files: ['**/*.{ts,js}'],
};
