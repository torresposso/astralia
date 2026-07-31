import type { APIRoute } from 'astro'
import { SearchCitiesUseCase } from '@/application/birth/SearchCitiesUseCase'
import { OpenMeteoGeocodingAdapter } from '@/infrastructure/birth/OpenMeteoGeocodingAdapter'

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals?.user?.id) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const query = url.searchParams.get('q')?.trim() ?? ''

  const useCase = new SearchCitiesUseCase(new OpenMeteoGeocodingAdapter())
  const result = await useCase.execute({ query })

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ results: result.data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
