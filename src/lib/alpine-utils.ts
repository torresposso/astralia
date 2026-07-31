import Alpine from 'alpinejs'

/**
 * Register an Alpine.js component, wrapping the `alpine:init` + `Alpine.data()`
 * boilerplate. Call at module level — runs before Alpine starts.
 *
 * The component type is generic so `this` inside the factory's object literal
 * infers the component's own shape (methods/properties), instead of degrading
 * to `Record<string, unknown>`.
 *
 * @example
 * ```ts
 * registerComponent('myForm', () => ({
 *   name: '',
 *   async submit() { ... },
 * }))
 * ```
 */
export function registerComponent<T extends Record<string, unknown>>(
  name: string,
  factory: () => T,
): void {
  if (typeof document === 'undefined') return // SSR guard
  document.addEventListener('alpine:init', () => {
    Alpine.data(name, factory)
  })
}
