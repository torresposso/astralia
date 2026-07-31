/**
 * Create Birth Data API Route (Controller)
 *
 * Clean Architecture controller layer:
 * 1. Parse HTTP request body
 * 2. Call SaveBirthData (the save pipeline module)
 * 3. Map warnings to es-CO UI strings and errors to HTTP status codes
 */

import type { APIRoute } from 'astro'
import { parseAndAuthenticateRequest } from '../_helpers/controllerHelper'
import {
  SaveBirthData,
  toBirthDataInput,
} from '@/application/birth/SaveBirthData'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'
import { CaelusBirthConverter } from '@/infrastructure/birth/CaelusBirthConverter'
import { birthDataErrorResponse, saveSuccessResponse } from './responseMapping'

export const POST: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, {
    requireJsonBody: true,
  })
  if (!req.ok) return req.response

  const { userId, body = {} } = req.data

  const saveBirthData = new SaveBirthData(
    new DrizzleBirthDataRepository(),
    new CaelusBirthConverter(),
  )

  const result = await saveBirthData.create(toBirthDataInput(body), userId)

  if (!result.ok) return birthDataErrorResponse(result.error)

  return saveSuccessResponse(result)
}
