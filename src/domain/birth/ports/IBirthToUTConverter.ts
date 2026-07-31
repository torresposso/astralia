/**
 * IBirthToUTConverter Port
 *
 * Domain port for converting BirthData (local time, timezone, lat/lon)
 * to Universal Time (UT) and Julian Day (jdUt).
 */

import type { BirthData } from '../BirthData.vo'

export interface UTConversionData {
  utc: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  }
  jdUt: number
  zone: string
  offsetMinutes: number
  dst: boolean
  status: 'ok' | 'ambiguous' | 'nonexistent'
}

export type UTConversionResult =
  { ok: true; data: UTConversionData } | { ok: false; error: string }

export interface IBirthToUTConverter {
  /**
   * Converts birth data (local time + timezone + coordinates) to UT and Julian Day.
   * When time is null or unknown, uses 12:00 noon local time default.
   */
  convert(birthData: BirthData): UTConversionResult
}
