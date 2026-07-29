/**
 * Sign In Use Case
 *
 * Orchestrates the sign-in flow:
 * 1. Validates email format (domain rule)
 * 2. Validates password presence (domain rule)
 * 3. Delegates authentication to the repository
 * 4. Returns user-friendly error messages
 *
 * Following Clean Architecture:
 * - Depends only on domain interfaces (IAuthRepository)
 * - No dependency on Astro, Alpine, better-auth, or any framework
 * - Testable by passing a mock IAuthRepository
 */

import { Email } from '@/domain/auth/Email.vo'
import { Password } from '@/domain/auth/Password.vo'
import type { IAuthRepository } from '@/domain/auth/repositories/IAuthRepository'

export interface SignInRequest {
  email: string
  password: string
}

export type SignInResponse =
  | { ok: true; redirectTo: string; cookies?: string[] }
  | { ok: false; error: string }

export class SignInUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(request: SignInRequest): Promise<SignInResponse> {
    // 1. Validate email
    const email = Email.create(request.email)
    if (!email.ok) {
      return { ok: false, error: email.error }
    }

    // 2. Validate password
    const password = Password.create(request.password)
    if (!password.ok) {
      return { ok: false, error: password.error }
    }

    // 3. Authenticate via repository
    const result = await this.authRepo.signIn({
      email: email.value.value,
      password: password.value.value,
    })

    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    // 4. Success — tell the caller where to redirect, forward session cookies
    return { ok: true, redirectTo: '/dashboard', cookies: result.data.cookies }
  }
}
