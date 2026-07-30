export interface AnglesProps {
  ascendant: number
  midheaven: number
  descendant: number
  immumCoeli: number
}

export class Angles {
  private readonly _ascendant: number
  private readonly _midheaven: number
  private readonly _descendant: number
  private readonly _immumCoeli: number

  private constructor(props: AnglesProps) {
    this._ascendant = props.ascendant
    this._midheaven = props.midheaven
    this._descendant = props.descendant
    this._immumCoeli = props.immumCoeli
  }

  /**
   * Creates an Angles value object after validating all invariants.
   */
  static create(
    props: AnglesProps,
  ): { ok: true; value: Angles } | { ok: false; error: string } {
    if (props.ascendant < 0 || props.ascendant >= 360) {
      return { ok: false, error: 'El ascendente debe estar entre 0 y 360' }
    }

    if (props.midheaven < 0 || props.midheaven >= 360) {
      return { ok: false, error: 'El Medio Cielo debe estar entre 0 y 360' }
    }

    if (props.descendant < 0 || props.descendant >= 360) {
      return { ok: false, error: 'El descendente debe estar entre 0 y 360' }
    }

    if (props.immumCoeli < 0 || props.immumCoeli >= 360) {
      return { ok: false, error: 'El Immum Coeli debe estar entre 0 y 360' }
    }

    return { ok: true, value: new Angles(props) }
  }

  /**
   * Reconstruct Angles from persistence without validation.
   */
  static from(props: AnglesProps): Angles {
    return new Angles(props)
  }

  // ---- Getters ----

  get ascendant(): number {
    return this._ascendant
  }

  get midheaven(): number {
    return this._midheaven
  }

  get descendant(): number {
    return this._descendant
  }

  get immumCoeli(): number {
    return this._immumCoeli
  }

  // ---- Methods ----

  equals(other: Angles): boolean {
    return (
      this._ascendant === other._ascendant &&
      this._midheaven === other._midheaven &&
      this._descendant === other._descendant &&
      this._immumCoeli === other._immumCoeli
    )
  }

  toString(): string {
    return `ASC ${this._ascendant.toFixed(1)}° MC ${this._midheaven.toFixed(1)}° DESC ${this._descendant.toFixed(1)}° IC ${this._immumCoeli.toFixed(1)}°`
  }

  toJSON(): Record<string, unknown> {
    return {
      ascendant: this._ascendant,
      midheaven: this._midheaven,
      descendant: this._descendant,
      immumCoeli: this._immumCoeli,
    }
  }
}
