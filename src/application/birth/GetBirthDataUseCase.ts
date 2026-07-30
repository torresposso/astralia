/**
 * Get Birth Data Use Case
 *
 * Retrieves a birth data record by id and validates that it belongs to the given user.
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'
import type { BirthData } from '@/domain/birth/BirthData.vo'

export type GetBirthDataInput = {
  id: string
  userId: string
}

export type GetBirthDataOutput =
  | { ok: true; data: BirthData }
  | { ok: false; error: string }

export class GetBirthDataUseCase {
  constructor(private readonly repository: IBirthDataRepository) {}

  async execute(input: GetBirthDataInput): Promise<GetBirthDataOutput> {
    if (!input.id.trim()) {
      return { ok: false, error: 'El identificador es requerido' }
    }

    if (!input.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    const birthData = await this.repository.findById(input.id)

    if (!birthData || birthData.userId !== input.userId) {
      return { ok: false, error: 'Datos de nacimiento no encontrados' }
    }

    return { ok: true, data: birthData }
  }
}
