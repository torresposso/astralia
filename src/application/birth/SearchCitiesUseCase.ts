/**
 * Search Cities Use Case
 *
 * Application orchestration for geocoding city searches.
 *
 * Depends only on the domain port IGeocodingService, so controllers never
 * instantiate infrastructure adapters directly (Clean Architecture).
 */

import type {
  IGeocodingService,
  GeocodingResult,
} from '@/domain/birth/services/IGeocodingService'

export type SearchCitiesInput = {
  query: string
}

export type SearchCitiesOutput =
  { ok: true; data: GeocodingResult[] } | { ok: false; error: string }

export class SearchCitiesUseCase {
  constructor(private readonly geocodingService: IGeocodingService) {}

  async execute(input: SearchCitiesInput): Promise<SearchCitiesOutput> {
    const query = input.query.trim()
    if (!query) {
      return { ok: true, data: [] }
    }

    try {
      const data = await this.geocodingService.searchCities(query)
      return { ok: true, data }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al buscar ciudades'
      return { ok: false, error: message }
    }
  }
}
