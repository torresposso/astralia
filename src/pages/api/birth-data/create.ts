/**
 * Create Birth Data API Route (Controller)
 *
 * Clean Architecture controller layer:
 * 1. Parse HTTP request body
 * 2. Instantiate the Use Case with the concrete repository and UT converter
 * 3. Execute the Use Case
 * 4. Build the JSON HTTP response
 */

import type { APIRoute } from 'astro'
import { parseAndAuthenticateRequest } from './controllerHelper'
import { CreateBirthDataUseCase } from '@/application/birth/CreateBirthDataUseCase'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'
import { CaelusBirthConverter } from '@/infrastructure/birth/CaelusBirthConverter'

export const POST: APIRoute = async (context) => {
  const req = await parseAndAuthenticateRequest(context, { requireJsonBody: true })
  if (!req.ok) return req.response

  const { userId, body = {} } = req.data

  const useCase = new CreateBirthDataUseCase(
    new DrizzleBirthDataRepository(),
    new CaelusBirthConverter(),
  )

  const result = await useCase.execute({
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
    return new Response(
      JSON.stringify({ error: result.error }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
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
