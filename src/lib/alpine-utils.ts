import Alpine from 'alpinejs'

/**
 * Register an Alpine.js component, wrapping the `alpine:init` + `Alpine.data()`
 * boilerplate. Call at module level — runs before Alpine starts.
 *
 * @example
 * ```ts
 * registerComponent('myForm', () => ({
 *   name: '',
 *   async submit() { ... },
 * }))
 * ```
 */
export function registerComponent(
  name: string,
  factory: () => Record<string, unknown>,
): void {
  if (typeof document === 'undefined') return // SSR guard
  document.addEventListener('alpine:init', () => {
    Alpine.data(name, factory)
  })
}
