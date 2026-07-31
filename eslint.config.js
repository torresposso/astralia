// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

export default tseslint.config(
  {
    name: 'global-ignores',
    ignores: ['dist/**', 'coverage/**', '.astro/**', 'node_modules/**'],
  },
  js.configs.recommended,
  // Scope typescript-eslint's recommended config (and its eslint-recommended
  // overrides, e.g. `no-undef` off) to TypeScript sources only, so plain JS
  // config files are linted with the base JS rules.
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),
  astro.configs['flat/recommended'],
  {
    name: 'astro-generated-types',
    files: ['src/env.d.ts'],
    rules: {
      // Astro's ambient generated types are referenced via triple-slash
      // (`../.astro/types.d.ts`); an `import` is not possible for them.
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
)
