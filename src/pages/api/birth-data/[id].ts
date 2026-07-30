/**
 * Read, Update, Delete Birth Data API Route (Controller)
 *
 * Route: /api/birth-data/[id]
 * Supports GET, PUT, DELETE operations for saved birth data.
 */

import type { APIRoute } from 'astro'
import { GetBirthDataUseCase } from '@/application/birth/GetBirthDataUseCase'
import { UpdateBirthDataUseCase } from '@/application/birth/UpdateBirthDataUseCase'
import { DeleteBirthDataUseCase } from '@/application/birth/DeleteBirthDataUseCase'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'

function getUserId(request: Request, body?: Record<string, unknown>): string {
  if (body?.userId && typeof body.userId === 'string') {
    return body.userId
  }
  return request.headers.get('x-user-id') ?? ''
}

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.id
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'El identificador es requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const userId = getUserId(request)
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const useCase = new GetBirthDataUseCase(new DrizzleBirthDataRepository())
  const result = await useCase.execute({ id, userId })

  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: result.error }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ data: result.data.toJSON() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

export const PUT: APIRoute = async ({ params, request }) => {
  const id = params.id
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'El identificador es requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(
      JSON.stringify({ error: 'Content-Type debe ser application/json' }),
      { status: 415, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'El cuerpo de la solicitud no es JSON válido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const userId = getUserId(request, body)
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const useCase = new UpdateBirthDataUseCase(new DrizzleBirthDataRepository())
  const result = await useCase.execute({
    id,
    userId,
    date: (body.date as { year: number; month: number; day: number }) ?? { year: 0, month: 0, day: 0 },
    time: body.time as { hour: number; minute: number } | null | undefined,
    timeUnknown: (body.timeUnknown as boolean) ?? false,
    latitude: (body.latitude as number) ?? 0,
    longitude: (body.longitude as number) ?? 0,
    timezone: (body.timezone as string) ?? '',
    placeName: (body.placeName as string) ?? '',
  })

  if (!result.ok) {
    const status = result.error === 'Datos de nacimiento no encontrados' ? 404 : 400
    return new Response(
      JSON.stringify({ error: result.error }),
      { status, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({
      data: result.data.toJSON(),
      ...(result.warning ? { warning: result.warning } : {}),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const id = params.id
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'El identificador es requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const userId = getUserId(request)
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const useCase = new DeleteBirthDataUseCase(new DrizzleBirthDataRepository())
  const result = await useCase.execute({ id, userId })

  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: result.error }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ message: result.message }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
