/**
 * Delete Birth Data
 *
 * Removes a birth data record by id after validating ownership.
 */

import type { IBirthDataRepository } from '@/domain/birth/ports/IBirthDataRepository'

export type DeleteBirthDataInput = {
  id: string
  userId: string
}

export type DeleteBirthDataOutput =
  { ok: true; message: string } | { ok: false; error: string }

export class DeleteBirthData {
  constructor(private readonly repository: IBirthDataRepository) {}

  async execute(input: DeleteBirthDataInput): Promise<DeleteBirthDataOutput> {
    if (!input.id.trim()) {
      return { ok: false, error: 'El identificador es requerido' }
    }

    if (!input.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    // 1. Verify existence and ownership
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

    // 2. Perform deletion
    const deleteResult = await this.repository.delete(input.id)
    if (!deleteResult.ok) {
      if (deleteResult.error.type === 'unavailable') {
        return { ok: false, error: deleteResult.error.message }
      }
      return { ok: false, error: 'No se pudo eliminar el registro' }
    }

    return { ok: true, message: 'Datos de nacimiento eliminados exitosamente' }
  }
}
