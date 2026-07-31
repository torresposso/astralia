import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteBirthData } from './DeleteBirthData'
import { MockBirthDataRepository } from './__mocks__/MockBirthDataRepository'
import { BirthData } from '@/domain/birth/BirthData.vo'

describe('DeleteBirthData', () => {
  let repository: MockBirthDataRepository
  let useCase: DeleteBirthData

  beforeEach(() => {
    repository = new MockBirthDataRepository()
    useCase = new DeleteBirthData(repository)
  })

  it('should delete birth data successfully by id', async () => {
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

    expect(result.message).toContain('eliminados exitosamente')
    const found = await repository.findById('bd_123')
    expect(found.ok).toBe(false)
  })

  it('should return error when birth data does not exist', async () => {
    const result = await useCase.execute({
      id: 'non_existent',
      userId: 'usr_1',
    })

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
})
