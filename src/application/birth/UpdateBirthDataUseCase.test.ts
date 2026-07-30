import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateBirthDataUseCase } from './UpdateBirthDataUseCase'
import { MockBirthDataRepository } from './__mocks__/MockBirthDataRepository'
import { BirthData } from '@/domain/birth/BirthData.vo'

describe('UpdateBirthDataUseCase', () => {
  let repository: MockBirthDataRepository
  let useCase: UpdateBirthDataUseCase

  beforeEach(() => {
    repository = new MockBirthDataRepository()
    useCase = new UpdateBirthDataUseCase(repository)
  })

  it('should update birth data successfully with full validation', async () => {
    const original = BirthData.create({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1990, month: 6, day: 10 },
      time: { hour: 14, minute: 30 },
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })
    expect(original.ok).toBe(true)
    if (!original.ok) return

    repository.seed('bd_123', original.value)

    const result = await useCase.execute({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1992, month: 8, day: 20 },
      time: { hour: 8, minute: 15 },
      timeUnknown: false,
      latitude: 4.711,
      longitude: -74.072,
      timezone: 'America/Bogota',
      placeName: 'Bogotá, Colombia',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.date).toEqual({ year: 1992, month: 8, day: 20 })
    expect(result.data.placeName).toBe('Bogotá, Colombia')
    expect(result.warning).toBeUndefined()
  })

  it('should return warning when updating to unknown birth time', async () => {
    const original = BirthData.create({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1990, month: 6, day: 10 },
      time: { hour: 14, minute: 30 },
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })
    expect(original.ok).toBe(true)
    if (!original.ok) return

    repository.seed('bd_123', original.value)

    const result = await useCase.execute({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1990, month: 6, day: 10 },
      time: null,
      timeUnknown: true,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.warning).toBeDefined()
    expect(result.warning).toContain('No registraste la hora')
  })

  it('should return error when birth data does not exist', async () => {
    const result = await useCase.execute({
      id: 'non_existent',
      userId: 'usr_1',
      date: { year: 1990, month: 6, day: 10 },
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Datos de nacimiento no encontrados')
    }
  })

  it('should return error when domain validation fails (e.g. invalid date)', async () => {
    const original = BirthData.create({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1990, month: 6, day: 10 },
      time: { hour: 14, minute: 30 },
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })
    expect(original.ok).toBe(true)
    if (!original.ok) return

    repository.seed('bd_123', original.value)

    const result = await useCase.execute({
      id: 'bd_123',
      userId: 'usr_1',
      date: { year: 1750, month: 6, day: 10 }, // invalid year < 1800
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('1800')
    }
  })
})
