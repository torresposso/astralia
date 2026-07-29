/**
 * Sign Out API Route — Unit Tests
 *
 * Unlike signin/signup, the signout controller has no input validation
 * layer — it always calls the Use Case and repository. We mock @/auth
 * at the module level so BetterAuthRepository.signOut() returns a
 * controlled response without hitting better-auth or the database.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

// ---------------------------------------------------------------------------
// Mock @/auth — vi.mock is hoisted to the top by vitest
// The signout controller always calls BetterAuthRepository, which imports
// `auth` from @/auth. Mocking prevents real better-auth/database calls.
// ---------------------------------------------------------------------------
vi.mock('@/auth', () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn().mockImplementation(async () => ({
        headers: new Headers(),
      })),
      getSession: vi.fn(),
    },
  },
}))

import * as signoutEndpoint from './signout'

describe('POST /api/auth/signout', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  it('should return 200 with redirectTo: "/" on successful sign out', async () => {
    const response = await container.renderToResponse(signoutEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'better-auth.session_token=abc123',
        },
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ redirectTo: '/' })
  })
})
