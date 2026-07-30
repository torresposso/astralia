/**
 * Mock Birth To UT Converter
 *
 * Shared mock for IBirthToUTConverter used in Application use case tests.
 */

import { vi } from 'vitest'
import type { IBirthToUTConverter, UTConversionResult } from '@/domain/birth/ports/IBirthToUTConverter'
import type { BirthData } from '@/domain/birth/BirthData.vo'

export class MockBirthToUTConverter implements IBirthToUTConverter {
  private shouldFail = false
  private failMessage = 'La fecha u hora de nacimiento no se puede convertir a Tiempo Universal (UT)'

  readonly convertSpy = vi.fn<IBirthToUTConverter['convert']>()

  constructor() {
    this.setupDefaultBehavior()
  }

  convert(birthData: BirthData): UTConversionResult {
    return this.convertSpy(birthData)
  }

  withFailure(message?: string): this {
    this.shouldFail = true
    if (message) this.failMessage = message
    return this
  }

  reset(): this {
    this.shouldFail = false
    this.failMessage = 'La fecha u hora de nacimiento no se puede convertir a Tiempo Universal (UT)'
    this.convertSpy.mockReset()
    this.setupDefaultBehavior()
    return this
  }

  private setupDefaultBehavior(): void {
    this.convertSpy.mockImplementation((birthData: BirthData) => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      return {
        ok: true,
        data: {
          utc: {
            year: birthData.date.year,
            month: birthData.date.month,
            day: birthData.date.day,
            hour: birthData.time?.hour ?? 12,
            minute: birthData.time?.minute ?? 0,
            second: 0,
          },
          jdUt: 2450000.5,
          zone: birthData.timezone,
          offsetMinutes: -300,
          dst: false,
          status: 'ok',
        },
      }
    })
  }
}
