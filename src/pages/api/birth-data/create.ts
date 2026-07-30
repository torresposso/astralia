/**
 * Create Birth Data API Route (Controller)
 *
 * Clean Architecture controller layer:
 * 1. Parse HTTP request body
 * 2. Instantiate the Use Case with the concrete (or mock) repository
 * 3. Execute the Use Case
 * 4. Build the JSON HTTP response
 */

import type { APIRoute } from 'astro'
import { CreateBirthDataUseCase } from '@/application/birth/CreateBirthDataUseCase'
import { MockBirthDataRepository } from '@/application/birth/__mocks__/MockBirthDataRepository'

export const POST: APIRoute = async ({ request }) => {
  // 1. Validate Content-Type
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      { status: 415, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // 2. Parse JSON
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // 3. For now, use mock repo. Will be replaced with real DI later.
  const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())

  const result = await useCase.execute({
    userId: (body.userId as string) ?? '',
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
