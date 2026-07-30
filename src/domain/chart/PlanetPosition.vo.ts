import { Planet, ZodiacSign } from './enums'

export interface PlanetPositionProps {
  planet: Planet
  sign: ZodiacSign
  degree: number
  minute: number
  house: number
  isRetrograde: boolean
}

export class PlanetPosition {
  private readonly _planet: Planet
  private readonly _sign: ZodiacSign
  private readonly _degree: number
  private readonly _minute: number
  private readonly _house: number
  private readonly _isRetrograde: boolean

  private constructor(props: PlanetPositionProps) {
    this._planet = props.planet
    this._sign = props.sign
    this._degree = props.degree
    this._minute = props.minute
    this._house = props.house
    this._isRetrograde = props.isRetrograde
  }

  /**
   * Creates a PlanetPosition after validating all invariants.
   */
  static create(
    props: PlanetPositionProps,
  ): { ok: true; value: PlanetPosition } | { ok: false; error: string } {
    if (props.degree < 0 || props.degree >= 30) {
      return { ok: false, error: 'El grado debe estar entre 0 y 30' }
    }

    if (props.minute < 0 || props.minute >= 60) {
      return { ok: false, error: 'El minuto debe estar entre 0 y 59' }
    }

    if (props.house < 1 || props.house > 12) {
      return { ok: false, error: 'La casa debe estar entre 1 y 12' }
    }

    return { ok: true, value: new PlanetPosition(props) }
  }

  /**
   * Reconstruct a PlanetPosition from persistence without validation.
   */
  static from(props: PlanetPositionProps): PlanetPosition {
    return new PlanetPosition(props)
  }

  // ---- Getters ----

  get planet(): Planet {
    return this._planet
  }

  get sign(): ZodiacSign {
    return this._sign
  }

  get degree(): number {
    return this._degree
  }

  get minute(): number {
    return this._minute
  }

  get house(): number {
    return this._house
  }

  get isRetrograde(): boolean {
    return this._isRetrograde
  }

  // ---- Methods ----

  equals(other: PlanetPosition): boolean {
    return (
      this._planet === other._planet &&
      this._sign === other._sign &&
      this._degree === other._degree &&
      this._minute === other._minute &&
      this._house === other._house &&
      this._isRetrograde === other._isRetrograde
    )
  }

  toString(): string {
    const retro = this._isRetrograde ? ' Rx' : ''
    return `${this._planet} en ${this._sign} ${this._degree}°${this._minute}' Casa ${this._house}${retro}`
  }

  toJSON(): Record<string, unknown> {
    return {
      planet: this._planet,
      sign: this._sign,
      degree: this._degree,
      minute: this._minute,
      house: this._house,
      isRetrograde: this._isRetrograde,
    }
  }
}
