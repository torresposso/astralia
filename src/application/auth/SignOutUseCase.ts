/**
 * Sign Out Use Case
 *
 * Orchestrates the sign-out flow:
 * 1. Delegates session destruction to the repository
 * 2. Returns the redirect target
 *
 * Following Clean Architecture:
 * - Depends only on domain interfaces (IAuthRepository)
 * - No framework dependencies
 * - Testable by passing a mock IAuthRepository
 */

import type { IAuthRepository } from '@/domain/auth/repositories/IAuthRepository'

export type SignOutResponse =
  | { ok: true; redirectTo: string; cookies?: string[] }
  | { ok: false; error: string }

export class SignOutUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input?: { headers?: Headers }): Promise<SignOutResponse> {
    try {
      const result = await this.authRepo.signOut(input)
      const cookies = result && 'cookies' in result ? result.cookies : undefined
      return { ok: true, redirectTo: '/', cookies }
    } catch {
      return { ok: false, error: 'Error de conexión. Intenta de nuevo.' }
    }
  }
}
