import { Planet, ZodiacSign, AspectType, HouseSystem, ZodiacType, AdditionalPointType } from '@/domain/chart/enums'
import { PlanetPosition } from '@/domain/chart/PlanetPosition.vo'
import { Angles } from '@/domain/chart/Angles.vo'
import { HouseCusp } from '@/domain/chart/HouseCusp.vo'
import { Aspect } from '@/domain/chart/Aspect.vo'
import { AdditionalPoint } from '@/domain/chart/AdditionalPoint.vo'
import { NatalChart } from '@/domain/chart/NatalChart.vo'
import type { NatalChart as NatalChartType } from '@/domain/chart/NatalChart.vo'
import type { PlanetPosition as PlanetPositionType } from '@/domain/chart/PlanetPosition.vo'
import type { Angles as AnglesType } from '@/domain/chart/Angles.vo'
import type { HouseCusp as HouseCuspType } from '@/domain/chart/HouseCusp.vo'
import type { Aspect as AspectVo } from '@/domain/chart/Aspect.vo'
import type { AdditionalPoint as AdditionalPointVo } from '@/domain/chart/AdditionalPoint.vo'

// Caelus chart shape — matches caelus v0.23.0 API
interface CaelusChartBody {
  lon: number
  retrograde: boolean
  sign: string
  signDeg: number
  house: number
}

interface CaelusAspect {
  a: string
  b: string
  aspect: string
  orb: number
  phase: string
}

interface CaelusLot {
  lot: string
  lon: number
  sign: string
  signDeg: number
  house: number
}

interface CaelusChart {
  jdUt: number
  zodiac: string
  houseSystem: string
  bodies: Record<string, CaelusChartBody>
  unavailable: string[]
  angles: { asc: number; mc: number; vertex: number; eastPoint: number }
  cusps: number[]
  aspects: CaelusAspect[]
  lots?: CaelusLot[]
}

const PLANET_MAP: Record<string, Planet> = {
  sun: Planet.SUN,
  moon: Planet.MOON,
  mercury: Planet.MERCURY,
  venus: Planet.VENUS,
  mars: Planet.MARS,
  jupiter: Planet.JUPITER,
  saturn: Planet.SATURN,
  uranus: Planet.URANUS,
  neptune: Planet.NEPTUNE,
  pluto: Planet.PLUTO,
  chiron: Planet.CHIRON,
}

const SIGN_MAP: Record<string, ZodiacSign> = {
  aries: ZodiacSign.ARIES,
  taurus: ZodiacSign.TAURUS,
  gemini: ZodiacSign.GEMINI,
  cancer: ZodiacSign.CANCER,
  leo: ZodiacSign.LEO,
  virgo: ZodiacSign.VIRGO,
  libra: ZodiacSign.LIBRA,
  scorpio: ZodiacSign.SCORPIO,
  sagittarius: ZodiacSign.SAGITTARIUS,
  capricorn: ZodiacSign.CAPRICORN,
  aquarius: ZodiacSign.AQUARIUS,
  pisces: ZodiacSign.PISCES,
}

const ASPECT_MAP: Record<string, import('@/domain/chart/enums').AspectType> = {
  conjunction: AspectType.CONJUNCTION,
  sextile: AspectType.SEXTILE,
  square: AspectType.SQUARE,
  trine: AspectType.TRINE,
  opposition: AspectType.OPPOSITION,
}

const SIGN_LIST = Object.values(ZodiacSign)

export class CaelusChartMapper {
  static map(caelusChart: CaelusChart, birthDataId: string): NatalChartType {
    const planets = CaelusChartMapper.mapPlanets(caelusChart.bodies)
    const angles = CaelusChartMapper.mapAngles(caelusChart.angles)
    const houses = CaelusChartMapper.mapHouses(caelusChart.cusps)
    const aspects = CaelusChartMapper.mapAspects(caelusChart.aspects)
    const additionalPoints = CaelusChartMapper.mapAdditionalPoints(caelusChart.bodies, caelusChart.lots)

    return NatalChart.from({
      birthDataId,
      calculatedAt: new Date(),
      houseSystem: HouseSystem.PLACIDUS,
      zodiac: ZodiacType.TROPICAL,
      planets,
      angles,
      houses,
      aspects,
      additionalPoints,
    })
  }

  private static mapPlanets(bodies: Record<string, CaelusChartBody>): PlanetPositionType[] {
    const result: PlanetPositionType[] = []

    for (const [key, body] of Object.entries(bodies)) {
      if (key === 'mean_node' || key === 'true_node') continue

      const planet = PLANET_MAP[key]
      if (!planet) continue

      const sign = CaelusChartMapper.mapSign(body.sign)
      if (!sign) continue

      const degree = Math.floor(body.signDeg)
      const minute = Math.round((body.signDeg - degree) * 60) % 60

      result.push(
        PlanetPosition.from({
          planet,
          sign,
          degree,
          minute,
          house: body.house,
          isRetrograde: body.retrograde,
        }),
      )
    }

    return result
  }

