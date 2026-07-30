/**
 * BetterAuth Repository
 *
 * Concrete implementation of IAuthRepository using better-auth's server API.
 *
 * Lives in the infrastructure layer — depends on the domain port (IAuthRepository)
 * and the better-auth library. The domain layer knows nothing about better-auth.
 */

import { auth } from '@/infrastructure/auth/auth.config'
import { User } from '@/domain/auth/User.entity'
import type {
  IAuthRepository,
  SignInInput,
  SignUpInput,
  AuthResult,
} from '@/domain/auth/repositories/IAuthRepository'
import { isAPIError } from 'better-auth/api'

function mapBetterAuthUser(betterAuthUser: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}) {
  return User.from({
    id: betterAuthUser.id,
    name: betterAuthUser.name,
    email: betterAuthUser.email,
    emailVerified: betterAuthUser.emailVerified,
    image: betterAuthUser.image ?? null,
    createdAt: betterAuthUser.createdAt ? new Date(betterAuthUser.createdAt) : undefined,
    updatedAt: betterAuthUser.updatedAt ? new Date(betterAuthUser.updatedAt) : undefined,
  })
}

export class BetterAuthRepository implements IAuthRepository {
  async signUp(
    input: SignUpInput,
  ): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }> {
    try {
      const result = await auth.api.signUpEmail({
        returnHeaders: true,
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      })

      if (!result.response) {
        return { ok: false, error: 'Error al registrarse' }
      }

      const user = mapBetterAuthUser(result.response.user)
      const cookies = result.headers.getSetCookie()

      return {
        ok: true,
        data: {
          user,
          cookies,
        },
      }
    } catch (error) {
      if (isAPIError(error)) {
        return { ok: false, error: error.message }
      }
      throw error
    }
  }

  async signIn(
    input: SignInInput,
  ): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }> {
    try {
      const result = await auth.api.signInEmail({
        returnHeaders: true,
        body: {
          email: input.email,
          password: input.password,
        },
      })

      if (!result.response) {
        return { ok: false, error: 'Error al iniciar sesión' }
      }

      const user = mapBetterAuthUser(result.response.user)
      const cookies = result.headers.getSetCookie()

      return {
        ok: true,
        data: {
          user,
          cookies,
        },
      }
    } catch (error) {
      if (isAPIError(error)) {
        return { ok: false, error: error.message }
      }
      throw error
    }
  }

  async signOut(input?: { headers?: Headers }): Promise<{ cookies?: string[] } | void> {
    const result = await auth.api.signOut({
      headers: input?.headers ?? new Headers(),
      returnHeaders: true,
    })
    return { cookies: result.headers.getSetCookie() }
  }

  async getSession(headers?: Headers): Promise<User | null> {
    const session = await auth.api.getSession({
      headers: headers ?? new Headers(),
    })

    if (!session) {
      return null
    }

    return mapBetterAuthUser(session.user)
  }
}
