/**
 * Create Birth Data Use Case
 *
 * Orchestrates the birth data creation flow:
 * 1. Validates all birth data invariants via BirthData value object
 * 2. Validates Universal Time (UT) conversion via IBirthToUTConverter
 * 3. Persists via the repository
 * 4. Returns a warning when time is unknown
 *
 * Following Clean Architecture:
 * - Depends only on domain interfaces (IBirthDataRepository, IBirthToUTConverter, BirthData)
 * - No framework dependencies
 * - Testable by passing mock dependencies
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'
import type { IBirthToUTConverter } from '@/domain/birth/ports/IBirthToUTConverter'
import { BirthData } from '@/domain/birth/BirthData.vo'

export type CreateBirthDataInput = {
  userId: string
  date: { year: number; month: number; day: number }
  time?: { hour: number; minute: number } | null
  timeUnknown?: boolean
  latitude: number
  longitude: number
  timezone: string
  placeName: string
}

export type CreateBirthDataOutput =
  | { ok: true; data: BirthData; warning?: string }
  | { ok: false; error: string }

export class CreateBirthDataUseCase {
  constructor(
    private readonly repository: IBirthDataRepository,
    private readonly utConverter: IBirthToUTConverter,
  ) {}

  async execute(input: CreateBirthDataInput): Promise<CreateBirthDataOutput> {
    // 1. Create BirthData VO (validates invariants)
    const birthDataResult = BirthData.create({
      userId: input.userId,
      date: input.date,
      time: input.time ?? null,
      timeUnknown: input.timeUnknown ?? false,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      placeName: input.placeName,
    })

    if (!birthDataResult.ok) {
      return { ok: false, error: birthDataResult.error }
    }

    const birthData = birthDataResult.value

    // 2. Validate Universal Time (UT) conversion
    const utResult = this.utConverter.convert(birthData)
    if (!utResult.ok) {
      return { ok: false, error: utResult.error }
    }

    // 3. Save to repository
    const saveResult = await this.repository.create(birthData)
    if (!saveResult.ok) {
      return { ok: false, error: saveResult.error }
    }

    // 4. Return with warning if time is unknown
    const output: CreateBirthDataOutput = { ok: true, data: saveResult.data }
    if (!saveResult.data.hasTime()) {
      output.warning =
        'No registraste la hora de nacimiento. Los cálculos de casas usarán el sistema Whole Sign y serán aproximados.'
    }

    return output
  }
}
