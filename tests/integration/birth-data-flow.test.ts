/**
 * Birth Data Flow — End-to-End Integration Tests
 *
 * Tests the complete Birth Data pipeline:
 * HTTP Request → API Route → Use Case → Drizzle Repository → Mocked DB
 *
 * Validates full CRUD operations working seamlessly together:
 * 1. Create flow: POST /api/birth-data → BirthData VO → CreateBirthDataUseCase → Repository → DB
 * 2. Read flow: GET /api/birth-data/[id] → GetBirthDataUseCase → Repository → DB → Response
 * 3. Update flow: PUT /api/birth-data/[id] → UpdateBirthDataUseCase → Repository → DB → Response
 * 4. Delete flow: DELETE /api/birth-data/[id] → DeleteBirthDataUseCase → Repository → DB → Response
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// Shape of a stored birth-data row, as returned by the mocked Drizzle layer.
interface BirthDataRow {
  id: string
  userId: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number | null
  birthMinute: number | null
  timeUnknown: boolean
  latitude: number
  longitude: number
  timezone: string
  placeName: string
}

// In-memory mock DB state to simulate real Drizzle persistence layer
const dbStore: BirthDataRow[] = []

vi.mock('@/infrastructure/db', () => ({
  db: {
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation(async (row: BirthDataRow) => {
        dbStore.push({ ...row })
        return undefined
      }),
    })),
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockImplementation(async () => {
            return dbStore.map((row) => ({ ...row }))
          }),
        })),
      })),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation((updates: Partial<BirthDataRow>) => ({
        where: vi.fn().mockImplementation(async () => {
          if (dbStore.length > 0) {
            Object.assign(dbStore[0], updates)
          }
          return undefined
        }),
      })),
    })),
    delete: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockImplementation(async () => {
          const deleted = dbStore.map((row) => ({ id: row.id }))
          dbStore.length = 0
          return deleted
        }),
      })),
    })),
  },
}))

import * as createEndpoint from '@/pages/api/birth-data/create'
import * as idEndpoint from '@/pages/api/birth-data/[id]'

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

describe('Birth Data End-to-End Pipeline Integration', () => {
  let container: AstroContainer
  const userId = 'usr_integration_123'
  let createdId: string

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  beforeEach(() => {
    dbStore.length = 0
  })

  it('1. Create Flow: POST /api/birth-data creates a record in DB and returns 200', async () => {
    const response = await container.renderToResponse(createEndpoint, {
      routeType: 'endpoint',
      locals: authedLocals(userId),
      request: new Request('http://localhost/api/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1990, month: 6, day: 10 },
          time: { hour: 10, minute: 30 },
          timeUnknown: false,
          latitude: 10.391,
          longitude: -75.479,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data).toBeDefined()
    expect(json.data.id).toBeDefined()
    expect(json.data.userId).toBe(userId)
    expect(json.data.placeName).toBe('Cartagena, Bolívar, Colombia')

    createdId = json.data.id
    expect(dbStore).toHaveLength(1)
    expect(dbStore[0].id).toBe(createdId)
    expect(dbStore[0].userId).toBe(userId)
  })

  it('2. Read Flow: GET /api/birth-data/[id] retrieves stored record from DB', async () => {
    // Seed DB store
    dbStore.push({
      id: 'bd_test_id',
      userId,
      birthYear: 1990,
      birthMonth: 6,
      birthDay: 10,
      birthHour: 10,
      birthMinute: 30,
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Bolívar, Colombia',
    })

    const response = await container.renderToResponse(idEndpoint, {
      routeType: 'endpoint',
      params: { id: 'bd_test_id' },
      locals: authedLocals(userId),
      request: new Request('http://localhost/api/birth-data/bd_test_id', {
        method: 'GET',
      }),
    })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data.id).toBe('bd_test_id')
    expect(json.data.userId).toBe(userId)
    expect(json.data.placeName).toBe('Cartagena, Bolívar, Colombia')
  })

  it('3. Update Flow: PUT /api/birth-data/[id] validates and updates DB record', async () => {
    // Seed DB store
    dbStore.push({
      id: 'bd_test_id',
      userId,
      birthYear: 1990,
      birthMonth: 6,
      birthDay: 10,
      birthHour: 10,
      birthMinute: 30,
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Bolívar, Colombia',
    })

    const response = await container.renderToResponse(idEndpoint, {
      routeType: 'endpoint',
      params: { id: 'bd_test_id' },
      locals: authedLocals(userId),
      request: new Request('http://localhost/api/birth-data/bd_test_id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: { year: 1995, month: 12, day: 25 },
          time: { hour: 8, minute: 15 },
          timeUnknown: false,
          latitude: 4.711,
          longitude: -74.072,
          timezone: 'America/Bogota',
          placeName: 'Bogotá, Cundinamarca, Colombia',
        }),
      }),
    })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data.placeName).toBe('Bogotá, Cundinamarca, Colombia')
    expect(json.data.date).toEqual({ year: 1995, month: 12, day: 25 })

    expect(dbStore[0].placeName).toBe('Bogotá, Cundinamarca, Colombia')
    expect(dbStore[0].birthYear).toBe(1995)
  })

  it('4. Delete Flow: DELETE /api/birth-data/[id] removes record from DB', async () => {
    // Seed DB store
    dbStore.push({
      id: 'bd_test_id',
      userId,
      birthYear: 1990,
      birthMonth: 6,
      birthDay: 10,
      birthHour: 10,
      birthMinute: 30,
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Bolívar, Colombia',
    })

    const deleteResponse = await container.renderToResponse(idEndpoint, {
      routeType: 'endpoint',
      params: { id: 'bd_test_id' },
      locals: authedLocals(userId),
      request: new Request('http://localhost/api/birth-data/bd_test_id', {
        method: 'DELETE',
      }),
    })

    expect(deleteResponse.status).toBe(200)
    const json = await deleteResponse.json()
    expect(json.message).toContain('eliminados exitosamente')
    expect(dbStore).toHaveLength(0)
  })
})
