/**
 * Middleware — Direct Seam Tests
 *
 * Calls the public `onRequest` middleware seam directly (no AstroContainer,
 * which bypasses middleware) with a minimal context fixture and a stubbed
 * `next`, proving:
 * - unauthenticated protected `/api/*` requests return a JSON 401
 * - `/api/auth/*` stays exempt (next is called, no 401)
 * - authenticated protected `/api/*` requests reach `next`
 *
 * The middleware behavior itself is unchanged; only the public seam is
 * exercised. The fixture types are derived from the seam's own signature so
 * they stay in sync with the real middleware.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSessionResult } from '../tests/helpers/betterAuthMocks'

// `astro:middleware` is an Astro-specific specifier that Vitest's node
// resolver cannot load; mock it as the identity wrapper it really is so the
// middleware module can be imported directly.
vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: unknown) => fn,
}))

// Mock better-auth at module level so session resolution never touches the
// real better-auth server or the Turso database.
vi.mock('@/infrastructure/auth/auth.config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { onRequest } from '@/middleware'
import { auth } from '@/infrastructure/auth/auth.config'

// Types derived from the public seam itself.
type MiddlewareContext = Parameters<typeof onRequest>[0]
type MiddlewareNext = Parameters<typeof onRequest>[1]

function createContext(pathname: string): MiddlewareContext {
  const request = new Request(`http://localhost${pathname}`)
  const locals = {} as App.Locals
  return {
    request,
    locals,
    redirect: vi.fn(),
  } as unknown as MiddlewareContext
}

function createNext(): MiddlewareNext {
  return vi.fn(
    async () => new Response('handled by next', { status: 200 }),
  ) as unknown as MiddlewareNext
}

// The public seam may return void per its type; in practice the middleware
// always returns a Response, so the fixture normalizes the call for the
// behavior assertions below.
async function runMiddleware(
  context: MiddlewareContext,
  next: MiddlewareNext,
): Promise<Response> {
  return (await onRequest(context, next)) as Response
}

const sessionData = getSessionResult({
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
  },
  session: {
    id: 'session-1',
    userId: 'user-1',
    expiresAt: new Date('2026-08-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    token: 'token-1',
    ipAddress: null,
    userAgent: null,
  },
})

describe('middleware onRequest', () => {
  beforeEach(() => {
    vi.mocked(auth.api.getSession).mockReset()
  })

  it('returns JSON 401 for unauthenticated protected /api/* requests', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const context = createContext('/api/chart/natal?birthDataId=birth-1')
    const next = createNext()

    const response = await runMiddleware(context, next)

    expect(response.status).toBe(401)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.json()).toEqual({ error: 'No autorizado' })
    expect(next).not.toHaveBeenCalled()
    expect(context.locals.user).toBeNull()
    expect(context.locals.session).toBeNull()
  })

  it('leaves /api/auth/* exempt: next is called instead of a 401', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const context = createContext('/api/auth/signin')
    const next = createNext()

    const response = await runMiddleware(context, next)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('handled by next')
    expect(next).toHaveBeenCalledTimes(1)
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: context.request.headers,
    })
  })

  it('lets authenticated /api/* requests through to next', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(sessionData)
    const context = createContext('/api/chart/natal')
    const next = createNext()

    const response = await runMiddleware(context, next)

    expect(response.status).toBe(200)
    expect(next).toHaveBeenCalledTimes(1)
    expect(context.locals.user?.id).toBe('user-1')
    expect(context.locals.session?.id).toBe('session-1')
  })
})
