import { ZodiacSign } from './enums'

export interface HouseCuspProps {
  house: number
  sign: ZodiacSign
  degree: number
}

export class HouseCusp {
  private readonly _house: number
  private readonly _sign: ZodiacSign
  private readonly _degree: number

  private constructor(props: HouseCuspProps) {
    this._house = props.house
    this._sign = props.sign
    this._degree = props.degree
  }

  /**
   * Creates a HouseCusp after validating all invariants.
   */
  static create(
    props: HouseCuspProps,
  ): { ok: true; value: HouseCusp } | { ok: false; error: string } {
    if (props.house < 1 || props.house > 12) {
      return { ok: false, error: 'La casa debe estar entre 1 y 12' }
    }

    if (props.degree < 0 || props.degree >= 30) {
      return { ok: false, error: 'El grado debe estar entre 0 y 30' }
    }

    return { ok: true, value: new HouseCusp(props) }
  }

  /**
   * Reconstruct a HouseCusp from persistence without validation.
   */
  static from(props: HouseCuspProps): HouseCusp {
    return new HouseCusp(props)
  }

  // ---- Getters ----

  get house(): number {
    return this._house
  }

  get sign(): ZodiacSign {
    return this._sign
  }

  get degree(): number {
    return this._degree
  }

  // ---- Methods ----

  equals(other: HouseCusp): boolean {
    return (
      this._house === other._house &&
      this._sign === other._sign &&
      this._degree === other._degree
    )
  }

  toString(): string {
    return `Casa ${this._house}: ${this._sign} ${this._degree}°`
  }

  toJSON(): Record<string, unknown> {
    return {
      house: this._house,
      sign: this._sign,
      degree: this._degree,
    }
  }
}