  private static mapSign(sign: string): ZodiacSign | null {
    return SIGN_MAP[sign.toLowerCase()] ?? null
  }

  private static mapAngles(angles: { asc: number; mc: number }): AnglesType {
    return Angles.from({
      ascendant: angles.asc,
      midheaven: angles.mc,
      descendant: (angles.asc + 180) % 360,
      immumCoeli: (angles.mc + 180) % 360,
    })
  }

  private static mapHouses(cusps: number[]): HouseCuspType[] {
    return cusps.slice(0, 12).map((degree, i) => {
      const signIndex = Math.floor(degree / 30) % 12
      return HouseCusp.from({
        house: i + 1,
        sign: SIGN_LIST[signIndex],
        degree: degree % 30,
      })
    })
  }

  private static mapAspects(caelusAspects: CaelusAspect[]): AspectVo[] {
    return caelusAspects
      .filter(a => {
        if (a.a === 'mean_node' || a.a === 'true_node' || a.b === 'mean_node' || a.b === 'true_node') return false
        return PLANET_MAP[a.a] !== undefined && PLANET_MAP[a.b] !== undefined && ASPECT_MAP[a.aspect] !== undefined
      })
      .map(a => {
        return Aspect.from({
          planetA: PLANET_MAP[a.a]!,
          planetB: PLANET_MAP[a.b]!,
          type: ASPECT_MAP[a.aspect]!,
          orb: a.orb,
          isApplying: a.phase === 'applying' || a.phase === 'exact',
        })
      })
  }

  private static mapAdditionalPoints(
    bodies: Record<string, CaelusChartBody>,
    lots?: CaelusLot[],
  ): AdditionalPointVo[] {
    const points: AdditionalPointVo[] = []

    // Map mean_node → NORTH_NODE
    const meanNode = bodies['mean_node']
    if (meanNode) {
      points.push(
        AdditionalPoint.from({
          point: AdditionalPointType.NORTH_NODE,
          sign: this.lonToSign(meanNode.lon),
          degree: Math.floor(meanNode.signDeg),
          house: meanNode.house,
        }),
      )
    }

    // Map true_node → NORTH_NODE (prefer true_node over mean_node if available)
    const trueNode = bodies['true_node']
    if (trueNode) {
      const idx = points.findIndex(
        (p) => p.point === AdditionalPointType.NORTH_NODE,
      )
      const north = AdditionalPoint.from({
        point: AdditionalPointType.NORTH_NODE,
        sign: this.lonToSign(trueNode.lon),
        degree: Math.floor(trueNode.signDeg),
        house: trueNode.house,
      })
      if (idx >= 0) {
        points[idx] = north
      } else {
        points.push(north)
      }
    }

    // Map SOUTH_NODE = NORTH_NODE + 180°
    const northNode = points.find((p) => p.point === AdditionalPointType.NORTH_NODE)
    if (northNode) {
      const southLon = this.signToLon(northNode.sign) + northNode.degree + 180
      points.push(
        AdditionalPoint.from({
          point: AdditionalPointType.SOUTH_NODE,
          sign: this.lonToSign(southLon),
          degree: Math.floor(southLon % 30),
          house: northNode.house,
        }),
      )
    }

    // Map mean_lilith → LILITH
    const meanLilith = bodies['mean_lilith']
    if (meanLilith) {
      points.push(
        AdditionalPoint.from({
          point: AdditionalPointType.LILITH,
          sign: this.lonToSign(meanLilith.lon),
          degree: Math.floor(meanLilith.signDeg),
          house: meanLilith.house,
        }),
      )
    }

    // Map true_lilith → LILITH (prefer true_lilith over mean_lilith)
    const trueLilith = bodies['true_lilith']
    if (trueLilith) {
      const lilithIdx = points.findIndex(
        (p) => p.point === AdditionalPointType.LILITH,
      )
      const lilith = AdditionalPoint.from({
        point: AdditionalPointType.LILITH,
        sign: this.lonToSign(trueLilith.lon),
        degree: Math.floor(trueLilith.signDeg),
        house: trueLilith.house,
      })
      if (lilithIdx >= 0) {
        points[lilithIdx] = lilith
      } else {
        points.push(lilith)
      }
    }

    // Map fortune lot → PART_OF_FORTUNE
    if (lots) {
      const fortune = lots.find((l) => l.lot === 'fortune')
      if (fortune) {
        points.push(
          AdditionalPoint.from({
            point: AdditionalPointType.PART_OF_FORTUNE,
            sign: this.lonToSign(fortune.lon),
            degree: Math.floor(fortune.signDeg),
            house: fortune.house,
          }),
        )
      }
    }

    return points
  }

  private static lonToSign(lon: number): ZodiacSign {
    const index = Math.floor((((lon % 360) + 360) % 360) / 30)
    return SIGN_LIST[index]
  }

  private static signToLon(sign: ZodiacSign): number {
    const index = SIGN_LIST.indexOf(sign)
    return index * 30
  }
}
