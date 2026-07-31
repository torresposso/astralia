/**
 * Email Value Object
 *
 * An immutable email address with built-in validation.
 * Part of the Auth bounded context — domain layer.
 *
 * Following Matt's deep module principle:
 * - Small interface: constructor + getter + equals()
 * - Rich behaviour: validation, formatting, normalization
 */

export class Email {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  /**
   * Creates an Email after validating the address.
   * Returns the error message if invalid, or the Email value object if valid.
   * Using the "return error" pattern instead of throwing — more composable.
   */
  static create(
    value: string,
  ): { ok: true; value: Email } | { ok: false; error: string } {
    const trimmed = value.trim().toLowerCase()

    if (!trimmed) {
      return { ok: false, error: 'El correo electrónico es requerido' }
    }

    // Basic email regex — validates structure, not existence
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return {
        ok: false,
        error: 'El formato del correo electrónico no es válido',
      }
    }

    if (trimmed.length > 254) {
      return { ok: false, error: 'El correo electrónico es demasiado largo' }
    }

    return { ok: true, value: new Email(trimmed) }
  }

  /**
   * Reconstruct an Email from persistence without validation.
   * Only for use by infrastructure/repository layers when the value
   * has already been validated.
   */
  static from(validatedEmail: string): Email {
    return new Email(validatedEmail.toLowerCase().trim())
  }

  /** Returns the normalized email (lowercase, trimmed) */
  get value(): string {
    return this._value
  }

  /** Returns the domain part of the email (after @) */
  get domain(): string {
    return this._value.split('@')[1]
  }

  /** Returns the local part of the email (before @) */
  get localPart(): string {
    return this._value.split('@')[0]
  }

  /** Compares two Email value objects by their normalized value */
  equals(other: Email): boolean {
    return this._value === other._value
  }

  /** Returns the normalized email as a string */
  toString(): string {
    return this._value
  }
}
