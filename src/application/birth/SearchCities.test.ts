import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { SearchCities } from './SearchCities'
import type { IGeocoder, GeocodingResult } from '@/domain/birth/ports/IGeocoder'

describe('SearchCities', () => {
  const geocodingResults: GeocodingResult[] = [
    {
      displayName: 'Cartagena, Bolívar, Colombia',
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
    },
  ]

  let service: IGeocoder
  let searchCities: Mock<(query: string) => Promise<GeocodingResult[]>>

  beforeEach(() => {
    searchCities = vi.fn(
      async (): Promise<GeocodingResult[]> => geocodingResults,
    )
    service = {
      searchCities,
    }
    vi.restoreAllMocks()
  })

  describe('execute', () => {
    it('should return results when the query is valid', async () => {
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: 'Cartagena' })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toEqual(geocodingResults)
      }
      expect(searchCities).toHaveBeenCalledWith('Cartagena')
    })

    it('should trim the query before calling the service', async () => {
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: '  Bogota  ' })

      expect(result.ok).toBe(true)
      expect(searchCities).toHaveBeenCalledWith('Bogota')
    })

    it('should return an empty list without calling the service when query is empty', async () => {
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: '' })

      expect(result).toEqual({ ok: true, data: [] })
      expect(searchCities).not.toHaveBeenCalled()
    })

    it('should return an empty list when query is only whitespace', async () => {
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: '   ' })

      expect(result).toEqual({ ok: true, data: [] })
      expect(searchCities).not.toHaveBeenCalled()
    })

    it('should return the error message when the service throws an Error', async () => {
      searchCities.mockRejectedValue(new Error('Geocoding service unavailable'))
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: 'Cartagena' })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Geocoding service unavailable')
      }
    })

    it('should return a generic error when the service throws a non-Error value', async () => {
      searchCities.mockRejectedValue('boom')
      const useCase = new SearchCities(service)
      const result = await useCase.execute({ query: 'Cartagena' })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Error al buscar ciudades')
      }
    })
  })
})
