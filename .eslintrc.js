module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'import/no-default-export': 'error',
  },
  overrides: [
    {
      files: [
        '**/page.tsx',
        '**/layout.tsx',
        '**/loading.tsx',
        '**/error.tsx',
        '**/not-found.tsx',
        '**/*.config.{js,ts}',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
