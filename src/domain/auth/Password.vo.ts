/**
 * Password Value Object
 *
 * An immutable password with built-in strength policy.
 * Part of the Auth bounded context — domain layer.
 *
 * Following Matt's deep module principle:
 * - Encapsulates password strength rules in one place
 * - The policy (minimum length) is a domain invariant
 */

export class Password {
  /** Minimum password length enforced by the domain */
  static readonly MIN_LENGTH = 8

  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  /**
   * Creates a Password after validating strength requirements.
   * Returns error message if too short, or the Password value object.
   */
  static create(value: string): { ok: true; value: Password } | { ok: false; error: string } {
    if (!value) {
      return { ok: false, error: 'La contraseña es requerida' }
    }

    if (value.length < Password.MIN_LENGTH) {
      return {
        ok: false,
        error: `La contraseña debe tener al menos ${Password.MIN_LENGTH} caracteres`,
      }
    }

    return { ok: true, value: new Password(value) }
  }

  /**
   * Reconstruct a Password from persistence.
   * The persisted value is already hashed, so we skip validation.
   */
  static fromHashed(hashedValue: string): Password {
    return new Password(hashedValue)
  }

  /** Returns the raw password value (only available before hashing) */
  get value(): string {
    return this._value
  }

  /** Returns true if this password matches another (for confirmation check) */
  matches(confirmation: string): boolean {
    return this._value === confirmation
  }

  /** Returns a mask for display purposes (never show the actual password) */
  get mask(): string {
    return '•'.repeat(Math.min(this._value.length, 12))
  }

  toString(): string {
    return this.mask
  }
}
