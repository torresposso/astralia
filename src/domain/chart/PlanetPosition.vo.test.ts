import { describe, it, expect } from 'vitest'
import { PlanetPosition } from './PlanetPosition.vo'
import { Planet, ZodiacSign } from './enums'

describe('PlanetPosition', () => {
  const validProps = {
    planet: Planet.SUN,
    sign: ZodiacSign.ARIES,
    degree: 15.5,
    minute: 30,
    house: 1,
    isRetrograde: false,
  }

  describe('create', () => {
    it('should create PlanetPosition with valid props', () => {
      const result = PlanetPosition.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeInstanceOf(PlanetPosition)
        expect(result.value.planet).toBe(Planet.SUN)
        expect(result.value.sign).toBe(ZodiacSign.ARIES)
        expect(result.value.degree).toBe(15.5)
        expect(result.value.minute).toBe(30)
        expect(result.value.house).toBe(1)
        expect(result.value.isRetrograde).toBe(false)
      }
    })

    it('should create retrograde PlanetPosition', () => {
      const result = PlanetPosition.create({
        ...validProps,
        isRetrograde: true,
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.isRetrograde).toBe(true)
      }
    })

    it('should return error when degree is less than 0', () => {
      const result = PlanetPosition.create({
        ...validProps,
        degree: -1,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('grado')
      }
    })

    it('should return error when degree is 30 or more', () => {
      const result = PlanetPosition.create({
        ...validProps,
        degree: 30,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('grado')
      }
    })

    it('should return error when minute is less than 0', () => {
      const result = PlanetPosition.create({
        ...validProps,
        minute: -1,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('minuto')
      }
    })

    it('should return error when minute is 60 or more', () => {
      const result = PlanetPosition.create({
        ...validProps,
        minute: 60,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('minuto')
      }
    })

    it('should return error when house is less than 1', () => {
      const result = PlanetPosition.create({
        ...validProps,
        house: 0,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('casa')
      }
    })

    it('should return error when house is greater than 12', () => {
      const result = PlanetPosition.create({
        ...validProps,
        house: 13,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('casa')
      }
    })

    it('should accept degree exactly 0', () => {
      const result = PlanetPosition.create({
        ...validProps,
        degree: 0,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept degree exactly 29.999', () => {
      const result = PlanetPosition.create({
        ...validProps,
        degree: 29.999,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept minute exactly 0', () => {
      const result = PlanetPosition.create({
        ...validProps,
        minute: 0,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept minute exactly 59', () => {
      const result = PlanetPosition.create({
        ...validProps,
        minute: 59,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept house exactly 1', () => {
      const result = PlanetPosition.create({
        ...validProps,
        house: 1,
      })
      expect(result.ok).toBe(true)
    })

    it('should accept house exactly 12', () => {
      const result = PlanetPosition.create({
        ...validProps,
        house: 12,
      })
      expect(result.ok).toBe(true)
    })
  })

  describe('from', () => {
    it('should reconstruct without validation', () => {
      const position = PlanetPosition.from(validProps)
      expect(position).toBeInstanceOf(PlanetPosition)
      expect(position.planet).toBe(Planet.SUN)
    })

    it('should reconstruct invalid data without throwing', () => {
      const position = PlanetPosition.from({
        ...validProps,
        degree: -5,
      })
      expect(position).toBeInstanceOf(PlanetPosition)
      expect(position.degree).toBe(-5)
    })
  })

  describe('equals', () => {
    it('should return true for same properties', () => {
      const result1 = PlanetPosition.create(validProps)
      const result2 = PlanetPosition.create(validProps)
      expect(result1.ok).toBe(true)
      expect(result2.ok).toBe(true)
      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(true)
      }
    })

    it('should return false for different properties', () => {
      const result1 = PlanetPosition.create(validProps)
      const result2 = PlanetPosition.create({
        ...validProps,
        house: 2,
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
      const result = PlanetPosition.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        const json = result.value.toJSON()
        expect(json).toEqual({
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          degree: 15.5,
          minute: 30,
          house: 1,
          isRetrograde: false,
        })
      }
    })
  })

  describe('toString', () => {
    it('should return a formatted string', () => {
      const result = PlanetPosition.create(validProps)
      expect(result.ok).toBe(true)
      if (result.ok) {
        const str = result.value.toString()
        expect(str).toContain('SUN')
        expect(str).toContain('ARIES')
        expect(str).toContain('15')
        expect(str).toContain('30')
        expect(str).toContain('Casa 1')
      }
    })

    it('should indicate retrograde', () => {
      const result = PlanetPosition.create({
        ...validProps,
        isRetrograde: true,
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const str = result.value.toString()
        expect(str).toContain('Rx')
      }
    })
  })
})
