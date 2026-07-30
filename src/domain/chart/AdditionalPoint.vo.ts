import { ZodiacSign, AdditionalPointType } from './enums'

export interface AdditionalPointProps {
  point: AdditionalPointType
  sign: ZodiacSign
  degree: number
  house: number
}

export class AdditionalPoint {
  private readonly _point: AdditionalPointType
  private readonly _sign: ZodiacSign
  private readonly _degree: number
  private readonly _house: number

  private constructor(props: AdditionalPointProps) {
    this._point = props.point
    this._sign = props.sign
    this._degree = props.degree
    this._house = props.house
  }

  /**
   * Creates an AdditionalPoint after validating all invariants.
   */
  static create(
    props: AdditionalPointProps,
  ): { ok: true; value: AdditionalPoint } | { ok: false; error: string } {
    if (props.degree < 0 || props.degree >= 30) {
      return { ok: false, error: 'El grado debe estar entre 0 y 30' }
    }

    if (props.house < 1 || props.house > 12) {
      return { ok: false, error: 'La casa debe estar entre 1 y 12' }
    }

    return { ok: true, value: new AdditionalPoint(props) }
  }

  /**
   * Reconstruct an AdditionalPoint from persistence without validation.
   */
  static from(props: AdditionalPointProps): AdditionalPoint {
    return new AdditionalPoint(props)
  }

  // ---- Getters ----

  get point(): AdditionalPointType {
    return this._point
  }

  get sign(): ZodiacSign {
    return this._sign
  }

  get degree(): number {
    return this._degree
  }

  get house(): number {
    return this._house
  }

  // ---- Methods ----

  equals(other: AdditionalPoint): boolean {
    return (
      this._point === other._point &&
      this._sign === other._sign &&
      this._degree === other._degree &&
      this._house === other._house
    )
  }

  toString(): string {
    return `${this._point} en ${this._sign} ${this._degree}° Casa ${this._house}`
  }

  toJSON(): Record<string, unknown> {
    return {
      point: this._point,
      sign: this._sign,
      degree: this._degree,
      house: this._house,
    }
  }
}
