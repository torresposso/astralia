import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenMeteoGeocodingAdapter } from './OpenMeteoGeocodingAdapter'

describe('OpenMeteoGeocodingAdapter', () => {
  let adapter: OpenMeteoGeocodingAdapter

  beforeEach(() => {
    adapter = new OpenMeteoGeocodingAdapter()
    vi.restoreAllMocks()
  })

  it('returns empty array when query is less than 2 characters', async () => {
    const results = await adapter.searchCities('a')
    expect(results).toEqual([])
  })

  it('fetches and maps results correctly from Open-Meteo API', async () => {
    const mockApiResponse = {
      results: [
        {
          name: 'Cartagena',
          admin1: 'Bolívar',
          country: 'Colombia',
          latitude: 10.391,
          longitude: -75.479,
          timezone: 'America/Bogota',
        },
      ],
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      }),
    )

    const results = await adapter.searchCities('Cartagena')
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      displayName: 'Cartagena, Bolívar, Colombia',
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
    })
  })

  it('handles fetch errors gracefully and returns empty array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    const results = await adapter.searchCities('Bogota')
    expect(results).toEqual([])
  })
})
