import { describe, it, expect } from 'vitest'
import { BirthData } from './BirthData.vo.ts'

describe('BirthData', () => {
  const validProps = {
    userId: 'user_123',
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 10, minute: 30 },
    timeUnknown: false,
    latitude: 10.39,
    longitude: -75.5,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Bolívar, Colombia',
  }

  describe('create', () => {
    it('should create BirthData with valid props', () => {
      const result = BirthData.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeInstanceOf(BirthData)
        expect(result.value.userId).toBe('user_123')
        expect(result.value.date).toEqual({ year: 1990, month: 6, day: 10 })
        expect(result.value.time).toEqual({ hour: 10, minute: 30 })
        expect(result.value.timeUnknown).toBe(false)
        expect(result.value.latitude).toBe(10.39)
        expect(result.value.longitude).toBe(-75.5)
        expect(result.value.timezone).toBe('America/Bogota')
        expect(result.value.placeName).toBe('Cartagena, Bolívar, Colombia')
      }
    })

    it('should create BirthData without time (timeUnknown=true)', () => {
      const result = BirthData.create({
        ...validProps,
        time: null,
        timeUnknown: true,
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.hasTime()).toBe(false)
        expect(result.value.time).toBeNull()
        expect(result.value.timeUnknown).toBe(true)
      }
    })

    it('should return error when date is before 1800', () => {
      const result = BirthData.create({
        ...validProps,
        date: { year: 1700, month: 1, day: 1 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('1800')
      }
    })

    it('should return error when date is after today', () => {
      const result = BirthData.create({
        ...validProps,
        date: { year: 3000, month: 1, day: 1 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('hoy')
      }
    })

    it('should return error when latitude is out of range', () => {
      const result = BirthData.create({
        ...validProps,
        latitude: 100,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('latitud')
      }
    })

    it('should return error when longitude is out of range', () => {
      const result = BirthData.create({
        ...validProps,
        longitude: 200,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('longitud')
      }
    })

    it('should return error when timezone is empty', () => {
      const result = BirthData.create({
        ...validProps,
        timezone: '',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('zona horaria')
      }
    })

    it('should return error when timezone is invalid', () => {
      const result = BirthData.create({
        ...validProps,
        timezone: 'Invalid/Zone',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('zona horaria')
      }
    })

    it('should return error when placeName is empty', () => {
      const result = BirthData.create({
        ...validProps,
        placeName: '',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('lugar')
      }
    })

    it('should return error when placeName exceeds 200 chars', () => {
      const result = BirthData.create({
        ...validProps,
        placeName: 'A'.repeat(201),
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('lugar')
      }
    })

    it('should return error when userId is empty', () => {
      const result = BirthData.create({
        ...validProps,
        userId: '',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('usuario')
      }
    })

    it('should return error when hour is invalid', () => {
      const result = BirthData.create({
        ...validProps,
        time: { hour: 25, minute: 30 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('hora')
      }
    })

    it('should return error when minute is invalid', () => {
      const result = BirthData.create({
        ...validProps,
        time: { hour: 10, minute: 60 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('minuto')
      }
    })

    it('should return error when time is null and timeUnknown is false', () => {
      const result = BirthData.create({
        ...validProps,
        time: null,
        timeUnknown: false,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('hora es requerida')
      }
    })

    it('should return error when latitude is exactly -91', () => {
      const result = BirthData.create({
        ...validProps,
        latitude: -91,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('latitud')
      }
    })

    it('should accept latitude exactly -90', () => {
      const result = BirthData.create({
        ...validProps,
        latitude: -90,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept latitude exactly 90', () => {
      const result = BirthData.create({
        ...validProps,
        latitude: 90,
      })
      expect(result.ok).toBe(true)
    })
  })

  describe('from', () => {
    it('should reconstruct BirthData without validation', () => {
      const birthData = BirthData.from(validProps)
      expect(birthData).toBeInstanceOf(BirthData)
      expect(birthData.userId).toBe('user_123')
      expect(birthData.date).toEqual({ year: 1990, month: 6, day: 10 })
    })

    it('should reconstruct with invalid data without throwing', () => {
      const birthData = BirthData.from({
        ...validProps,
        date: { year: 1700, month: 1, day: 1 },
      })
      expect(birthData).toBeInstanceOf(BirthData)
      expect(birthData.date.year).toBe(1700)
    })
  })

  describe('hasTime', () => {
    it('should return true when time is provided', () => {
      const result = BirthData.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.hasTime()).toBe(true)
      }
    })

    it('should return false when time is null', () => {
      const result = BirthData.create({
        ...validProps,
        time: null,
        timeUnknown: true,
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.hasTime()).toBe(false)
      }
    })
  })

  describe('equals', () => {
    it('should return true for same properties', () => {
      const result1 = BirthData.create(validProps)
      const result2 = BirthData.create(validProps)
      expect(result1.ok).toBe(true)
      expect(result2.ok).toBe(true)
      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(true)
      }
    })

    it('should return false for different properties', () => {
      const result1 = BirthData.create(validProps)
      const result2 = BirthData.create({
        ...validProps,
        placeName: 'Bogotá, Colombia',
      })
      expect(result1.ok).toBe(true)
      expect(result2.ok).toBe(true)
      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(false)
      }
    })
  })

  describe('toJSON', () => {
    it('should return a plain object', () => {
      const result = BirthData.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        const json = result.value.toJSON()
        expect(json).toEqual({
          userId: 'user_123',
          date: { year: 1990, month: 6, day: 10 },
          time: { hour: 10, minute: 30 },
          timeUnknown: false,
          latitude: 10.39,
          longitude: -75.5,
          timezone: 'America/Bogota',
          placeName: 'Cartagena, Bolívar, Colombia',
        })
      }
    })

    it('should include warning fields when relevant', () => {
      const result = BirthData.create({
        ...validProps,
        time: null,
        timeUnknown: true,
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const json = result.value.toJSON()
        expect(json.time).toBeNull()
        expect(json.timeUnknown).toBe(true)
      }
    })
  })

  describe('toString', () => {
    it('should return a formatted string', () => {
      const result = BirthData.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        const str = result.value.toString()
        expect(str).toContain('1990')
        expect(str).toContain('10:30')
        expect(str).toContain('America/Bogota')
        expect(str).toContain('Cartagena')
      }
    })
  })
})
