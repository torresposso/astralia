/**
 * Delete Birth Data Use Case
 *
 * Removes a birth data record by id after validating ownership.
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'

export type DeleteBirthDataInput = {
  id: string
  userId: string
}

export type DeleteBirthDataOutput =
  { ok: true; message: string } | { ok: false; error: string }

export class DeleteBirthDataUseCase {
  constructor(private readonly repository: IBirthDataRepository) {}

  async execute(input: DeleteBirthDataInput): Promise<DeleteBirthDataOutput> {
    if (!input.id.trim()) {
      return { ok: false, error: 'El identificador es requerido' }
    }

    if (!input.userId.trim()) {
      return { ok: false, error: 'El identificador de usuario es requerido' }
    }

    // 1. Verify existence and ownership
    const existing = await this.repository.findById(input.id)
    if (!existing || existing.userId !== input.userId) {
      return { ok: false, error: 'Datos de nacimiento no encontrados' }
    }

    // 2. Perform deletion
    const deleted = await this.repository.delete(input.id)
    if (!deleted) {
      return { ok: false, error: 'No se pudo eliminar el registro' }
    }

    return { ok: true, message: 'Datos de nacimiento eliminados exitosamente' }
  }
}
