import { describe, it, expect } from 'vitest'
import { CaelusChartMapper, type CaelusChart } from './CaelusChartMapper'
import {
  Planet,
  ZodiacSign,
  AspectType,
  AdditionalPointType,
} from '@/domain/chart/enums'

const mockChart: CaelusChart = {
  jdUt: 2460000.5,
  zodiac: 'tropical',
  houseSystem: 'placidus',
  bodies: {
    sun: {
      lon: 15.5,
      retrograde: false,
      sign: 'Aries',
      signDeg: 15.5,
      house: 1,
    },
    moon: {
      lon: 95.2,
      retrograde: false,
      sign: 'Cancer',
      signDeg: 5.2,
      house: 4,
    },
    mercury: {
      lon: 10.8,
      retrograde: false,
      sign: 'Aries',
      signDeg: 10.8,
      house: 1,
    },
    venus: {
      lon: 52.3,
      retrograde: false,
      sign: 'Taurus',
      signDeg: 22.3,
      house: 2,
    },
    mars: {
      lon: 68.1,
      retrograde: false,
      sign: 'Gemini',
      signDeg: 8.1,
      house: 3,
    },
    jupiter: {
      lon: 358.4,
      retrograde: true,
      sign: 'Pisces',
      signDeg: 28.4,
      house: 12,
    },
    saturn: {
      lon: 282.7,
      retrograde: false,
      sign: 'Capricorn',
      signDeg: 12.7,
      house: 10,
    },
    uranus: {
      lon: 303.9,
      retrograde: true,
      sign: 'Aquarius',
      signDeg: 3.9,
      house: 11,
    },
    neptune: {
      lon: 348.2,
      retrograde: false,
      sign: 'Pisces',
      signDeg: 18.2,
      house: 12,
    },
    pluto: {
      lon: 265.6,
      retrograde: true,
      sign: 'Sagittarius',
      signDeg: 25.6,
      house: 9,
    },
    chiron: {
      lon: 135.0,
      retrograde: false,
      sign: 'Leo',
      signDeg: 15.0,
      house: 5,
    },
    mean_node: {
      lon: 75.0,
      retrograde: true,
      sign: 'Gemini',
      signDeg: 15.0,
      house: 3,
    },
  },
  unavailable: [],
  angles: { asc: 185.4, mc: 95.8, vertex: 10.0, eastPoint: 20.0 },
  cusps: [
    185.4, 215.4, 245.4, 275.4, 305.4, 335.4, 5.4, 35.4, 65.4, 95.4, 125.4,
    155.4,
  ],
  aspects: [
    {
      a: 'sun',
      b: 'mercury',
      aspect: 'conjunction',
      orb: 4.7,
      phase: 'separating',
      strength: 0.8,
    },
    {
      a: 'sun',
      b: 'mars',
      aspect: 'sextile',
      orb: 2.6,
      phase: 'applying',
      strength: 0.6,
    },
    {
      a: 'moon',
      b: 'venus',
      aspect: 'trine',
      orb: 3.1,
      phase: 'separating',
      strength: 0.7,
    },
  ],
}

