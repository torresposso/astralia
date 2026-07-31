/**
 * CaelusBirthConverter
 *
 * Infrastructure implementation of IBirthToUTConverter.
 * Uses `caelus-birth` (toUT) to convert local birth date/time/timezone/coordinates
 * into Universal Time (UT) and Julian Day (jdUt).
 */

import { toUT } from 'caelus-birth'
import type { BirthData } from '@/domain/birth/BirthData.vo'
import type {
  IBirthToUTConverter,
  UTConversionResult,
} from '@/domain/birth/ports/IBirthToUTConverter'

export class CaelusBirthConverter implements IBirthToUTConverter {
  convert(birthData: BirthData): UTConversionResult {
    try {
      const date = birthData.date
      const time = birthData.time

      // When time is null or unknown, use 12:00 noon default per acceptance criteria
      const hour = time ? time.hour : 12
      const minute = time ? time.minute : 0

      const result = toUT({
        year: date.year,
        month: date.month,
        day: date.day,
        hour,
        minute,
        lat: birthData.latitude,
        lon: birthData.longitude,
        zone: birthData.timezone,
      })

      return {
        ok: true,
        data: {
          utc: result.utc,
          jdUt: result.jdUt,
          zone: result.zone,
          offsetMinutes: result.offsetMinutes,
          dst: result.dst,
          status: result.status as 'ok' | 'ambiguous' | 'nonexistent',
        },
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al convertir hora local a UT'
      return { ok: false, error: message }
    }
  }
}
