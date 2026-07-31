/**
 * Read, Update, Delete Birth Data API Route (Controller)
 *
 * Route: /api/birth-data/[id]
 * Supports GET, PUT, DELETE operations for saved birth data.
 * PUT delegates to SaveBirthData; GET/DELETE keep their existing handlers.
 */

import type { APIRoute } from 'astro'
import { parseAndAuthenticateRequest } from '../_helpers/controllerHelper'
import { GetBirthData } from '@/application/birth/GetBirthData'
import {
  SaveBirthData,
  toBirthDataInput,
} from '@/application/birth/SaveBirthData'
import { DeleteBirthData } from '@/application/birth/DeleteBirthData'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'
import { CaelusBirthConverter } from '@/infrastructure/birth/CaelusBirthConverter'
import { birthDataErrorResponse, saveSuccessResponse } from './responseMapping'

export const GET: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, { requireId: true })
  if (!req.ok) return req.response

  const { id = '', userId } = req.data

  const useCase = new GetBirthData(new DrizzleBirthDataRepository())
  const result = await useCase.execute({ id, userId })

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ data: result.data.toJSON() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PUT: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, {
    requireId: true,
    requireJsonBody: true,
  })
  if (!req.ok) return req.response

  const { id = '', userId, body = {} } = req.data

  const saveBirthData = new SaveBirthData(
    new DrizzleBirthDataRepository(),
    new CaelusBirthConverter(),
  )
  const result = await saveBirthData.update(id, toBirthDataInput(body), userId)

  if (!result.ok) return birthDataErrorResponse(result.error)

  return saveSuccessResponse(result)
}

export const DELETE: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, { requireId: true })
  if (!req.ok) return req.response

  const { id = '', userId } = req.data

  const useCase = new DeleteBirthData(new DrizzleBirthDataRepository())
  const result = await useCase.execute({ id, userId })

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ message: result.message }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
