/**
 * Get Birth Data
 *
 * Retrieves a birth data record by userId.
 */

import type { IBirthDataRepository } from '@/domain/birth/ports/IBirthDataRepository'
import type { BirthData } from '@/domain/birth/BirthData.vo'

export type GetBirthDataInput = {
  id?: string
  userId: string
}

export type GetBirthDataOutput =
  { ok: true; data: BirthData } | { ok: false; error: string }

export class GetBirthData {
  constructor(private readonly repository: IBirthDataRepository) {}

  async execute(input: GetBirthDataInput): Promise<GetBirthDataOutput> {
    if (!input.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    if (input.id && input.id.trim()) {
      const lookup = await this.repository.findById(input.id)
      if (!lookup.ok) {
        if (lookup.error.type === 'unavailable') {
          return { ok: false, error: lookup.error.message }
        }
        return { ok: false, error: 'Datos de nacimiento no encontrados' }
      }
      if (lookup.data.userId !== input.userId) {
        return { ok: false, error: 'Datos de nacimiento no encontrados' }
      }
      return { ok: true, data: lookup.data }
    }

    const birthData = await this.repository.findByUserId(input.userId)

    if (!birthData) {
      return { ok: false, error: 'Datos de nacimiento no encontrados' }
    }

    return { ok: true, data: birthData }
  }
}
