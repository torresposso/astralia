import { describe, it, expect, beforeAll, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// Mock database layer
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import * as idEndpoint from './[id]'
import { db } from '@/db'

describe('GET, PUT, DELETE /api/birth-data/[id]', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  // -------------------------------------------------------------------------
  // GET /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('GET /api/birth-data/[id]', () => {
    it('should return 401 when x-user-id header is missing', async () => {
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
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'non_existent' },
        request: new Request('http://localhost/api/birth-data/non_existent', {
          method: 'GET',
          headers: { 'x-user-id': 'usr_1' },
        }),
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
    })

    it('should return 200 + data on success', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
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
              },
            ]),
          }),
        }),
      } as any)

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'GET',
          headers: { 'x-user-id': 'usr_1' },
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
    it('should return 415 when Content-Type is not application/json', async () => {
      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain', 'x-user-id': 'usr_1' },
          body: 'hello',
        }),
      })

      expect(response.status).toBe(415)
    })

    it('should return 400 when body is invalid JSON', async () => {
      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_1' },
          body: 'not-json',
        }),
      })

      expect(response.status).toBe(400)
    })

    it('should return 200 + updated data on success', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
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
              },
            ]),
          }),
        }),
      } as any)

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any)

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_1' },
          body: JSON.stringify({
            userId: 'usr_1',
            date: { year: 1995, month: 12, day: 25 },
            time: { hour: 10, minute: 0 },
            timeUnknown: false,
            latitude: 4.711,
            longitude: -74.072,
            timezone: 'America/Bogota',
            placeName: 'Bogotá, Colombia',
          }),
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.placeName).toBe('Bogotá, Colombia')
    })
  })

  // -------------------------------------------------------------------------
  // DELETE /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('DELETE /api/birth-data/[id]', () => {
    it('should return 200 + confirmation message on success', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
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
              },
            ]),
          }),
        }),
      } as any)

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      } as any)

      const response = await container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'DELETE',
          headers: { 'x-user-id': 'usr_1' },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toContain('eliminados exitosamente')
    })
  })
})
