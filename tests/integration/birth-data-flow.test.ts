/**
 * Birth Data Flow — Integration Tests
 *
 * Tests the complete Birth Data pipeline at the repository seam:
 * HTTP Request → API Route → Application module → Mocked Repository (in-memory)
 *
 * The DrizzleBirthDataRepository module is mocked with an in-memory
 * implementation of IBirthDataRepository so the routes run against the real
 * application modules (SaveBirthData, GetBirthData, DeleteBirthData) without
 * hand-building Drizzle query-builder chains.
 *
 * Validates full CRUD operations working seamlessly together:
 * 1. Create flow: POST /api/birth-data → SaveBirthData → Repository → DB
 * 2. Read flow: GET /api/birth-data/[id] → GetBirthData → Repository → DB → Response
 * 3. Update flow: PUT /api/birth-data/[id] → SaveBirthData → Repository → DB → Response
 * 4. Delete flow: DELETE /api/birth-data/[id] → DeleteBirthData → Repository → DB → Response
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { BirthData, type BirthDataProps } from '@/domain/birth/BirthData.vo'

// In-memory store backing the mocked repository (module seam).
const dbStore: BirthData[] = []

vi.mock('@/infrastructure/birth/DrizzleBirthDataRepository', () => {
  class InMemoryDrizzleBirthDataRepository {
    async create(birthData: BirthData) {
      const id = birthData.id ?? `bd_${dbStore.length + 1}`
      const saved = BirthData.from({
        ...birthData.toJSON(),
        id,
      } as unknown as BirthDataProps)
      dbStore.push(saved)
      return { ok: true, data: saved }
    }

    async findById(id: string) {
      const found = dbStore.find((b) => b.id === id)
      if (!found) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      return { ok: true, data: found }
    }

    async findByUserId(userId: string) {
      return dbStore.find((b) => b.userId === userId) ?? null
    }

    async update(id: string, birthData: BirthData) {
      const idx = dbStore.findIndex((b) => b.id === id)
      if (idx === -1) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      const saved = BirthData.from({
        ...birthData.toJSON(),
        id,
      } as unknown as BirthDataProps)
      dbStore[idx] = saved
      return { ok: true, data: saved }
    }

    async delete(id: string) {
      const idx = dbStore.findIndex((b) => b.id === id)
      if (idx === -1) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      dbStore.splice(idx, 1)
      return { ok: true }
    }
  }

  return { DrizzleBirthDataRepository: InMemoryDrizzleBirthDataRepository }
})

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

function seedStoredBirthData(id: string, userId: string): void {
  const result = BirthData.from({
    id,
    userId,
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 10, minute: 30 },
    timeUnknown: false,
    latitude: 10.391,
    longitude: -75.479,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Bolívar, Colombia',
  })
  dbStore.push(result)
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

  it('1. Create Flow: POST /api/birth-data creates a record and returns 200', async () => {
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

  it('2. Read Flow: GET /api/birth-data/[id] retrieves the stored record', async () => {
    // Seed the store
    seedStoredBirthData('bd_test_id', userId)

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

  it('3. Update Flow: PUT /api/birth-data/[id] validates and updates the record', async () => {
    // Seed the store
    seedStoredBirthData('bd_test_id', userId)

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
    expect(dbStore[0].date.year).toBe(1995)
  })

  it('4. Delete Flow: DELETE /api/birth-data/[id] removes the record', async () => {
    // Seed the store
    seedStoredBirthData('bd_test_id', userId)

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
