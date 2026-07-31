import { auth } from '@/infrastructure/auth/auth.config'
import type { APIRoute } from 'astro'

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request)
}
