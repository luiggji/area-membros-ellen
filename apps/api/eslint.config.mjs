import { baseConfig } from '@caixa-forte/config/eslint/base';

export default [
  ...baseConfig,
  {
    rules: {
      // Classes de DI do Nest são instanciadas pelo container.
      '@typescript-eslint/no-extraneous-class': 'off',
      // Nest precisa dos imports em runtime para emitDecoratorMetadata.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
