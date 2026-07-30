export type ChartError =
  | { type: 'BIRTH_DATA_NOT_FOUND'; message: string }
  | { type: 'UNAUTHORIZED'; message: string }
  | { type: 'CALCULATION_FAILED'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }

export function chartErrorMessage(error: ChartError): string {
  return error.message
}
