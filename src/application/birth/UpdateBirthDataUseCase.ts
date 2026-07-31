/**
 * Update Birth Data Use Case
 *
 * Modifies an existing birth data record after validating invariants, UT conversion, and ownership.
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'
import type { IBirthToUTConverter } from '@/domain/birth/ports/IBirthToUTConverter'
import { BirthData } from '@/domain/birth/BirthData.vo'

export type UpdateBirthDataInput = {
  id: string
  userId: string
  date: { year: number; month: number; day: number }
  time?: { hour: number; minute: number } | null
  timeUnknown?: boolean
  latitude: number
  longitude: number
  timezone: string
  placeName: string
}

export type UpdateBirthDataOutput =
  { ok: true; data: BirthData; warning?: string } | { ok: false; error: string }

export class UpdateBirthDataUseCase {
  constructor(
    private readonly repository: IBirthDataRepository,
    private readonly utConverter: IBirthToUTConverter,
  ) {}

  async execute(input: UpdateBirthDataInput): Promise<UpdateBirthDataOutput> {
    if (!input.id.trim()) {
      return { ok: false, error: 'El identificador es requerido' }
    }

    // 1. Verify existence and ownership
    const existing = await this.repository.findById(input.id)
    if (!existing || existing.userId !== input.userId) {
      return { ok: false, error: 'Datos de nacimiento no encontrados' }
    }

    // 2. Create updated BirthData VO (validates invariants)
    const birthDataResult = BirthData.create({
      id: input.id,
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

    // 3. Validate Universal Time (UT) conversion
    const utResult = this.utConverter.convert(birthData)
    if (!utResult.ok) {
      return { ok: false, error: utResult.error }
    }

    // 4. Persist update
    const updateResult = await this.repository.update(input.id, birthData)
    if (!updateResult.ok) {
      return { ok: false, error: updateResult.error }
    }

    // 5. Return result with warning if time is unknown
    const output: UpdateBirthDataOutput = { ok: true, data: updateResult.data }
    if (!updateResult.data.hasTime()) {
      output.warning =
        'No registraste la hora de nacimiento. Los cálculos de casas usarán el sistema Whole Sign y serán aproximados.'
    }

    return output
  }
}
