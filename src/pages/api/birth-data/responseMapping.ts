/**
 * Birth Data Save Response Mapping
 *
 * Maps the SaveBirthData result onto HTTP responses for the
 * POST /api/birth-data and PUT /api/birth-data/[id] routes.
 *
 * Warning codes are translated to es-CO UI strings here (interface layer),
 * keeping the domain and application layers free of UI text. Errors are
 * mapped by their typed discriminant — never by string matching.
 */

import type { BirthData } from '@/domain/birth/BirthData.vo'
import type { BirthDataError } from '@/domain/birth/errors'
import type { WarningCode } from '@/domain/birth/warnings'

const WARNING_MESSAGES: Record<WarningCode, string> = {
  'whole-sign':
    'No registraste la hora de nacimiento. Los cálculos de casas usarán el sistema Whole Sign y serán aproximados.',
  'dst-ambiguous':
    'La hora de nacimiento es ambigua por el cambio de horario de verano. Se usó la hora más temprana.',
}

export function warningMessage(code: WarningCode): string {
  return WARNING_MESSAGES[code]
}

export function birthDataErrorResponse(error: BirthDataError): Response {
  switch (error.type) {
    case 'nonexistent-time':
      return jsonErrorResponse(
        400,
        'La fecha y hora de nacimiento no existe en la zona horaria indicada. Verifica la hora o el lugar de nacimiento.',
      )
    case 'not-found':
      return jsonErrorResponse(404, 'Datos de nacimiento no encontrados')
    case 'unavailable':
      return jsonErrorResponse(
        500,
        'No pudimos guardar tus datos de nacimiento. Inténtalo de nuevo más tarde.',
      )
    case 'validation':
    case 'conversion-failed':
      return jsonErrorResponse(400, error.message)
  }
}

export function saveSuccessResponse(result: {
  data: BirthData
  warnings: WarningCode[]
}): Response {
  const body: Record<string, unknown> = { data: result.data.toJSON() }
  if (result.warnings.length > 0) {
    body.warning = result.warnings.map(warningMessage).join(' ')
  }
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function jsonErrorResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
