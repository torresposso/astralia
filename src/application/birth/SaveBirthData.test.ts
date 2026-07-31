import { describe, it, expect, beforeEach } from 'vitest'
import { SaveBirthData } from './SaveBirthData'
import { MockBirthDataRepository } from './__mocks__/MockBirthDataRepository'
import { MockBirthToUTConverter } from './__mocks__/MockBirthToUTConverter'
import { BirthData } from '@/domain/birth/BirthData.vo'
import type { UTConversionResult } from '@/domain/birth/ports/IBirthToUTConverter'

describe('SaveBirthData', () => {
  let repository: MockBirthDataRepository
  let utConverter: MockBirthToUTConverter
  let saveBirthData: SaveBirthData

  const validInput = {
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 10, minute: 30 },
    timeUnknown: false,
    latitude: 10.39,
    longitude: -75.5,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Bolívar, Colombia',
  }

  beforeEach(() => {
    repository = new MockBirthDataRepository()
    utConverter = new MockBirthToUTConverter()
    saveBirthData = new SaveBirthData(repository, utConverter)
  })

  function utResultWithStatus(
    status: 'ok' | 'ambiguous' | 'nonexistent',
  ): UTConversionResult {
    return {
      ok: true,
      data: {
        utc: { year: 1990, month: 6, day: 10, hour: 15, minute: 30, second: 0 },
        jdUt: 2448074.5,
        zone: 'America/Bogota',
        offsetMinutes: -300,
        dst: true,
        status,
      },
    }
  }

  function seededBirthData(
    id: string,
    userId: string,
    overrides: Partial<typeof validInput> = {},
  ): BirthData {
    const result = BirthData.create({
      id,
      userId,
      ...validInput,
      ...overrides,
    })
    if (!result.ok) throw new Error(`Failed to seed BirthData: ${result.error}`)
    repository.seed(id, result.value)
    return result.value
  }

  describe('create', () => {
    it('should return the saved birth data with no warnings on a clean save', async () => {
      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.userId).toBe('user_123')
        expect(result.data.hasTime()).toBe(true)
        expect(result.warnings).toEqual([])
      }
    })

    it('should reject nonexistent local times with NonexistentTimeError', async () => {
      utConverter.convertSpy.mockReturnValue(utResultWithStatus('nonexistent'))

      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('nonexistent-time')
      }
    })

    it('should accept ambiguous times and emit the dst-ambiguous warning', async () => {
      utConverter.convertSpy.mockReturnValue(utResultWithStatus('ambiguous'))

      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.warnings).toContain('dst-ambiguous')
        expect(result.warnings).not.toContain('whole-sign')
      }
    })

    it('should report UnavailableError (not NotFoundError) when the repository is down', async () => {
      repository.withUnavailable('Database connection failed')

      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('unavailable')
        expect(result.error.type).not.toBe('not-found')
      }
    })

    it('should return a validation error when coordinates are absent (no sentinel 0)', async () => {
      const result = await saveBirthData.create(
        { ...validInput, latitude: undefined, longitude: undefined },
        'user_123',
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('validation')
        expect(result.error.message).toContain('latitud')
      }
    })

    it('should preserve VO field-level validation messages (date before 1800)', async () => {
      const result = await saveBirthData.create(
        { ...validInput, date: { year: 1700, month: 1, day: 1 } },
        'user_123',
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('validation')
        expect(result.error.message).toContain('1800')
      }
    })

    it('should return a conversion error when the UT converter fails', async () => {
      utConverter.withFailure('Error al convertir a UT')

      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('conversion-failed')
        expect(result.error.message).toBe('Error al convertir a UT')
      }
    })
  })

  describe('whole-sign warning (preserved condition)', () => {
    it('should warn with whole-sign when the saved record has no time', async () => {
      const result = await saveBirthData.create(
        { ...validInput, time: null, timeUnknown: true },
        'user_123',
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.hasTime()).toBe(false)
        expect(result.warnings).toContain('whole-sign')
      }
    })

    it('should not warn with whole-sign when a time is recorded', async () => {
      const result = await saveBirthData.create(validInput, 'user_123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.warnings).not.toContain('whole-sign')
      }
    })
  })

  describe('update', () => {
    it('should update existing birth data owned by the user', async () => {
      seededBirthData('bd_123', 'usr_1')

      const result = await saveBirthData.update(
        'bd_123',
        { ...validInput, placeName: 'Bogotá, Colombia' },
        'usr_1',
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.placeName).toBe('Bogotá, Colombia')
      }
    })

    it('should return NotFoundError when the record does not exist', async () => {
      const result = await saveBirthData.update(
        'non_existent',
        validInput,
        'usr_1',
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('not-found')
      }
    })

    it('should return NotFoundError when the record belongs to another user', async () => {
      seededBirthData('bd_123', 'usr_1')

      const result = await saveBirthData.update(
        'bd_123',
        validInput,
        'other_user',
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('not-found')
      }
    })

    it('should report UnavailableError when findById hits a DB failure (not NotFoundError)', async () => {
      repository.withUnavailable()

      const result = await saveBirthData.update('bd_123', validInput, 'usr_1')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('unavailable')
      }
    })

    it('should warn whole-sign when updating to an unknown birth time', async () => {
      seededBirthData('bd_123', 'usr_1')

      const result = await saveBirthData.update(
        'bd_123',
        { ...validInput, time: null, timeUnknown: true },
        'usr_1',
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.warnings).toContain('whole-sign')
      }
    })
  })
})
