import type {
  IChartCalculator,
  ChartCalculationResult,
} from '../ports/IChartCalculator'
import type { BirthData } from '@/domain/birth/BirthData.vo'
import { NatalChart } from '../NatalChart.vo'
import { PlanetPosition } from '../PlanetPosition.vo'
import { Angles } from '../Angles.vo'
import { HouseCusp } from '../HouseCusp.vo'
import { Aspect } from '../Aspect.vo'
import { AdditionalPoint } from '../AdditionalPoint.vo'
import {
  Planet,
  ZodiacSign,
  AspectType,
  HouseSystem,
  ZodiacType,
  AdditionalPointType,
} from '../enums'

export class MockChartCalculator implements IChartCalculator {
  calculate(birthData: BirthData): ChartCalculationResult {
    const planets = [
      PlanetPosition.from({
        planet: Planet.SUN,
        sign: ZodiacSign.ARIES,
        degree: 15,
        minute: 30,
        house: 1,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.MOON,
        sign: ZodiacSign.CANCER,
        degree: 5,
        minute: 12,
        house: 4,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.MERCURY,
        sign: ZodiacSign.ARIES,
        degree: 10,
        minute: 48,
        house: 1,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.VENUS,
        sign: ZodiacSign.TAURUS,
        degree: 22,
        minute: 18,
        house: 2,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.MARS,
        sign: ZodiacSign.GEMINI,
        degree: 8,
        minute: 6,
        house: 3,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.JUPITER,
        sign: ZodiacSign.PISCES,
        degree: 28,
        minute: 24,
        house: 12,
        isRetrograde: true,
      }),
      PlanetPosition.from({
        planet: Planet.SATURN,
        sign: ZodiacSign.CAPRICORN,
        degree: 12,
        minute: 42,
        house: 10,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.URANUS,
        sign: ZodiacSign.AQUARIUS,
        degree: 3,
        minute: 54,
        house: 11,
        isRetrograde: true,
      }),
      PlanetPosition.from({
        planet: Planet.NEPTUNE,
        sign: ZodiacSign.PISCES,
        degree: 18,
        minute: 12,
        house: 12,
        isRetrograde: false,
      }),
      PlanetPosition.from({
        planet: Planet.PLUTO,
        sign: ZodiacSign.SAGITTARIUS,
        degree: 25,
        minute: 36,
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
      Aspect.from({
        planetA: Planet.SUN,
        planetB: Planet.MARS,
        type: AspectType.SEXTILE,
        orb: 2.6,
        isApplying: true,
      }),
      Aspect.from({
        planetA: Planet.MOON,
        planetB: Planet.VENUS,
        type: AspectType.TRINE,
        orb: 3.1,
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
      AdditionalPoint.from({
        point: AdditionalPointType.SOUTH_NODE,
        sign: ZodiacSign.SAGITTARIUS,
        degree: 15.0,
        house: 9,
      }),
      AdditionalPoint.from({
        point: AdditionalPointType.PART_OF_FORTUNE,
        sign: ZodiacSign.LEO,
        degree: 7.5,
        house: 5,
      }),
      AdditionalPoint.from({
        point: AdditionalPointType.LILITH,
        sign: ZodiacSign.VIRGO,
        degree: 22.8,
        house: 6,
      }),
    ]

    const chart = NatalChart.from({
      birthDataId: birthData.id ?? 'mock',
      calculatedAt: new Date(),
      houseSystem: HouseSystem.PLACIDUS,
      zodiac: ZodiacType.TROPICAL,
      planets,
      angles,
      houses,
      aspects,
      additionalPoints,
    })

    return { ok: true, data: chart }
  }
}
