/**
 * Birth Data Controller Helper / Guard Utility
 *
 * Centralizes HTTP request parsing, JSON content validation,
 * session authentication extraction, and Response construction across
 * Birth Data API routes.
 */

import type { APIContext } from 'astro'

export type AuthRequestContext = {
  userId: string
  id?: string
  body?: Record<string, unknown>
}

export async function parseAndAuthenticateRequest(
  context: APIContext,
  options: { requireJsonBody?: boolean; requireId?: boolean } = {},
): Promise<
  { ok: true; data: AuthRequestContext } | { ok: false; response: Response }
> {
  const { request, params, locals } = context
  let body: Record<string, unknown> | undefined

  if (options.requireJsonBody) {
    if (request.headers.get('Content-Type') !== 'application/json') {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({ error: 'Content-Type debe ser application/json' }),
          { status: 415, headers: { 'Content-Type': 'application/json' } },
        ),
      }
    }

    try {
      body = await request.json()
    } catch {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({
            error: 'El cuerpo de la solicitud no es JSON válido',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      }
    }
  }

  const id = params.id
  if (options.requireId && !id) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'El identificador es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    }
  }

  // Identity comes exclusively from the authenticated session resolved by
  // middleware. Never trust client-supplied identity (headers or body).
  const userId = locals?.user?.id ?? ''

  if (!userId) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  return {
    ok: true,
    data: {
      userId,
      id,
      body,
    },
  }
}
