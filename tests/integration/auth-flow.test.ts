/**
 * Auth Flow — Integration Tests
 *
 * Tests the complete flow: Alpine.js → API Route → Use Case → Repository → better-auth
 *
 * These tests use the Astro Container API to render endpoints, with @/auth
 * mocked so we don't need a real better-auth server.
 *
 * What's tested:
 * - signup + auto-signin flow
 * - signin with valid credentials
 * - signin with wrong credentials → generic error
 * - signout → session cleanup
 */

import { describe, it, expect, beforeAll, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import {
  signInEmailResult,
  signUpEmailResult,
  signOutResult,
} from '../helpers/betterAuthMocks'

// Mock better-auth at module level for all integration tests
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

import * as signinEndpoint from '@/pages/api/auth/signin'
import * as signupEndpoint from '@/pages/api/auth/signup'
import * as signoutEndpoint from '@/pages/api/auth/signout'

describe('Auth Flow Integration', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  describe('Sign Up → redirect to dashboard', () => {
    it('should return redirectTo on successful signup', async () => {
      const { auth } = await import('@/infrastructure/auth/auth.config')
      vi.mocked(auth.api.signUpEmail).mockResolvedValue(
        signUpEmailResult({
          response: {
            user: {
              id: 'new-user-1',
              name: 'New User',
              email: 'new@test.com',
              emailVerified: true,
              image: null,
            },
            session: {
              id: 'session-new-1',
              userId: 'new-user-1',
              expiresAt: new Date('2025-01-01'),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              token: 'token-new',
              ipAddress: null,
              userAgent: null,
            },
          },
          headers: new Headers({
            'set-cookie':
              'better-auth.session_token=new-session-token; Path=/; HttpOnly',
          }),
        }),
      )

      const response = await container.renderToResponse(signupEndpoint, {
        routeType: 'endpoint',
        request: new Request('http://localhost/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New User',
            email: 'new@test.com',
            password: 'SecurePass123',
            confirmPassword: 'SecurePass123',
          }),
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.redirectTo).toBe('/dashboard')
      expect(response.headers.getSetCookie()).toContain(
        'better-auth.session_token=new-session-token; Path=/; HttpOnly',
      )
    })
  })

  describe('Sign In → redirect to dashboard', () => {
    it('should return redirectTo + Set-Cookie on successful signin', async () => {
      const { auth } = await import('@/infrastructure/auth/auth.config')
      vi.mocked(auth.api.signInEmail).mockResolvedValue(
        signInEmailResult({
          response: {
            user: {
              id: 'existing-user-1',
              name: 'Existing User',
              email: 'existing@test.com',
              emailVerified: true,
              image: null,
            },
            session: {
              id: 'session-existing-1',
              userId: 'existing-user-1',
              expiresAt: new Date('2025-01-01'),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
              token: 'token-existing',
              ipAddress: null,
              userAgent: null,
            },
          },
          headers: new Headers({
            'set-cookie':
              'better-auth.session_token=existing-session-token; Path=/; HttpOnly',
          }),
        }),
      )

      const response = await container.renderToResponse(signinEndpoint, {
        routeType: 'endpoint',
        request: new Request('http://localhost/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'existing@test.com',
            password: 'SecurePass123',
          }),
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.redirectTo).toBe('/dashboard')
      expect(response.headers.getSetCookie()).toContain(
        'better-auth.session_token=existing-session-token; Path=/; HttpOnly',
      )
    })

    it('should return generic error on invalid credentials (prevent email enumeration)', async () => {
      const { auth } = await import('@/infrastructure/auth/auth.config')
      vi.mocked(auth.api.signInEmail).mockRejectedValue(
        new (await import('better-auth/api')).APIError('BAD_REQUEST', {
          message: 'Invalid email or password',
        }),
      )

      const response = await container.renderToResponse(signinEndpoint, {
        routeType: 'endpoint',
        request: new Request('http://localhost/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@test.com',
            password: 'wrongpassword',
          }),
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Credenciales inválidas')
    })
  })

  describe('Sign Out → redirect to home', () => {
    it('should return redirectTo: "/" on successful signout', async () => {
      const { auth } = await import('@/infrastructure/auth/auth.config')
      vi.mocked(auth.api.signOut).mockResolvedValue(
        signOutResult({
          headers: new Headers({
            'set-cookie': 'better-auth.session_token=; Path=/; Max-Age=0',
          }),
        }),
      )

      const response = await container.renderToResponse(signoutEndpoint, {
        routeType: 'endpoint',
        request: new Request('http://localhost/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: 'better-auth.session_token=existing-session-token',
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.redirectTo).toBe('/')
      // Verify session cookie is cleared
      const setCookie = response.headers.getSetCookie()
      expect(setCookie.some((c) => c.includes('Max-Age=0'))).toBe(true)
    })
  })
})
