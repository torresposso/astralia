/**
 * Birth Data Pipeline Errors
 *
 * Discriminated error union for the birth data save pipeline
 * (src/application/birth/SaveBirthData.ts) and the repository port
 * (src/domain/birth/ports/IBirthDataRepository.ts).
 *
 * The interface layer consumes these types to map failures to HTTP responses
 * without string matching. Messages are domain/technical; user-facing UI
 * strings (es-CO) live in the routes. ValidationError messages carry the
 * field-level text produced by BirthData.create.
 */

export type ValidationError = { type: 'validation'; message: string }

export type NonexistentTimeError = {
  type: 'nonexistent-time'
  message: string
}

export type NotFoundError = { type: 'not-found'; message: string }

export type UnavailableError = { type: 'unavailable'; message: string }

export type ConversionError = { type: 'conversion-failed'; message: string }

export type BirthDataError =
  | ValidationError
  | NonexistentTimeError
  | NotFoundError
  | UnavailableError
  | ConversionError
