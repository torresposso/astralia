import { describe, it, expect, beforeAll, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// Mock database layer
vi.mock('@/infrastructure/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import * as idEndpoint from './[id]'
import { db } from '@/infrastructure/db'

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

/**
 * Type the hand-built Drizzle query-builder chains. vi.mock() swaps the
 * runtime `@/infrastructure/db` module, but TypeScript still resolves the real
 * Drizzle builder types, whose generic shape doesn't match the plain chain
 * objects built here. The cast goes through `unknown` (no `as any`).
 */
function mockBuilder<T>(builder: unknown): T {
  return builder as T
}

/** A stored birth-data row as returned by the mocked `select().from().where().limit()` chain. */
const birthDataRow = {
  id: 'bd_123',
  userId: 'usr_1',
  birthYear: 1990,
  birthMonth: 6,
  birthDay: 10,
  birthHour: 14,
  birthMinute: 30,
  timeUnknown: false,
  latitude: 10.391,
  longitude: -75.479,
  timezone: 'America/Bogota',
  placeName: 'Cartagena, Colombia',
}

/** Configure the mocked `db.select` chain to resolve with the given rows. */
function mockSelectResolving(rows: unknown[]) {
  vi.mocked(db.select).mockReturnValue(
    mockBuilder({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(rows),
        }),
      }),
    }),
  )
}

describe('GET, PUT, DELETE /api/birth-data/[id]', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  // -------------------------------------------------------------------------
  // GET /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('GET /api/birth-data/[id]', () => {
    it('should return 401 when there is no authenticated session', async () => {
      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'GET',
        }),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'No autorizado' })
    })

    it('should return 404 when birth data is not found', async () => {
      mockSelectResolving([])

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'non_existent' },
        locals: authedLocals('usr_1'),
        request: new Request('http://localhost/api/birth-data/non_existent', {
          method: 'GET',
        }),
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
    })

    it('should return 404 when birth data belongs to another user', async () => {
      mockSelectResolving([birthDataRow])

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals: authedLocals('other_user'),
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'GET',
        }),
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
    })

    it('should return 200 + data on success', async () => {
      mockSelectResolving([birthDataRow])

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals: authedLocals('usr_1'),
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'GET',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.id).toBe('bd_123')
      expect(data.data.placeName).toBe('Cartagena, Colombia')
    })
  })

  // -------------------------------------------------------------------------
  // PUT /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('PUT /api/birth-data/[id]', () => {
    const updatePayload = {
      date: { year: 1995, month: 12, day: 25 },
      time: { hour: 10, minute: 0 },
      timeUnknown: false,
      latitude: 4.711,
      longitude: -74.072,
      timezone: 'America/Bogota',
      placeName: 'Bogotá, Colombia',
    }

    function putRequest(locals?: App.Locals) {
      return container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals,
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        }),
      })
    }

    it('should return 401 when there is no authenticated session', async () => {
      const response = await putRequest()

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'No autorizado' })
      expect(db.update).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data is not found and never call db.update', async () => {
      mockSelectResolving([])

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
      expect(db.update).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data belongs to another user and never call db.update', async () => {
      mockSelectResolving([birthDataRow])

      const response = await putRequest(authedLocals('other_user'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
      expect(db.update).not.toHaveBeenCalled()
    })

    it('should return 415 when Content-Type is not application/json', async () => {
      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals: authedLocals('usr_1'),
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain' },
          body: 'hello',
        }),
      })

      expect(response.status).toBe(415)
    })

    it('should return 400 when body is invalid JSON', async () => {
      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals: authedLocals('usr_1'),
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: 'not-json',
        }),
      })

      expect(response.status).toBe(400)
    })

    it('should return 200 + updated data on success', async () => {
      mockSelectResolving([birthDataRow])

      vi.mocked(db.update).mockReturnValue(
        mockBuilder({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      )

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.placeName).toBe('Bogotá, Colombia')
    })
  })

  // -------------------------------------------------------------------------
  // DELETE /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('DELETE /api/birth-data/[id]', () => {
    function deleteRequest(locals?: App.Locals) {
      return container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals,
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'DELETE',
        }),
      })
    }

    it('should return 401 when there is no authenticated session', async () => {
      const response = await deleteRequest()

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'No autorizado' })
      expect(db.delete).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data is not found and never call db.delete', async () => {
      mockSelectResolving([])

      const response = await deleteRequest(authedLocals('usr_1'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
      expect(db.delete).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data belongs to another user and never call db.delete', async () => {
      mockSelectResolving([birthDataRow])

      const response = await deleteRequest(authedLocals('other_user'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
      expect(db.delete).not.toHaveBeenCalled()
    })

    it('should return 200 + confirmation message on success', async () => {
      mockSelectResolving([birthDataRow])

      vi.mocked(db.delete).mockReturnValue(
        mockBuilder({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'bd_123' }]),
          }),
        }),
      )

      const response = await deleteRequest(authedLocals('usr_1'))

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toContain('eliminados exitosamente')
    })
  })
})
