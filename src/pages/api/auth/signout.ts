/**
 * Sign Out API Route (Controller)
 *
 * Clean Architecture controller layer:
 * 1. Instantiate the Use Case with the concrete repository
 * 2. Pass request headers to identify the session
 * 3. Execute the Use Case
 * 4. Build the HTTP response
 */

import type { APIRoute } from 'astro'
import { SignOut } from '@/application/auth/SignOut'
import { BetterAuthRepository } from '@/infrastructure/auth/BetterAuthRepository'

export const POST: APIRoute = async ({ request }) => {
  const useCase = new SignOut(new BetterAuthRepository())
  const result = await useCase.execute({ headers: request.headers })

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 })
  }

  const response = Response.json({ redirectTo: result.redirectTo })

  if (result.cookies?.length) {
    for (const cookie of result.cookies) {
      response.headers.append('Set-Cookie', cookie)
    }
  }

  return response
}
