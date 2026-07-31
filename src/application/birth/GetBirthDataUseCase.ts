/**
 * Get Birth Data Use Case
 *
 * Retrieves a birth data record by userId.
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'
import type { BirthData } from '@/domain/birth/BirthData.vo'

export type GetBirthDataInput = {
  id?: string
  userId: string
}

export type GetBirthDataOutput =
  { ok: true; data: BirthData } | { ok: false; error: string }

export class GetBirthDataUseCase {
  constructor(private readonly repository: IBirthDataRepository) {}

  async execute(input: GetBirthDataInput): Promise<GetBirthDataOutput> {
    if (!input.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    if (input.id && input.id.trim()) {
      const birthData = await this.repository.findById(input.id)
      if (!birthData || birthData.userId !== input.userId) {
        return { ok: false, error: 'Datos de nacimiento no encontrados' }
      }
      return { ok: true, data: birthData }
    }

    const birthData = await this.repository.findByUserId(input.userId)

    if (!birthData) {
      return { ok: false, error: 'Datos de nacimiento no encontrados' }
    }

    return { ok: true, data: birthData }
  }
}
