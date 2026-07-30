/**
 * Open-Meteo Geocoding Service Adapter
 *
 * Infrastructure implementation of IGeocodingService using Open-Meteo REST API.
 */

import type { IGeocodingService, GeocodingResult } from '@/domain/birth/services/IGeocodingService'

interface OpenMeteoResult {
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}

export class OpenMeteoGeocodingAdapter implements IGeocodingService {
  async searchCities(query: string): Promise<GeocodingResult[]> {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=es&format=json`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) return []

      const json = await res.json()
      if (!json.results || !Array.isArray(json.results)) return []

      return json.results.map((r: OpenMeteoResult) => {
        const parts = [r.name, r.admin1, r.country].filter(Boolean)
        return {
          displayName: parts.join(', '),
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone || 'UTC',
        }
      })
    } catch {
      return []
    }
  }
}
