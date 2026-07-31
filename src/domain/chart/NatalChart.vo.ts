import type { PlanetPosition } from './PlanetPosition.vo'
import type { Angles } from './Angles.vo'
import type { HouseCusp } from './HouseCusp.vo'
import type { Aspect } from './Aspect.vo'
import type { AdditionalPoint } from './AdditionalPoint.vo'
import type { HouseSystem, ZodiacType } from './enums'

export interface NatalChartProps {
  birthDataId: string
  calculatedAt: Date
  houseSystem: HouseSystem
  zodiac: ZodiacType
  planets: PlanetPosition[]
  angles: Angles
  houses: HouseCusp[]
  aspects: Aspect[]
  additionalPoints: AdditionalPoint[]
}

export class NatalChart {
  private readonly _birthDataId: string
  private readonly _calculatedAt: Date
  private readonly _houseSystem: HouseSystem
  private readonly _zodiac: ZodiacType
  private readonly _planets: PlanetPosition[]
  private readonly _angles: Angles
  private readonly _houses: HouseCusp[]
  private readonly _aspects: Aspect[]
  private readonly _additionalPoints: AdditionalPoint[]

  private constructor(props: NatalChartProps) {
    this._birthDataId = props.birthDataId
    this._calculatedAt = props.calculatedAt
    this._houseSystem = props.houseSystem
    this._zodiac = props.zodiac
    this._planets = props.planets
    this._angles = props.angles
    this._houses = props.houses
    this._aspects = props.aspects
    this._additionalPoints = props.additionalPoints
  }

  /**
   * Creates a NatalChart after validating all invariants.
   */
  static create(
    props: NatalChartProps,
  ): { ok: true; value: NatalChart } | { ok: false; error: string } {
    if (props.planets.length < 10) {
      return {
        ok: false,
        error: 'Se requieren al menos 10 posiciones planetarias',
      }
    }

    if (props.houses.length !== 12) {
      return { ok: false, error: 'Se requieren exactamente 12 casas' }
    }

    return { ok: true, value: new NatalChart(props) }
  }

  /**
   * Reconstruct a NatalChart from persistence without validation.
   */
  static from(props: NatalChartProps): NatalChart {
    return new NatalChart(props)
  }

  // ---- Getters ----

  get birthDataId(): string {
    return this._birthDataId
  }

  get calculatedAt(): Date {
    return new Date(this._calculatedAt.getTime())
  }

  get houseSystem(): HouseSystem {
    return this._houseSystem
  }

  get zodiac(): ZodiacType {
    return this._zodiac
  }

  get planets(): PlanetPosition[] {
    return [...this._planets]
  }

  get angles(): Angles {
    return this._angles
  }

  get houses(): HouseCusp[] {
    return [...this._houses]
  }

  get aspects(): Aspect[] {
    return [...this._aspects]
  }

  get additionalPoints(): AdditionalPoint[] {
    return [...this._additionalPoints]
  }

  // ---- Methods ----

  toJSON(): Record<string, unknown> {
    return {
      birthDataId: this._birthDataId,
      calculatedAt: this._calculatedAt.toISOString(),
      houseSystem: this._houseSystem,
      zodiac: this._zodiac,
      planets: this._planets.map((p) => p.toJSON()),
      angles: this._angles.toJSON(),
      houses: this._houses.map((h) => h.toJSON()),
      aspects: this._aspects.map((a) => a.toJSON()),
      additionalPoints: this._additionalPoints.map((ap) => ap.toJSON()),
    }
  }

  equals(other: NatalChart): boolean {
    return (
      this.birthDataId === other.birthDataId &&
      this.houseSystem === other.houseSystem &&
      this.zodiac === other.zodiac &&
      this.calculatedAt.getTime() === other.calculatedAt.getTime() &&
      this.planets.length === other.planets.length &&
      this.angles.equals(other.angles) &&
      this.houses.length === other.houses.length &&
      this.aspects.length === other.aspects.length &&
      this.additionalPoints.length === other.additionalPoints.length
    )
  }

  toString(): string {
    return `NatalChart(birthDataId=${this.birthDataId}, planets=${this.planets.length}, aspects=${this.aspects.length})`
  }
}
