/**
 * Create Birth Data API Route — Unit Tests
 *
 * Tests the controller's HTTP boundary against a mocked SaveBirthData module
 * (mock at the seam). Domain behavior (VO validation, DST policy, warnings)
 * is covered by SaveBirthData.test.ts.
 *
 * Per Clean Architecture testing strategy:
 * - HTTP boundary errors (401, 415, 400 bad JSON) → unit tests here
 * - Error→HTTP mapping (validation 400, nonexistent 400, unavailable 500) → here
 * - Warning code → es-CO UI string mapping → here
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// The route still instantiates DrizzleBirthDataRepository, which imports
// @/infrastructure/db (requires TURSO_URL/.env) — stub it out.
vi.mock('@/infrastructure/db', () => ({ db: {} }))

const saveBirthDataMocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/application/birth/SaveBirthData', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/application/birth/SaveBirthData')>()
  return {
    ...actual,
    SaveBirthData: class SaveBirthData {
      create = saveBirthDataMocks.create
      update = saveBirthDataMocks.update
    },
  }
})

import * as createEndpoint from './create'
import { BirthData } from '@/domain/birth/BirthData.vo'

// Authenticated locals for AstroContainer — identity is resolved by middleware
// from the better-auth session cookie and surfaced through locals.user.
function authedLocals(userId: string): App.Locals {
  return {
    user: {
      id: userId,
      name: 'Test User',
      email: `${userId}@test.local`,
      emailVerified: true,
    },
    session: {
      id: `session_${userId}`,
      userId,
      token: 'test-token',
    },
  } as unknown as App.Locals
}

function savedBirthData(): BirthData {
  const result = BirthData.create({
    id: 'bd_created',
    userId: 'user_123',
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 10, minute: 30 },
    timeUnknown: false,
    latitude: 10.39,
    longitude: -75.5,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Bolívar, Colombia',
  })
  if (!result.ok) throw new Error(`Failed to build BirthData: ${result.error}`)
  return result.value
}

function postRequest(locals?: App.Locals, body: Record<string, unknown> = {}) {
  return container.renderToResponse(createEndpoint, {
    routeType: 'endpoint',
    locals,
    request: new Request('http://localhost/api/birth-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
}

const validBody = {
  date: { year: 1990, month: 6, day: 10 },
  time: { hour: 10, minute: 30 },
  timeUnknown: false,
  latitude: 10.39,
  longitude: -75.5,
  timezone: 'America/Bogota',
  placeName: 'Cartagena, Bolívar, Colombia',
}

let container: AstroContainer

describe('POST /api/birth-data — controller boundary', () => {
  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  beforeEach(() => {
    saveBirthDataMocks.create.mockReset()
  })

  it('should return 401 when there is no authenticated session', async () => {
    const response = await postRequest()

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'No autorizado' })
    expect(saveBirthDataMocks.create).not.toHaveBeenCalled()
  })

  it('should return 200 with birth data on valid input', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: true,
      data: savedBirthData(),
      warnings: [],
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data.id).toBe('bd_created')
    expect(data.data.userId).toBe('user_123')
    expect(data.warning).toBeUndefined()
    expect(saveBirthDataMocks.create).toHaveBeenCalledTimes(1)
  })

  it('should return 200 with the es-CO whole-sign warning string', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: true,
      data: savedBirthData(),
      warnings: ['whole-sign'],
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.warning).toContain('No registraste la hora')
    expect(data.warning).toContain('Whole Sign')
  })

  it('should return 200 with the es-CO dst-ambiguous warning string', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: true,
      data: savedBirthData(),
      warnings: ['dst-ambiguous'],
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.warning).toContain('ambigua')
  })

  it('should return 415 when Content-Type is not application/json', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'hello',
      }),
    })

    expect(response.status).toBe(415)
    const data = await response.json()
    expect(data).toEqual({ error: 'Content-Type debe ser application/json' })
  })

  it('should return 400 when request body is not valid JSON', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'El cuerpo de la solicitud no es JSON válido',
    })
  })

  it('should return 400 with the VO field-level message for validation errors', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: false,
      error: {
        type: 'validation',
        message: 'La latitud debe estar entre -90 y 90',
      },
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('La latitud debe estar entre -90 y 90')
  })

  it('should return 400 with the es-CO message for nonexistent times', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: false,
      error: { type: 'nonexistent-time', message: 'Birth time does not exist' },
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('no existe')
  })

  it('should return 500 when the repository is unavailable', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: false,
      error: { type: 'unavailable', message: 'store down' },
    })

    const response = await postRequest(authedLocals('user_123'), validBody)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it('should forward missing coordinates as undefined (no sentinel 0)', async () => {
    saveBirthDataMocks.create.mockResolvedValue({
      ok: true,
      data: savedBirthData(),
      warnings: [],
    })

    const bodyWithoutCoords = {
      date: validBody.date,
      time: validBody.time,
      timeUnknown: validBody.timeUnknown,
      timezone: validBody.timezone,
      placeName: validBody.placeName,
    }
    const response = await postRequest(
      authedLocals('user_123'),
      bodyWithoutCoords,
    )

    expect(response.status).toBe(200)
    const [input] = saveBirthDataMocks.create.mock.calls[0]
    expect(input.latitude).toBeUndefined()
    expect(input.longitude).toBeUndefined()
  })
})
