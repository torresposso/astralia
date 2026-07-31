/**
 * Read, Update, Delete Birth Data API Route (Controller)
 *
 * Route: /api/birth-data/[id]
 * Supports GET, PUT, DELETE operations for saved birth data.
 */

import type { APIRoute } from 'astro'
import { parseAndAuthenticateRequest } from '../_helpers/controllerHelper'
import { GetBirthDataUseCase } from '@/application/birth/GetBirthDataUseCase'
import { UpdateBirthDataUseCase } from '@/application/birth/UpdateBirthDataUseCase'
import { DeleteBirthDataUseCase } from '@/application/birth/DeleteBirthDataUseCase'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'
import { CaelusBirthConverter } from '@/infrastructure/birth/CaelusBirthConverter'

export const GET: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, { requireId: true })
  if (!req.ok) return req.response

  const { id = '', userId } = req.data

  const useCase = new GetBirthDataUseCase(new DrizzleBirthDataRepository())
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

  const useCase = new UpdateBirthDataUseCase(
    new DrizzleBirthDataRepository(),
    new CaelusBirthConverter(),
  )
  const result = await useCase.execute({
    id,
    userId,
    date: (body.date as { year: number; month: number; day: number }) ?? {
      year: 0,
      month: 0,
      day: 0,
    },
    time: body.time as { hour: number; minute: number } | null | undefined,
    timeUnknown: (body.timeUnknown as boolean) ?? false,
    latitude: (body.latitude as number) ?? 0,
    longitude: (body.longitude as number) ?? 0,
    timezone: (body.timezone as string) ?? '',
    placeName: (body.placeName as string) ?? '',
  })

  if (!result.ok) {
    const status =
      result.error === 'Datos de nacimiento no encontrados' ? 404 : 400
    return new Response(JSON.stringify({ error: result.error }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      data: result.data.toJSON(),
      ...(result.warning ? { warning: result.warning } : {}),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

export const DELETE: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, { requireId: true })
  if (!req.ok) return req.response

  const { id = '', userId } = req.data

  const useCase = new DeleteBirthDataUseCase(new DrizzleBirthDataRepository())
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
