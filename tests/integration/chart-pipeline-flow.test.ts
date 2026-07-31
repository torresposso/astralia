/**
 * Chart Pipeline Integration Tests
 *
 * E2E tests covering the full chart calculation flow:
 * 1. Create birth data
 * 2. Calculate natal chart
 * 3. Verify chart structure
 *
 * Uses AstroContainer for HTTP simulation and mocked DB for isolation.
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// ---------------------------------------------------------------------------
// Hoisted: shared mock data (available in vi.mock factories via hoisting)
// ---------------------------------------------------------------------------

const mockCaelusChart = vi.hoisted(() => ({
  jdUt: 2460000.5,
  zodiac: 'tropical',
  houseSystem: 'placidus',
  bodies: {
    sun: {
      lon: 15.5,
      retrograde: false,
      sign: 'Aries',
      signDeg: 15.5,
      house: 1,
    },
    moon: {
      lon: 95.2,
      retrograde: false,
      sign: 'Cancer',
      signDeg: 5.2,
      house: 4,
    },
    mercury: {
      lon: 10.8,
      retrograde: false,
      sign: 'Aries',
      signDeg: 10.8,
      house: 1,
    },
    venus: {
      lon: 52.3,
      retrograde: false,
      sign: 'Taurus',
      signDeg: 22.3,
      house: 2,
    },
    mars: {
      lon: 68.1,
      retrograde: false,
      sign: 'Gemini',
      signDeg: 8.1,
      house: 3,
    },
    jupiter: {
      lon: 358.4,
      retrograde: true,
      sign: 'Pisces',
      signDeg: 28.4,
      house: 12,
    },
    saturn: {
      lon: 282.7,
      retrograde: false,
      sign: 'Capricorn',
      signDeg: 12.7,
      house: 10,
    },
    uranus: {
      lon: 303.9,
      retrograde: true,
      sign: 'Aquarius',
      signDeg: 3.9,
      house: 11,
    },
    neptune: {
      lon: 348.2,
      retrograde: false,
      sign: 'Pisces',
      signDeg: 18.2,
      house: 12,
    },
    pluto: {
      lon: 265.6,
      retrograde: true,
      sign: 'Sagittarius',
      signDeg: 25.6,
      house: 9,
    },
    chiron: {
      lon: 135.0,
      retrograde: false,
      sign: 'Leo',
      signDeg: 15.0,
      house: 5,
    },
    mean_node: {
      lon: 75.0,
      retrograde: true,
      sign: 'Gemini',
      signDeg: 15.0,
      house: 3,
    },
  },
  unavailable: [],
  angles: { asc: 185.4, mc: 95.8, vertex: 10.0, eastPoint: 20.0 },
  cusps: [
    185.4, 215.4, 245.4, 275.4, 305.4, 335.4, 5.4, 35.4, 65.4, 95.4, 125.4,
    155.4,
  ],
  aspects: [
    {
      a: 'sun',
      b: 'mercury',
      aspect: 'conjunction',
      orb: 4.7,
      phase: 'separating',
      strength: 0.8,
    },
    {
      a: 'sun',
      b: 'mars',
      aspect: 'sextile',
      orb: 2.6,
      phase: 'applying',
      strength: 0.6,
    },
    {
      a: 'moon',
      b: 'venus',
      aspect: 'trine',
      orb: 3.1,
      phase: 'separating',
      strength: 0.7,
    },
  ],
  lots: [{ lot: 'fortune', lon: 45, sign: 'taurus', signDeg: 15, house: 2 }],
}))

// ---------------------------------------------------------------------------
// Mock: Database
// ---------------------------------------------------------------------------

// Shape of a stored birth-data row in the mocked Drizzle layer.
interface BirthDataRow extends Record<string, unknown> {
  id: string
}

const dbStore: BirthDataRow[] = []

vi.mock('@/infrastructure/db', () => ({
  db: {
    insert: () => ({
      values: (data: Record<string, unknown>) => {
        const id =
          (data.id as string) ??
          `test-id-${Math.random().toString(36).slice(2, 9)}`
        const record: BirthDataRow = { ...data, id }
        // dbStore is captured by reference from module scope
        dbStore.push(record)
        return undefined
      },
    }),
    select: () => ({
      from: () => ({
        where: (condition: { toString(): string } | null | undefined) => {
          const match = condition?.toString()?.match(/'([^']+)'/)
          const id = match?.[1]
          if (id) return { limit: () => dbStore.filter((r) => r.id === id) }
          return { limit: () => dbStore.map((r) => ({ ...r })) }
        },
      }),
    }),
    update: () => ({
      set: (data: Record<string, unknown>) => ({
        where: (condition: { toString(): string } | null | undefined) => {
          const match = condition?.toString()?.match(/'([^']+)'/)
          const id = match?.[1]
          const idx = dbStore.findIndex((r) => r.id === id)
          if (idx >= 0) {
            dbStore[idx] = { ...dbStore[idx], ...data }
          }
          return undefined
        },
      }),
    }),
    delete: () => ({
      where: (condition: { toString(): string } | null | undefined) => {
        const match = condition?.toString()?.match(/'([^']+)'/)
        const id = match?.[1]
        const idx = dbStore.findIndex((r) => r.id === id)
        if (idx >= 0) {
          dbStore.splice(idx, 1)
        }
        return undefined
      },
    }),
  },
}))

// ---------------------------------------------------------------------------
// Mock: Caelus engine (avoid loading real ephemeris data in tests)
// ---------------------------------------------------------------------------

vi.mock('caelus', () => ({
  Engine: class {
    chartAt = vi.fn().mockReturnValue(mockCaelusChart)
    lots = vi.fn().mockReturnValue(mockCaelusChart.lots)
  },
}))

vi.mock('caelus/node', () => ({
  loadNodeData: vi.fn().mockReturnValue({}),
}))

// Mock caelus-birth to avoid tzdb dependency (existing pattern)
vi.mock('caelus-birth', () => ({
  toUT: vi.fn().mockReturnValue({
    utc: { year: 1990, month: 6, day: 15, hour: 12, minute: 0, second: 0 },
    jdUt: 2448000.5,
    zone: 'America/New_York',
    offsetMinutes: -240,
    dst: false,
    status: 'ok',
  }),
}))

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

import * as createEndpoint from '@/pages/api/birth-data/create'
import * as chartEndpoint from '@/pages/api/chart/natal'

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

describe('Chart Pipeline (Birth Data → Natal Chart)', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  beforeEach(() => {
    dbStore.length = 0
  })

  it('completa el pipeline completo: crear birth data → calcular chart', async () => {
    // 1. Create birth data
    const createResponse = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 15 },
          time: { hour: 14, minute: 30 },
          latitude: 40.7128,
          longitude: -74.006,
          timezone: 'America/New_York',
          placeName: 'New York, USA',
        }),
      }),
    })

    expect(createResponse.status).toBe(200)
    const createBody = await createResponse.json()
    expect(createBody.data).toBeDefined()
    expect(createBody.data.id).toBeDefined()
    const birthDataId = createBody.data.id

    // 2. Calculate natal chart
    const chartResponse = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request(
        `http://localhost/api/chart/natal?birthDataId=${birthDataId}`,
        {
          method: 'GET',
        },
      ),
    })

    expect(chartResponse.status).toBe(200)
    const chartBody = await chartResponse.json()
    expect(chartBody.data).toBeDefined()

    // 3. Verify chart structure
    const chart = chartBody.data
    expect(chart.birthDataId).toBe(birthDataId)
    expect(chart.planets).toBeInstanceOf(Array)
    expect(chart.planets.length).toBeGreaterThanOrEqual(10)
    expect(chart.angles).toBeDefined()
    expect(chart.angles.ascendant).toBeDefined()
    expect(chart.angles.midheaven).toBeDefined()
    expect(chart.houses).toBeInstanceOf(Array)
    expect(chart.houses).toHaveLength(12)
    expect(chart.houseSystem).toBe('PLACIDUS')
    expect(chart.aspects).toBeInstanceOf(Array)
    expect(chart.additionalPoints).toBeInstanceOf(Array)

    // Verify a specific planet
    const sun = chart.planets.find(
      (p: { planet: string }) => p.planet === 'SUN',
    )
    expect(sun).toBeDefined()
    expect(sun.sign).toBeDefined()
    expect(sun.house).toBeGreaterThanOrEqual(1)
    expect(sun.house).toBeLessThanOrEqual(12)
  })

  it('retorna 404 cuando el birth data no existe', async () => {
    const response = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request(
        'http://localhost/api/chart/natal?birthDataId=nonexistent-id',
        {
          method: 'GET',
        },
      ),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('retorna 401 cuando el birth data pertenece a otro usuario', async () => {
    // Seed birth data for user-1
    const createResponse = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 15 },
          time: { hour: 14, minute: 30 },
          latitude: 40.7128,
          longitude: -74.006,
          timezone: 'America/New_York',
          placeName: 'New York, USA',
        }),
      }),
    })

    const createBody = await createResponse.json()
    const birthDataId = createBody.data.id

    // Try to access with a different user
    const response = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-2'),
      request: new Request(
        `http://localhost/api/chart/natal?birthDataId=${birthDataId}`,
        {
          method: 'GET',
        },
      ),
    })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('retorna 400 cuando falta birthDataId', async () => {
    const response = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request('http://localhost/api/chart/natal', {
        method: 'GET',
      }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('retorna warning cuando birth time es unknown', async () => {
    // Create birth data without time
    const createResponse = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 15 },
          latitude: 40.7128,
          longitude: -74.006,
          timezone: 'America/New_York',
          placeName: 'New York, USA',
          timeUnknown: true,
        }),
      }),
    })

    expect(createResponse.status).toBe(200)
    const createBody = await createResponse.json()
    const birthDataId = createBody.data.id

    // Calculate chart
    const chartResponse = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals('user-1'),
      request: new Request(
        `http://localhost/api/chart/natal?birthDataId=${birthDataId}`,
        {
          method: 'GET',
        },
      ),
    })

    expect(chartResponse.status).toBe(200)
    const chartBody = await chartResponse.json()
    expect(chartBody.warning).toBeDefined()
    expect(chartBody.data).toBeDefined()
  })
})
