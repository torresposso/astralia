import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// The routes still instantiate DrizzleBirthDataRepository, which imports
// @/infrastructure/db (requires TURSO_URL/.env) — stub it out. Application
// modules are mocked at the seam (GetBirthData, SaveBirthData, DeleteBirthData).
vi.mock('@/infrastructure/db', () => ({ db: {} }))

const saveBirthDataMocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}))

const getBirthDataMocks = vi.hoisted(() => ({
  execute: vi.fn(),
}))

const deleteBirthDataMocks = vi.hoisted(() => ({
  execute: vi.fn(),
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

vi.mock('@/application/birth/GetBirthData', () => ({
  GetBirthData: class GetBirthData {
    execute = getBirthDataMocks.execute
  },
}))

vi.mock('@/application/birth/DeleteBirthData', () => ({
  DeleteBirthData: class DeleteBirthData {
    execute = deleteBirthDataMocks.execute
  },
}))

import * as idEndpoint from './[id]'
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

function birthDataRecord(): BirthData {
  const result = BirthData.create({
    id: 'bd_123',
    userId: 'usr_1',
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 14, minute: 30 },
    timeUnknown: false,
    latitude: 10.391,
    longitude: -75.479,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Colombia',
  })
  if (!result.ok) throw new Error(`Failed to build BirthData: ${result.error}`)
  return result.value
}

let container: AstroContainer

describe('GET, PUT, DELETE /api/birth-data/[id]', () => {
  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  beforeEach(() => {
    saveBirthDataMocks.update.mockReset()
    getBirthDataMocks.execute.mockReset()
    deleteBirthDataMocks.execute.mockReset()
  })

  // -------------------------------------------------------------------------
  // GET /api/birth-data/[id]
  // -------------------------------------------------------------------------
  describe('GET /api/birth-data/[id]', () => {
    function getRequest(locals?: App.Locals) {
      return container.renderToResponse(idEndpoint, {
        routeType: 'endpoint',
        params: { id: 'bd_123' },
        locals,
        request: new Request('http://localhost/api/birth-data/bd_123', {
          method: 'GET',
        }),
      })
    }

    it('should return 401 when there is no authenticated session', async () => {
      const response = await getRequest()

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'No autorizado' })
      expect(getBirthDataMocks.execute).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data is not found', async () => {
      getBirthDataMocks.execute.mockResolvedValue({
        ok: false,
        error: 'Datos de nacimiento no encontrados',
      })

      const response = await getRequest(authedLocals('usr_1'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
    })

    it('should return 200 + data on success', async () => {
      getBirthDataMocks.execute.mockResolvedValue({
        ok: true,
        data: birthDataRecord(),
      })

      const response = await getRequest(authedLocals('usr_1'))

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
      expect(saveBirthDataMocks.update).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data is not found', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: false,
        error: { type: 'not-found', message: 'Birth data not found' },
      })

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
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
      expect(saveBirthDataMocks.update).not.toHaveBeenCalled()
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
      expect(saveBirthDataMocks.update).not.toHaveBeenCalled()
    })

    it('should return 400 with the VO field-level message for validation errors', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: false,
        error: {
          type: 'validation',
          message: 'La fecha debe estar entre el 1 de enero de 1800 y hoy',
        },
      })

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('1800')
    })

    it('should return 400 with the es-CO message for nonexistent times', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: false,
        error: {
          type: 'nonexistent-time',
          message: 'Birth time does not exist',
        },
      })

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('no existe')
    })

    it('should return 500 when the repository is unavailable', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: false,
        error: { type: 'unavailable', message: 'store down' },
      })

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should return 200 + updated data with warning on success', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: true,
        data: birthDataRecord(),
        warnings: ['whole-sign'],
      })

      const response = await putRequest(authedLocals('usr_1'))

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.id).toBe('bd_123')
      expect(data.warning).toContain('No registraste la hora')
    })

    it('should forward id, mapped input, and owner id to SaveBirthData', async () => {
      saveBirthDataMocks.update.mockResolvedValue({
        ok: true,
        data: birthDataRecord(),
        warnings: [],
      })

      await putRequest(authedLocals('usr_1'))

      expect(saveBirthDataMocks.update).toHaveBeenCalledTimes(1)
      const [id, input, ownerId] = saveBirthDataMocks.update.mock.calls[0]
      expect(id).toBe('bd_123')
      expect(input).toMatchObject({
        date: { year: 1995, month: 12, day: 25 },
        placeName: 'Bogotá, Colombia',
      })
      expect(ownerId).toBe('usr_1')
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
      expect(deleteBirthDataMocks.execute).not.toHaveBeenCalled()
    })

    it('should return 404 when birth data is not found', async () => {
      deleteBirthDataMocks.execute.mockResolvedValue({
        ok: false,
        error: 'Datos de nacimiento no encontrados',
      })

      const response = await deleteRequest(authedLocals('usr_1'))

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Datos de nacimiento no encontrados' })
    })

    it('should return 200 + confirmation message on success', async () => {
      deleteBirthDataMocks.execute.mockResolvedValue({
        ok: true,
        message: 'Datos de nacimiento eliminados exitosamente',
      })

      const response = await deleteRequest(authedLocals('usr_1'))

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toContain('eliminados exitosamente')
    })
  })
})