describe('CaelusChartMapper', () => {
  it('maps a complete chart to NatalChart with all components', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test-birth-123')

    expect(chart.birthDataId).toBe('test-birth-123')
    expect(chart.planets).toHaveLength(11) // 10 classical + Chiron
    expect(chart.houses).toHaveLength(12)
    expect(chart.aspects).toHaveLength(3)
    expect(chart.additionalPoints.length).toBeGreaterThan(0)
  })

  it('maps Sun position correctly', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    const sun = chart.planets.find((p) => p.planet === Planet.SUN)
    expect(sun).toBeDefined()
    expect(sun!.sign).toBe(ZodiacSign.ARIES)
    expect(sun!.degree).toBe(15)
    expect(sun!.minute).toBe(30)
    expect(sun!.house).toBe(1)
    expect(sun!.isRetrograde).toBe(false)
  })

  it('marks retrograde planets correctly', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    const jupiter = chart.planets.find((p) => p.planet === Planet.JUPITER)
    expect(jupiter).toBeDefined()
    expect(jupiter!.isRetrograde).toBe(true)

    const saturn = chart.planets.find((p) => p.planet === Planet.SATURN)
    expect(saturn).toBeDefined()
    expect(saturn!.isRetrograde).toBe(false)
  })

  it('maps Chiron as a planet', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    const chiron = chart.planets.find((p) => p.planet === Planet.CHIRON)
    expect(chiron).toBeDefined()
    expect(chiron!.sign).toBe(ZodiacSign.LEO)
    expect(chiron!.degree).toBe(15)
    expect(chiron!.house).toBe(5)
  })

  it('maps angles with descendant and IC from ASC and MC', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    expect(chart.angles.ascendant).toBe(185.4)
    expect(chart.angles.midheaven).toBe(95.8)
    expect(chart.angles.descendant).toBeCloseTo(5.4, 1)
    expect(chart.angles.immumCoeli).toBeCloseTo(275.8, 1)
  })

  it('maps house cusps correctly for all 12 houses', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    expect(chart.houses).toHaveLength(12)
    chart.houses.forEach((cusp, i) => {
      expect(cusp.house).toBe(i + 1)
      expect(cusp.degree).toBeGreaterThanOrEqual(0)
      expect(cusp.degree).toBeLessThan(30)
    })
  })

  it('maps aspects with correct types and planets', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    expect(chart.aspects).toHaveLength(3)

    const sunMercury = chart.aspects.find(
      (a) => a.planetA === Planet.SUN && a.planetB === Planet.MERCURY,
    )
    expect(sunMercury).toBeDefined()
    expect(sunMercury!.type).toBe(AspectType.CONJUNCTION)
    expect(sunMercury!.orb).toBeCloseTo(4.7)

    const sunMars = chart.aspects.find(
      (a) => a.planetA === Planet.SUN && a.planetB === Planet.MARS,
    )
    expect(sunMars).toBeDefined()
    expect(sunMars!.type).toBe(AspectType.SEXTILE)
    expect(sunMars!.isApplying).toBe(true)
  })

  it('maps North Node and South Node as additional points', () => {
    const chart = CaelusChartMapper.map(mockChart, 'test')
    const northNode = chart.additionalPoints.find(
      (ap) => ap.point === AdditionalPointType.NORTH_NODE,
    )
    const southNode = chart.additionalPoints.find(
      (ap) => ap.point === AdditionalPointType.SOUTH_NODE,
    )!
    expect(northNode).toBeDefined()
    expect(northNode!.sign).toBe(ZodiacSign.GEMINI)
    expect(northNode!.degree).toBe(15)
    expect(northNode!.house).toBe(3)
    expect(southNode).toBeDefined()
    // South Node is exactly 180° from North Node
    expect(southNode.sign).toBe(ZodiacSign.SAGITTARIUS)
  })

  it('should map Lilith from extra bodies', () => {
    const chart = { ...mockChart }
    chart.bodies['mean_lilith'] = {
      lon: 200,
      retrograde: false,
      sign: 'libra',
      signDeg: 20,
      house: 7,
    }
    const result = CaelusChartMapper.map(chart, 'test')
    const lilith = result.additionalPoints.find(
      (p) => p.point === AdditionalPointType.LILITH,
    )
    expect(lilith).toBeDefined()
    expect(lilith!.sign).toBe(ZodiacSign.LIBRA)
    expect(lilith!.degree).toBe(20)
    expect(lilith!.house).toBe(7)
  })

  it('should map Part of Fortune from Hermetic lots', () => {
    const chart = { ...mockChart }
    chart.lots = [
      { lot: 'fortune', lon: 45, sign: 'taurus', signDeg: 15, house: 2 },
    ]
    const result = CaelusChartMapper.map(chart, 'test')
    const fortune = result.additionalPoints.find(
      (p) => p.point === AdditionalPointType.PART_OF_FORTUNE,
    )
    expect(fortune).toBeDefined()
    expect(fortune!.sign).toBe(ZodiacSign.TAURUS)
    expect(fortune!.degree).toBe(15)
    expect(fortune!.house).toBe(2)
  })

  it('handles empty bodies gracefully', () => {
    const empty = {
      ...mockChart,
      bodies: {},
      aspects: [],
    }
    const chart = CaelusChartMapper.map(empty, 'test')
    expect(chart.planets).toHaveLength(0)
    expect(chart.aspects).toHaveLength(0)
  })

  it('handles missing nodes', () => {
    const noNodes = {
      ...mockChart,
      bodies: {
        sun: mockChart.bodies['sun'],
      },
    }
    const chart = CaelusChartMapper.map(noNodes, 'test')
    expect(chart.planets).toHaveLength(1)
    expect(chart.additionalPoints).toHaveLength(0)
  })
})
