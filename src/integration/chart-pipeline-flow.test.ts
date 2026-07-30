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
    sun: { lon: 15.5, retrograde: false, sign: 'Aries', signDeg: 15.5, house: 1 },
    moon: { lon: 95.2, retrograde: false, sign: 'Cancer', signDeg: 5.2, house: 4 },
    mercury: { lon: 10.8, retrograde: false, sign: 'Aries', signDeg: 10.8, house: 1 },
    venus: { lon: 52.3, retrograde: false, sign: 'Taurus', signDeg: 22.3, house: 2 },
    mars: { lon: 68.1, retrograde: false, sign: 'Gemini', signDeg: 8.1, house: 3 },
    jupiter: { lon: 358.4, retrograde: true, sign: 'Pisces', signDeg: 28.4, house: 12 },
    saturn: { lon: 282.7, retrograde: false, sign: 'Capricorn', signDeg: 12.7, house: 10 },
    uranus: { lon: 303.9, retrograde: true, sign: 'Aquarius', signDeg: 3.9, house: 11 },
    neptune: { lon: 348.2, retrograde: false, sign: 'Pisces', signDeg: 18.2, house: 12 },
    pluto: { lon: 265.6, retrograde: true, sign: 'Sagittarius', signDeg: 25.6, house: 9 },
    chiron: { lon: 135.0, retrograde: false, sign: 'Leo', signDeg: 15.0, house: 5 },
    mean_node: { lon: 75.0, retrograde: true, sign: 'Gemini', signDeg: 15.0, house: 3 },
  },
  unavailable: [],
  angles: { asc: 185.4, mc: 95.8, vertex: 10.0, eastPoint: 20.0 },
  cusps: [185.4, 215.4, 245.4, 275.4, 305.4, 335.4, 5.4, 35.4, 65.4, 95.4, 125.4, 155.4],
  aspects: [
    { a: 'sun', b: 'mercury', aspect: 'conjunction', orb: 4.7, phase: 'separating', strength: 0.8 },
    { a: 'sun', b: 'mars', aspect: 'sextile', orb: 2.6, phase: 'applying', strength: 0.6 },
    { a: 'moon', b: 'venus', aspect: 'trine', orb: 3.1, phase: 'separating', strength: 0.7 },
  ],
  lots: [
    { lot: 'fortune', lon: 45, sign: 'taurus', signDeg: 15, house: 2 },
  ],
}))

// Build a mock NatalChart-compatible object (what the calculator returns)
const buildChart = vi.hoisted(() => (birthDataId: string) => ({
  birthDataId,
  calculatedAt: new Date(),
  houseSystem: 'PLACIDUS',
  zodiac: 'TROPICAL',
  planets: [
    { planet: 'SUN', sign: 'ARIES', degree: 15, minute: 30, house: 1, isRetrograde: false },
    { planet: 'MOON', sign: 'CANCER', degree: 5, minute: 12, house: 4, isRetrograde: false },
    { planet: 'MERCURY', sign: 'ARIES', degree: 10, minute: 48, house: 1, isRetrograde: false },
    { planet: 'VENUS', sign: 'TAURUS', degree: 22, minute: 18, house: 2, isRetrograde: false },
    { planet: 'MARS', sign: 'GEMINI', degree: 8, minute: 6, house: 3, isRetrograde: false },
    { planet: 'JUPITER', sign: 'PISCES', degree: 28, minute: 24, house: 12, isRetrograde: true },
    { planet: 'SATURN', sign: 'CAPRICORN', degree: 12, minute: 42, house: 10, isRetrograde: false },
    { planet: 'URANUS', sign: 'AQUARIUS', degree: 3, minute: 54, house: 11, isRetrograde: true },
    { planet: 'NEPTUNE', sign: 'PISCES', degree: 18, minute: 12, house: 12, isRetrograde: false },
    { planet: 'PLUTO', sign: 'SAGITTARIUS', degree: 25, minute: 36, house: 9, isRetrograde: true },
    { planet: 'CHIRON', sign: 'LEO', degree: 15, minute: 0, house: 5, isRetrograde: false },
  ],
  angles: { ascendant: 185.4, midheaven: 95.8, descendant: 5.4, immumCoeli: 275.8 },
  houses: [
    { house: 1, sign: 'LIBRA', degree: 5.4 },
    { house: 2, sign: 'SCORPIO', degree: 5.4 },
    { house: 3, sign: 'SAGITTARIUS', degree: 5.4 },
    { house: 4, sign: 'CAPRICORN', degree: 5.4 },
    { house: 5, sign: 'AQUARIUS', degree: 5.4 },
    { house: 6, sign: 'PISCES', degree: 5.4 },
    { house: 7, sign: 'ARIES', degree: 5.4 },
    { house: 8, sign: 'TAURUS', degree: 5.4 },
    { house: 9, sign: 'GEMINI', degree: 5.4 },
    { house: 10, sign: 'CANCER', degree: 5.4 },
    { house: 11, sign: 'LEO', degree: 5.4 },
    { house: 12, sign: 'VIRGO', degree: 5.4 },
  ],
  aspects: [
    { planetA: 'SUN', planetB: 'MERCURY', type: 'CONJUNCTION', orb: 4.7, isApplying: false },
    { planetA: 'SUN', planetB: 'MARS', type: 'SEXTILE', orb: 2.6, isApplying: true },
    { planetA: 'MOON', planetB: 'VENUS', type: 'TRINE', orb: 3.1, isApplying: false },
  ],
  additionalPoints: [
    { point: 'NORTH_NODE', sign: 'GEMINI', degree: 15, house: 3 },
    { point: 'SOUTH_NODE', sign: 'SAGITTARIUS', degree: 15, house: 9 },
  ],
  toJSON() {
    return {
      birthDataId: this.birthDataId,
      calculatedAt: this.calculatedAt.toISOString(),
      houseSystem: this.houseSystem,
      zodiac: this.zodiac,
      planets: this.planets,
      angles: this.angles,
      houses: this.houses,
      aspects: this.aspects,
      additionalPoints: this.additionalPoints,
    }
  },
}))

