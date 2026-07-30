/**
 * Geocoding Service Interface
 *
 * Domain / Application interface for location geocoding lookup.
 */

export type GeocodingResult = {
  displayName: string
  latitude: number
  longitude: number
  timezone: string
}

export interface IGeocodingService {
  searchCities(query: string): Promise<GeocodingResult[]>
}
