/**
 * Sign Up
 *
 * Orchestrates the registration flow:
 * 1. Validates name presence
 * 2. Validates email format
 * 3. Validates password strength
 * 4. Validates password confirmation matches
 * 5. Delegates registration to the repository
 *
 * Following Clean Architecture:
 * - Depends only on domain interfaces (IAuthRepository, Email, Password)
 * - No framework dependencies
 * - Testable by passing a mock IAuthRepository
 */

import { Email } from '@/domain/auth/Email.vo'
import { Password } from '@/domain/auth/Password.vo'
import type { IAuthRepository } from '@/domain/auth/ports/IAuthRepository'

export interface SignUpRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type SignUpResponse =
  | { ok: true; redirectTo: string; cookies?: string[] }
  | { ok: false; error: string }

export class SignUp {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    // 1. Validate name
    if (!request.name.trim()) {
      return { ok: false, error: 'Ingresa tu nombre' }
    }

    // 2. Validate email
    const email = Email.create(request.email)
    if (!email.ok) {
      return { ok: false, error: email.error }
    }

    // 3. Validate password strength
    const password = Password.create(request.password)
    if (!password.ok) {
      return { ok: false, error: password.error }
    }

    // 4. Validate password confirmation
    if (!password.value.matches(request.confirmPassword)) {
      return { ok: false, error: 'Las contraseñas no coinciden' }
    }

    // 5. Register via repository
    const result = await this.authRepo.signUp({
      name: request.name.trim(),
      email: email.value.value,
      password: password.value.value,
    })

    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    // 6. Success — forward session cookies
    return { ok: true, redirectTo: '/dashboard', cookies: result.data.cookies }
  }
}
