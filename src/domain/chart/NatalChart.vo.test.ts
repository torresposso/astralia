import { describe, it, expect } from 'vitest'
import { NatalChart } from './NatalChart.vo'
import { PlanetPosition } from './PlanetPosition.vo'
import { Angles } from './Angles.vo'
import { HouseCusp } from './HouseCusp.vo'
import { Aspect } from './Aspect.vo'
import { AdditionalPoint } from './AdditionalPoint.vo'
import {
  Planet,
  ZodiacSign,
  AspectType,
  HouseSystem,
  ZodiacType,
  AdditionalPointType,
} from './enums'

function makeValidNatalChartProps() {
  const planets = [
    PlanetPosition.from({
      planet: Planet.SUN,
      sign: ZodiacSign.ARIES,
      degree: 15.5,
      minute: 30,
      house: 1,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.MOON,
      sign: ZodiacSign.CANCER,
      degree: 5.2,
      minute: 12,
      house: 4,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.MERCURY,
      sign: ZodiacSign.ARIES,
      degree: 10.8,
      minute: 48,
      house: 1,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.VENUS,
      sign: ZodiacSign.TAURUS,
      degree: 22.3,
      minute: 18,
      house: 2,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.MARS,
      sign: ZodiacSign.GEMINI,
      degree: 8.1,
      minute: 6,
      house: 3,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.JUPITER,
      sign: ZodiacSign.PISCES,
      degree: 28.4,
      minute: 24,
      house: 12,
      isRetrograde: true,
    }),
    PlanetPosition.from({
      planet: Planet.SATURN,
      sign: ZodiacSign.CAPRICORN,
      degree: 12.7,
      minute: 42,
      house: 10,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.URANUS,
      sign: ZodiacSign.AQUARIUS,
      degree: 3.9,
      minute: 54,
      house: 11,
      isRetrograde: true,
    }),
    PlanetPosition.from({
      planet: Planet.NEPTUNE,
      sign: ZodiacSign.PISCES,
      degree: 18.2,
      minute: 36,
      house: 12,
      isRetrograde: false,
    }),
    PlanetPosition.from({
      planet: Planet.PLUTO,
      sign: ZodiacSign.SAGITTARIUS,
      degree: 25.6,
      minute: 0,
      house: 9,
      isRetrograde: true,
    }),
  ]

  const angles = Angles.from({
    ascendant: 185.4,
    midheaven: 95.8,
    descendant: 5.4,
    immumCoeli: 275.8,
  })

  const houses = Array.from({ length: 12 }, (_, i) =>
    HouseCusp.from({
      house: i + 1,
      sign: ZodiacSign.LIBRA,
      degree: (i * 30) % 30,
    }),
  )

  const aspects = [
    Aspect.from({
      planetA: Planet.SUN,
      planetB: Planet.MERCURY,
      type: AspectType.CONJUNCTION,
      orb: 4.7,
      isApplying: false,
    }),
  ]

  const additionalPoints = [
    AdditionalPoint.from({
      point: AdditionalPointType.NORTH_NODE,
      sign: ZodiacSign.GEMINI,
      degree: 15.0,
      house: 3,
    }),
  ]

  return {
    birthDataId: 'birth_123',
    calculatedAt: new Date('2024-01-15T12:00:00Z'),
    houseSystem: HouseSystem.PLACIDUS,
    zodiac: ZodiacType.TROPICAL,
    planets,
    angles,
    houses,
    aspects,
    additionalPoints,
  }
}

describe('NatalChart', () => {
  describe('create', () => {
    it('should create NatalChart with all required components', () => {
      const props = makeValidNatalChartProps()
      const result = NatalChart.create(props)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeInstanceOf(NatalChart)
        expect(result.value.birthDataId).toBe('birth_123')
        expect(result.value.houseSystem).toBe(HouseSystem.PLACIDUS)
        expect(result.value.zodiac).toBe(ZodiacType.TROPICAL)
        expect(result.value.planets).toHaveLength(10)
        expect(result.value.houses).toHaveLength(12)
        expect(result.value.angles).toBeDefined()
      }
    })

    it('should return error when planets count is less than 10', () => {
      const props = makeValidNatalChartProps()
      props.planets = props.planets.slice(0, 9)
      const result = NatalChart.create(props)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('posiciones planetarias')
      }
    })

    it('should return error when houses count is not 12', () => {
      const props = makeValidNatalChartProps()
      props.houses = props.houses.slice(0, 11)
      const result = NatalChart.create(props)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('casas')
      }
    })
  })

  describe('from', () => {
    it('should reconstruct without validation', () => {
      const props = makeValidNatalChartProps()
      const chart = NatalChart.from(props)
      expect(chart).toBeInstanceOf(NatalChart)
      expect(chart.birthDataId).toBe('birth_123')
    })
  })

  describe('equals', () => {
    it('should implement equals() correctly', () => {
      const props = makeValidNatalChartProps()
      const chart1 = NatalChart.create(props)
      expect(chart1.ok).toBe(true)
      if (!chart1.ok) return

      const chart2 = NatalChart.create(props)
      expect(chart2.ok).toBe(true)
      if (!chart2.ok) return

      // Same data should be equal
      expect(chart1.value.equals(chart2.value)).toBe(true)
    })
  })

  describe('toJSON', () => {
    it('should return a serializable object', () => {
      const props = makeValidNatalChartProps()
      const result = NatalChart.create(props)
      expect(result.ok).toBe(true)
      if (result.ok) {
        const json = result.value.toJSON()
        expect(json.birthDataId).toBe('birth_123')
        expect(json.houseSystem).toBe(HouseSystem.PLACIDUS)
        expect(json.zodiac).toBe(ZodiacType.TROPICAL)
        expect(json.calculatedAt).toBe('2024-01-15T12:00:00.000Z')
        const planets = json.planets as Array<Record<string, unknown>>
        expect(planets).toHaveLength(10)
        expect(planets[0]).toMatchObject({
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
        })
        const houses = json.houses as Array<Record<string, unknown>>
        expect(houses).toHaveLength(12)
        expect(houses[0]).toMatchObject({
          house: 1,
        })
        expect(json.angles).toMatchObject({
          ascendant: 185.4,
        })
        expect(json.aspects).toHaveLength(1)
        expect(json.additionalPoints).toHaveLength(1)
      }
    })
  })
})
