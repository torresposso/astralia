import type { APIRoute } from 'astro'
import { OpenMeteoGeocodingAdapter } from '@/infrastructure/birth/OpenMeteoGeocodingAdapter'

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.session && !request.headers.get('x-user-id')) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''

  const geocodingService = new OpenMeteoGeocodingAdapter()
  const results = await geocodingService.searchCities(query)

  return new Response(
    JSON.stringify({ results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}
