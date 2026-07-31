/**
 * Birth Data Warning Codes
 *
 * Typed domain codes emitted by the birth data save pipeline.
 * Human-readable UI strings are mapped at the interface layer (routes),
 * never in the domain or application layers.
 */

export type WarningCode = 'whole-sign' | 'dst-ambiguous'
