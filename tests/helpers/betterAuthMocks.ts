/**
 * Typed helpers for mocking the better-auth API in tests.
 *
 * `vi.mock()` swaps the runtime implementation, but TypeScript still resolves
 * the REAL better-auth signatures — whose `returnHeaders: true` overloads
 * return `{ response, headers }` shapes that differ from the plain return
 * type kept by `vi.mocked()`. Each helper casts a hand-built payload to the
 * genuine resolved return type of the API method. The cast goes through
 * `unknown` so it never trips the `no-explicit-any` lint rule.
 */
import type { auth as authInstance } from '@/infrastructure/auth/auth.config'

type AuthApi = typeof authInstance.api

export function signInEmailResult(
  payload: unknown,
): Awaited<ReturnType<AuthApi['signInEmail']>> {
  return payload as Awaited<ReturnType<AuthApi['signInEmail']>>
}

export function signUpEmailResult(
  payload: unknown,
): Awaited<ReturnType<AuthApi['signUpEmail']>> {
  return payload as Awaited<ReturnType<AuthApi['signUpEmail']>>
}

export function signOutResult(
  payload: unknown,
): Awaited<ReturnType<AuthApi['signOut']>> {
  return payload as Awaited<ReturnType<AuthApi['signOut']>>
}

export function getSessionResult(
  payload: unknown,
): Awaited<ReturnType<AuthApi['getSession']>> {
  return payload as Awaited<ReturnType<AuthApi['getSession']>>
}
