import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CaelusBirthConverter } from './CaelusBirthConverter'
import { BirthData } from '@/domain/birth/BirthData.vo'
import { toUT } from 'caelus-birth'

// Mock caelus-birth to avoid tzdb dependency in CI
vi.mock('caelus-birth', () => ({
  toUT: vi.fn(),
}))

describe('CaelusBirthConverter', () => {
  let converter: CaelusBirthConverter

  beforeEach(() => {
    vi.clearAllMocks()
    converter = new CaelusBirthConverter()
  })

  it('should convert local birth time to UT correctly', () => {
    const mockToUTResult = {
      utc: { year: 1990, month: 6, day: 10, hour: 19, minute: 30, second: 0 },
      jdUt: 2448053.3125,
      zone: 'America/Bogota',
      offsetMinutes: -300,
      dst: false,
      status: 'ok' as const,
    }
    vi.mocked(toUT).mockReturnValue(mockToUTResult)

    const birthDataResult = BirthData.create({
      userId: 'usr_123',
      date: { year: 1990, month: 6, day: 10 },
      time: { hour: 14, minute: 30 },
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })

    expect(birthDataResult.ok).toBe(true)
    if (!birthDataResult.ok) return

    const result = converter.convert(birthDataResult.value)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(toUT).toHaveBeenCalledWith({
      year: 1990,
      month: 6,
      day: 10,
      hour: 14,
      minute: 30,
      lat: 10.391,
      lon: -75.479,
      zone: 'America/Bogota',
    })

    expect(result.data).toEqual({
      utc: { year: 1990, month: 6, day: 10, hour: 19, minute: 30, second: 0 },
      jdUt: 2448053.3125,
      zone: 'America/Bogota',
      offsetMinutes: -300,
      dst: false,
      status: 'ok',
    })
  })

  it('should default to 12:00 noon when birth time is null or unknown', () => {
    const mockToUTResult = {
      utc: { year: 1995, month: 12, day: 25, hour: 17, minute: 0, second: 0 },
      jdUt: 2450077.20833,
      zone: 'America/Bogota',
      offsetMinutes: -300,
      dst: false,
      status: 'ok' as const,
    }
    vi.mocked(toUT).mockReturnValue(mockToUTResult)

    const birthDataResult = BirthData.create({
      userId: 'usr_456',
      date: { year: 1995, month: 12, day: 25 },
      time: null,
      timeUnknown: true,
      latitude: 4.711,
      longitude: -74.072,
      timezone: 'America/Bogota',
      placeName: 'Bogotá, Colombia',
    })

    expect(birthDataResult.ok).toBe(true)
    if (!birthDataResult.ok) return

    const result = converter.convert(birthDataResult.value)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(toUT).toHaveBeenCalledWith({
      year: 1995,
      month: 12,
      day: 25,
      hour: 12,
      minute: 0,
      lat: 4.711,
      lon: -74.072,
      zone: 'America/Bogota',
    })

    expect(result.data.utc.hour).toBe(17)
  })

  it('should return error when toUT throws an exception', () => {
    vi.mocked(toUT).mockImplementation(() => {
      throw new Error('Unknown IANA time zone: Invalid/Zone')
    })

    const birthDataResult = BirthData.from({
      userId: 'usr_789',
      date: { year: 2000, month: 1, day: 1 },
      time: { hour: 8, minute: 0 },
      timeUnknown: false,
      latitude: 0,
      longitude: 0,
      timezone: 'Invalid/Zone',
      placeName: 'Unknown',
    })

    const result = converter.convert(birthDataResult)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Unknown IANA time zone: Invalid/Zone')
    }
  })

  it('should handle non-Error exceptions gracefully', () => {
    vi.mocked(toUT).mockImplementation(() => {
      throw 'unexpected string error'
    })

    const birthDataResult = BirthData.from({
      userId: 'usr_789',
      date: { year: 2000, month: 1, day: 1 },
      time: { hour: 8, minute: 0 },
      timeUnknown: false,
      latitude: 0,
      longitude: 0,
      timezone: 'America/Bogota',
      placeName: 'Unknown',
    })

    const result = converter.convert(birthDataResult)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Error al convertir hora local a UT')
    }
  })
})
