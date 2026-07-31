/**
 * Geocoder Port
 *
 * Domain / Application interface for location geocoding lookup.
 */

export type GeocodingResult = {
  displayName: string
  latitude: number
  longitude: number
  timezone: string
}

export interface IGeocoder {
  searchCities(query: string): Promise<GeocodingResult[]>
}