// ---------------------------------------------------------------------------
// Mock: Database
// ---------------------------------------------------------------------------

const dbStore: Record<string, any>[] = []

vi.mock('@/db', () => ({
  db: {
    insert: () => ({
      values: (data: any) => {
        const id = data.id ?? `test-id-${Math.random().toString(36).slice(2, 9)}`
        const record = { ...data, id }
        // dbStore is captured by reference from module scope
        dbStore.push(record)
        return undefined
      },
    }),
    select: () => ({
      from: () => ({
        where: (condition: any) => {
          const match = condition?.toString?.()?.match(/'([^']+)'/)
          const id = match?.[1]
          if (id) return { limit: (_n: number) => dbStore.filter(r => r.id === id) }
          return { limit: (_n: number) => dbStore.map(r => ({ ...r })) }
        },
      }),
    }),
    update: () => ({
      set: (data: any) => ({
        where: (condition: any) => {
          const match = condition?.toString?.()?.match(/'([^']+)'/)
          const id = match?.[1]
          const idx = dbStore.findIndex(r => r.id === id)
          if (idx >= 0) {
            dbStore[idx] = { ...dbStore[idx], ...data }
          }
          return undefined
        },
      }),
    }),
    delete: () => ({
      where: (condition: any) => {
        const match = condition?.toString?.()?.match(/'([^']+)'/)
        const id = match?.[1]
        const idx = dbStore.findIndex(r => r.id === id)
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

import * as createEndpoint from '../pages/api/birth-data/create'
import * as chartEndpoint from '../pages/api/chart/natal'

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
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
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
      request: new Request(`http://localhost/api/chart/natal?birthDataId=${birthDataId}`, {
        method: 'GET',
        headers: { 'x-user-id': 'user-1' },
      }),
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
    const sun = chart.planets.find((p: any) => p.planet === 'SUN')
    expect(sun).toBeDefined()
    expect(sun.sign).toBeDefined()
    expect(sun.house).toBeGreaterThanOrEqual(1)
    expect(sun.house).toBeLessThanOrEqual(12)
  })

  it('retorna 404 cuando el birth data no existe', async () => {
    const response = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/chart/natal?birthDataId=nonexistent-id', {
        method: 'GET',
        headers: { 'x-user-id': 'user-1' },
      }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('retorna 401 cuando x-user-id no coincide', async () => {
    // Seed birth data for user-1
    const createResponse = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
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
      request: new Request(`http://localhost/api/chart/natal?birthDataId=${birthDataId}`, {
        method: 'GET',
        headers: { 'x-user-id': 'user-2' },
      }),
    })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('retorna 400 cuando falta birthDataId', async () => {
    const response = await container.renderToResponse(chartEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/chart/natal', {
        method: 'GET',
        headers: { 'x-user-id': 'user-1' },
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
      request: new Request('http://localhost/api/birth-data/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
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
      request: new Request(`http://localhost/api/chart/natal?birthDataId=${birthDataId}`, {
        method: 'GET',
        headers: { 'x-user-id': 'user-1' },
      }),
    })

    expect(chartResponse.status).toBe(200)
    const chartBody = await chartResponse.json()
    expect(chartBody.warning).toBeDefined()
    expect(chartBody.data).toBeDefined()
  })
})
