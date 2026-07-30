import { describe, it, expect, beforeEach } from 'vitest'
import { GetBirthDataUseCase } from './GetBirthDataUseCase'
import { MockBirthDataRepository } from './__mocks__/MockBirthDataRepository'
import { BirthData } from '@/domain/birth/BirthData.vo'

describe('GetBirthDataUseCase', () => {
  let repository: MockBirthDataRepository
  let useCase: GetBirthDataUseCase

  beforeEach(() => {
    repository = new MockBirthDataRepository()
    useCase = new GetBirthDataUseCase(repository)
  })

  it('should return birth data when id exists and belongs to the user', async () => {
    const birthData = BirthData.create({
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
    expect(birthData.ok).toBe(true)
    if (!birthData.ok) return

    repository.seed('bd_123', birthData.value)

    const result = await useCase.execute({ id: 'bd_123', userId: 'usr_1' })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.id).toBe('bd_123')
    expect(result.data.userId).toBe('usr_1')
  })

  it('should return error when birth data does not exist', async () => {
    const result = await useCase.execute({ id: 'non_existent', userId: 'usr_1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Datos de nacimiento no encontrados')
    }
  })

  it('should return error when birth data belongs to another user', async () => {
    const birthData = BirthData.create({
      id: 'bd_123',
      userId: 'other_user',
      date: { year: 1990, month: 6, day: 10 },
      time: { hour: 14, minute: 30 },
      timeUnknown: false,
      latitude: 10.391,
      longitude: -75.479,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Colombia',
    })
    expect(birthData.ok).toBe(true)
    if (!birthData.ok) return

    repository.seed('bd_123', birthData.value)

    const result = await useCase.execute({ id: 'bd_123', userId: 'usr_1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Datos de nacimiento no encontrados')
    }
  })

  it('should validate empty inputs', async () => {
    const res2 = await useCase.execute({ userId: '' })
    expect(res2.ok).toBe(false)
  })

  it('should return birth data by userId when id is omitted', async () => {
    const birthData = BirthData.create({
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
    expect(birthData.ok).toBe(true)
    if (!birthData.ok) return

    repository.seed('bd_123', birthData.value)

    const result = await useCase.execute({ userId: 'usr_1' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.id).toBe('bd_123')
  })
})

