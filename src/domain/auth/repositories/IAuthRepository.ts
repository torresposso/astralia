/**
 * Auth Repository Interface
 *
 * Following Matt's principle: "One adapter means a hypothetical seam.
 * Two adapters means a real one." This interface exists because:
 * 1. We want testable use cases (mock repository)
 * 2. The auth provider (better-auth) could change
 * 3. It's a small interface — pays for itself in testability
 *
 * Lives in the domain layer so application use cases depend on
 * the interface, not on infrastructure.
 */

import type { User } from '../User.entity'

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface AuthResult {
  user: User
  token?: string
  /** Set-Cookie header values from the auth provider. Opaque to the domain. */
  cookies?: string[]
}

export interface IAuthRepository {
  /** Register a new user. Returns the created User or an error. */
  signUp(input: SignUpInput): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }>

  /** Sign in an existing user. Returns the User and session token or an error. */
  signIn(input: SignInInput): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }>

  /** Sign out the current user. Optionally pass headers to identify the session. Returns Set-Cookie headers for clearing session cookies. */
  signOut(input?: { headers?: Headers }): Promise<{ cookies?: string[] } | void>

  /** Get the current session's user. Optionally pass headers to extract the session cookie. Returns null if not authenticated. */
  getSession(headers?: Headers): Promise<User | null>
}
