/**
 * BirthData Value Object
 *
 * An immutable representation of birth data (date, time, place).
 * Part of the Birth Data bounded context — domain layer.
 *
 * Follows the same pattern as Email.vo.ts:
 * - Private constructor
 * - static create(props) with Result return
 * - static from(props) for reconstruction (no validation)
 * - Readonly properties, getters
 * - equals(), toString(), toJSON()
 *
 * INVARIANT: longitude is EAST positive (Caelus-native).
 *            Cartagena = -75.5, not 75.5 West.
 */

export interface BirthDataProps {
  id?: string
  userId: string
  date: { year: number; month: number; day: number }
  time?: { hour: number; minute: number } | null
  timeUnknown: boolean
  latitude: number
  longitude: number
  timezone: string
  placeName: string
}

export class BirthData {
  private readonly _id?: string
  private readonly _userId: string
  private readonly _date: { year: number; month: number; day: number }
  private readonly _time: { hour: number; minute: number } | null
  private readonly _timeUnknown: boolean
  private readonly _latitude: number
  private readonly _longitude: number
  private readonly _timezone: string
  private readonly _placeName: string

  private constructor(props: BirthDataProps) {
    this._id = props.id
    this._userId = props.userId
    this._date = props.date
    this._time = props.time ?? null
    this._timeUnknown = props.timeUnknown
    this._latitude = props.latitude
    this._longitude = props.longitude
    this._timezone = props.timezone
    this._placeName = props.placeName
  }

  /**
   * Computes a numeric value from a date for easy comparison.
   * Format: YYYYMMDD (e.g. 19900610 for 1990-06-10).
   */
  private static dateToValue(d: { year: number; month: number; day: number }): number {
    return d.year * 10000 + d.month * 100 + d.day
  }

  /**
   * Creates a BirthData after validating all invariants.
   * Returns the error message if invalid, or the BirthData value object if valid.
   */
  static create(props: BirthDataProps): { ok: true; value: BirthData } | { ok: false; error: string } {
    // 1. Validate userId
    if (!props.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    // 2. Validate date range: 1800-01-01 ≤ date ≤ today
    const minDate = { year: 1800, month: 1, day: 1 }
    const today = new Date()
    const maxDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }

    const dateValue = BirthData.dateToValue(props.date)
    if (dateValue < BirthData.dateToValue(minDate) || dateValue > BirthData.dateToValue(maxDate)) {
      return { ok: false, error: 'La fecha debe estar entre el 1 de enero de 1800 y hoy' }
    }

    // 3. Validate time
    if (props.time === null || props.time === undefined) {
      if (!props.timeUnknown) {
        return { ok: false, error: 'La hora es requerida' }
      }
    } else {
      if (props.time.hour < 0 || props.time.hour > 23) {
        return { ok: false, error: 'La hora debe estar entre 0 y 23' }
      }
      if (props.time.minute < 0 || props.time.minute > 59) {
        return { ok: false, error: 'El minuto debe estar entre 0 y 59' }
      }
    }

    // 4. Validate latitude
    if (props.latitude < -90 || props.latitude > 90) {
      return { ok: false, error: 'La latitud debe estar entre -90 y 90' }
    }

    // 5. Validate longitude (EAST positive)
    if (props.longitude < -180 || props.longitude > 180) {
      return { ok: false, error: 'La longitud debe estar entre -180 y 180' }
    }

    // 6. Validate timezone
    if (!props.timezone.trim()) {
      return { ok: false, error: 'La zona horaria no es válida' }
    }
    const validTimeZones = Intl.supportedValuesOf('timeZone')
    if (!validTimeZones.includes(props.timezone)) {
      return { ok: false, error: 'La zona horaria no es válida' }
    }

    // 7. Validate placeName
    if (!props.placeName.trim()) {
      return { ok: false, error: 'El lugar debe tener entre 1 y 200 caracteres' }
    }
    if (props.placeName.length > 200) {
      return { ok: false, error: 'El lugar debe tener entre 1 y 200 caracteres' }
    }

    return { ok: true, value: new BirthData(props) }
  }

  /**
   * Reconstruct a BirthData from persistence without validation.
   * Only for use by infrastructure/repository layers when the data
   * has already been validated.
   */
  static from(props: BirthDataProps): BirthData {
    return new BirthData(props)
  }

  // ---- Getters ----

  get id(): string | undefined {
    return this._id
  }

  get userId(): string {
    return this._userId
  }

  get date(): { year: number; month: number; day: number } {
    return { ...this._date }
  }

  get time(): { hour: number; minute: number } | null {
    return this._time ? { ...this._time } : null
  }

  get timeUnknown(): boolean {
    if (this._time === null) return true
    return this._timeUnknown
  }

  get latitude(): number {
    return this._latitude
  }

  get longitude(): number {
    return this._longitude
  }

  get timezone(): string {
    return this._timezone
  }

  get placeName(): string {
    return this._placeName
  }

  // ---- Methods ----

  /** Returns true if this birth data includes a time component */
  hasTime(): boolean {
    return this._time !== null
  }

  /** Compares two BirthData value objects by all properties */
  equals(other: BirthData): boolean {
    return (
      this._id === other._id &&
      this._userId === other._userId &&
      this._date.year === other._date.year &&
      this._date.month === other._date.month &&
      this._date.day === other._date.day &&
      (this._time?.hour ?? null) === (other._time?.hour ?? null) &&
      (this._time?.minute ?? null) === (other._time?.minute ?? null) &&
      this._latitude === other._latitude &&
      this._longitude === other._longitude &&
      this._timezone === other._timezone &&
      this._placeName === other._placeName
    )
  }

  /** Returns a human-readable string representation */
  toString(): string {
    const dateStr = `${this._date.year}-${String(this._date.month).padStart(2, '0')}-${String(this._date.day).padStart(2, '0')}`
    const timeStr = this._time
      ? `${String(this._time.hour).padStart(2, '0')}:${String(this._time.minute).padStart(2, '0')}`
      : 'hora desconocida'
    return `${dateStr} ${timeStr} ${this._timezone} — ${this._placeName}`
  }

  /** Returns a plain object representation for serialization */
  toJSON(): Record<string, unknown> {
    return {
      ...(this._id ? { id: this._id } : {}),
      userId: this._userId,
      date: { ...this._date },
      time: this._time ? { ...this._time } : null,
      timeUnknown: this.timeUnknown,
      latitude: this._latitude,
      longitude: this._longitude,
      timezone: this._timezone,
      placeName: this._placeName,
    }
  }
}
