/**
 * Create Birth Data API Route — Unit Tests
 *
 * Tests the controller's input validation layer (HTTP boundary).
 * The Container API renders the endpoint without a live server.
 *
 * Per Clean Architecture testing strategy:
 * - Input validation errors (400, 415) → unit tests here
 * - Happy path verification → unit tests here
 * - Domain validation errors (forwarded from Use Case) → unit tests here
 *
 * The Use Case's domain validation (BirthData value object) runs
 * before the repository is called, so MockBirthDataRepository is never
 * reached for input-level validation errors.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// Mock the database layer since DrizzleBirthDataRepository depends on @/infrastructure/db
vi.mock('@/infrastructure/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

import * as createEndpoint from './create'

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

describe('POST /api/birth-data — controller input validation', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  it('should return 401 when there is no authenticated session', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 10 },
          time: { hour: 10, minute: 30 },
          timeUnknown: false,
          latitude: 10.39,
          longitude: -75.5,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'No autorizado' })
  })

  it('should return 200 with birth data on valid input', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user_123'),
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 10 },
          time: { hour: 10, minute: 30 },
          timeUnknown: false,
          latitude: 10.39,
          longitude: -75.5,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toBeDefined()
    expect(data.data.userId).toBe('user_123')
    expect(data.data.date).toEqual({ year: 1990, month: 6, day: 10 })
    expect(data.warning).toBeUndefined()
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

  it('should return 400 when required fields are missing', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('usr_1'),
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it('should return 400 when date is before 1800', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user_123'),
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1700, month: 1, day: 1 },
          latitude: 10.39,
          longitude: -75.5,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('1800')
  })

  it('should return 200 with warning when time is not provided', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user_123'),
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 10 },
          time: null,
          timeUnknown: true,
          latitude: 10.39,
          longitude: -75.5,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.warning).toBeDefined()
    expect(data.warning).toContain('No registraste la hora')
    expect(data.data.time).toBeNull()
  })
})
