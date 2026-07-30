import { Planet, AspectType } from './enums'

export interface AspectProps {
  planetA: Planet
  planetB: Planet
  type: AspectType
  orb: number
  isApplying: boolean
}

export class Aspect {
  private readonly _planetA: Planet
  private readonly _planetB: Planet
  private readonly _type: AspectType
  private readonly _orb: number
  private readonly _isApplying: boolean

  private constructor(props: AspectProps) {
    this._planetA = props.planetA
    this._planetB = props.planetB
    this._type = props.type
    this._orb = props.orb
    this._isApplying = props.isApplying
  }

  /**
   * Creates an Aspect after validating all invariants.
   */
  static create(
    props: AspectProps,
  ): { ok: true; value: Aspect } | { ok: false; error: string } {
    if (props.orb < 0) {
      return { ok: false, error: 'El orbe no puede ser negativo' }
    }

    return { ok: true, value: new Aspect(props) }
  }

  /**
   * Reconstruct an Aspect from persistence without validation.
   */
  static from(props: AspectProps): Aspect {
    return new Aspect(props)
  }

  // ---- Getters ----

  get planetA(): Planet {
    return this._planetA
  }

  get planetB(): Planet {
    return this._planetB
  }

  get type(): AspectType {
    return this._type
  }

  get orb(): number {
    return this._orb
  }

  get isApplying(): boolean {
    return this._isApplying
  }

  // ---- Methods ----

  equals(other: Aspect): boolean {
    return (
      this._planetA === other._planetA &&
      this._planetB === other._planetB &&
      this._type === other._type &&
      this._orb === other._orb &&
      this._isApplying === other._isApplying
    )
  }

  toString(): string {
    const dir = this._isApplying ? 'aplicativo' : 'separativo'
    return `${this._planetA} ${this._type} ${this._planetB} (orbe: ${this._orb}°, ${dir})`
  }

  toJSON(): Record<string, unknown> {
    return {
      planetA: this._planetA,
      planetB: this._planetB,
      type: this._type,
      orb: this._orb,
      isApplying: this._isApplying,
    }
  }
}
