/**
 * Sign In API Route (Controller)
 *
 * Clean Architecture controller layer:
 * 1. Parse HTTP request body
 * 2. Instantiate the Use Case with the concrete repository
 * 3. Execute the Use Case
 * 4. Build the HTTP response (including Set-Cookie headers if any)
 */

import type { APIRoute } from 'astro'
import { SignIn } from '@/application/auth/SignIn'
import { BetterAuthRepository } from '@/infrastructure/auth/BetterAuthRepository'

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return Response.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 },
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const useCase = new SignIn(new BetterAuthRepository())
  const result = await useCase.execute({
    email: body.email ?? '',
    password: body.password ?? '',
  })

  if (!result.ok) {
    // Mensaje genérico para prevenir email enumeration
    return Response.json({ error: 'Credenciales inválidas' }, { status: 400 })
  }

  const response = Response.json({ redirectTo: result.redirectTo })

  // Forward session cookies from better-auth to the browser
  if (result.cookies?.length) {
    for (const cookie of result.cookies) {
      response.headers.append('Set-Cookie', cookie)
    }
  }

  return response
}
