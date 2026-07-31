import { auth } from '@/infrastructure/auth/auth.config'
import { defineMiddleware } from 'astro:middleware'

// Static/internal routes that never need a session check (assets, partials).
const SKIP_SESSION_ROUTES = ['/_astro/', '/partials/']

// Better-auth handles its own authentication on this prefix (signin, signup,
// callbacks, session endpoints), so the middleware must not require a session
// before the better-auth handler runs.
const AUTH_API_PREFIX = '/api/auth/'

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  const pathname = url.pathname

  // Static/internal routes: skip session check entirely.
  if (SKIP_SESSION_ROUTES.some((r) => pathname.startsWith(r))) {
    context.locals.user = null
    context.locals.session = null
    return next()
  }

  // Resolve the session from the better-auth cookie for every other route.
  const sessionData = await auth.api.getSession({
    headers: context.request.headers,
  })

  context.locals.user = sessionData?.user ?? null
  context.locals.session = sessionData?.session ?? null

  // Protect API routes: unauthenticated requests get a 401 JSON response.
  // Identity for API handlers must come from these authenticated locals only.
  if (pathname.startsWith('/api/') && !pathname.startsWith(AUTH_API_PREFIX)) {
    if (!sessionData) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return next()
  }

  // Protect /dashboard: redirect to signin when there is no session.
  if (pathname.startsWith('/dashboard') && !sessionData) {
    return context.redirect('/signin')
  }

  // Redirect to dashboard when there is already a session on auth pages.
  if ((pathname === '/signin' || pathname === '/signup') && sessionData) {
    return context.redirect('/dashboard')
  }

  return next()
})
