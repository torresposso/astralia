/**
 * BetterAuth Repository Unit Tests
 *
 * Tests for the concrete IAuthRepository implementation.
 * The better-auth module is fully mocked — we only test the repository's
 * orchestration logic (calling the right API methods, mapping responses,
 * handling errors), not better-auth itself.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIError } from 'better-auth/api'
import { BetterAuthRepository } from './BetterAuthRepository'
import { User } from '@/domain/auth/User.entity'
import {
  signInEmailResult,
  signUpEmailResult,
  signOutResult,
  getSessionResult,
} from '../../../tests/helpers/betterAuthMocks'

// ---------------------------------------------------------------------------
// Mock @/infrastructure/auth/auth.config — vi.mock is hoisted to the top by vitest
// ---------------------------------------------------------------------------
vi.mock('@/infrastructure/auth/auth.config', () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the mocked auth reference for assertion calls. */
async function getMockedAuth() {
  const { auth } = await import('@/infrastructure/auth/auth.config')
  return auth
}

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const mockUserData = {
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  emailVerified: true,
  image: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockSessionData = {
  user: mockUserData,
  session: {
    id: 'session-123',
    userId: '1',
    expiresAt: new Date('2025-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    token: 'token-123',
    ipAddress: null,
    userAgent: null,
  },
}

const mockCookieString = 'better-auth.session_token=abc123; Path=/; HttpOnly'
const mockCookieHeaders = new Headers({ 'set-cookie': mockCookieString })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BetterAuthRepository', () => {
  let repository: BetterAuthRepository

  beforeEach(() => {
    repository = new BetterAuthRepository()
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // signIn
  // -----------------------------------------------------------------------
  describe('signIn', () => {
    it('should call auth.api.signInEmail with correct arguments and return user with cookies on success', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockResolvedValue(
        signInEmailResult({
          response: mockSessionData,
          headers: mockCookieHeaders,
        }),
      )

      const result = await repository.signIn({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(auth.api.signInEmail).toHaveBeenCalledWith({
        returnHeaders: true,
        body: {
          email: 'test@test.com',
          password: 'password123',
        },
      })

      expect(result).toEqual({
        ok: true,
        data: {
          user: User.from(mockUserData),
          cookies: [mockCookieString],
        },
      })
    })

    it('should map the better-auth user to domain User correctly', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockResolvedValue(
        signInEmailResult({
          response: mockSessionData,
          headers: mockCookieHeaders,
        }),
      )

      const result = await repository.signIn({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.user).toBeInstanceOf(User)
        expect(result.data.user.id).toBe('1')
        expect(result.data.user.name).toBe('Test User')
        expect(result.data.user.email).toBe('test@test.com')
        expect(result.data.user.emailVerified).toBe(true)
        expect(result.data.user.image).toBeNull()
      }
    })

    it('should return cookies from Set-Cookie headers', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockResolvedValue(
        signInEmailResult({
          response: mockSessionData,
          headers: mockCookieHeaders,
        }),
      )

      const result = await repository.signIn({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.cookies).toEqual([mockCookieString])
      }
    })

    it('should return ok: false when response is null', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockResolvedValue(
        signInEmailResult({ response: null, headers: mockCookieHeaders }),
      )

      const result = await repository.signIn({
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result).toEqual({
        ok: false,
        error: 'Error al iniciar sesión',
      })
    })

    it('should return ok: false with error message when better-auth throws APIError', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockRejectedValue(
        new APIError('BAD_REQUEST', { message: 'Invalid email or password' }),
      )

      const result = await repository.signIn({
        email: 'wrong@test.com',
        password: 'wrong',
      })

      expect(result).toEqual({
        ok: false,
        error: 'Invalid email or password',
      })
    })

    it('should re-throw non-APIError errors', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signInEmail).mockRejectedValue(
        new Error('Network error'),
      )

      await expect(
        repository.signIn({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Network error')
    })
  })

  // -----------------------------------------------------------------------
  // signUp
  // -----------------------------------------------------------------------
  describe('signUp', () => {
    it('should call auth.api.signUpEmail with correct arguments and return user with cookies on success', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signUpEmail).mockResolvedValue(
        signUpEmailResult({
          response: mockSessionData,
          headers: mockCookieHeaders,
        }),
      )

      const result = await repository.signUp({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      })

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        returnHeaders: true,
        body: {
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        },
      })

      expect(result).toEqual({
        ok: true,
        data: {
          user: User.from(mockUserData),
          cookies: [mockCookieString],
        },
      })
    })

    it('should map the better-auth user to domain User correctly', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signUpEmail).mockResolvedValue(
        signUpEmailResult({
          response: mockSessionData,
          headers: mockCookieHeaders,
        }),
      )

      const result = await repository.signUp({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.user).toBeInstanceOf(User)
        expect(result.data.user.id).toBe('1')
        expect(result.data.user.name).toBe('Test User')
        expect(result.data.user.email).toBe('test@test.com')
        expect(result.data.user.emailVerified).toBe(true)
        expect(result.data.user.image).toBeNull()
      }
    })

    it('should return ok: false when response is null', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signUpEmail).mockResolvedValue(
        signUpEmailResult({ response: null, headers: mockCookieHeaders }),
      )

      const result = await repository.signUp({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result).toEqual({
        ok: false,
        error: 'Error al registrarse',
      })
    })

    it('should return ok: false with error message when better-auth fails', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signUpEmail).mockRejectedValue(
        new APIError('BAD_REQUEST', { message: 'Email already in use' }),
      )

      const result = await repository.signUp({
        name: 'Test User',
        email: 'existing@test.com',
        password: 'password123',
      })

      expect(result).toEqual({
        ok: false,
        error: 'Email already in use',
      })
    })
  })

  // -----------------------------------------------------------------------
  // signOut
  // -----------------------------------------------------------------------
  describe('signOut', () => {
    it('should call auth.api.signOut with headers and return cookies', async () => {
      const auth = await getMockedAuth()
      const signOutHeaders = new Headers({
        'set-cookie': 'better-auth.session_token=; Path=/; Max-Age=0',
      })
      vi.mocked(auth.api.signOut).mockResolvedValue(
        signOutResult({ headers: signOutHeaders }),
      )

      const inputHeaders = new Headers({
        cookie: 'better-auth.session_token=abc123',
      })
      const result = await repository.signOut({ headers: inputHeaders })

      expect(auth.api.signOut).toHaveBeenCalledWith({
        headers: inputHeaders,
        returnHeaders: true,
      })

      expect(result).toEqual({
        cookies: ['better-auth.session_token=; Path=/; Max-Age=0'],
      })
    })

    it('should use new Headers() by default when no headers are passed', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.signOut).mockResolvedValue(
        signOutResult({ headers: new Headers() }),
      )

      await repository.signOut()

      expect(auth.api.signOut).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        returnHeaders: true,
      })
    })
  })

  // -----------------------------------------------------------------------
  // getSession
  // -----------------------------------------------------------------------
  describe('getSession', () => {
    it('should return a User when better-auth returns a session', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.getSession).mockResolvedValue(
        getSessionResult(mockSessionData),
      )

      const headers = new Headers({
        cookie: 'better-auth.session_token=abc123',
      })
      const result = await repository.getSession(headers)

      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers,
      })

      expect(result).toBeInstanceOf(User)
      expect(result?.id).toBe('1')
      expect(result?.name).toBe('Test User')
      expect(result?.email).toBe('test@test.com')
      expect(result?.emailVerified).toBe(true)
      expect(result?.image).toBeNull()
    })

    it('should return null when better-auth returns no session', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await repository.getSession(new Headers())

      expect(result).toBeNull()
    })

    it('should use new Headers() by default when no headers are passed', async () => {
      const auth = await getMockedAuth()
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      await repository.getSession()

      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      })
    })
  })
})
