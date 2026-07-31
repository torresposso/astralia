import { describe, it, expect } from 'vitest'
import { CalculateChartUseCase } from './CalculateChartUseCase'
import { MockBirthDataRepository } from '@/application/birth/__mocks__/MockBirthDataRepository'
import { MockBirthToUTConverter } from '@/application/birth/__mocks__/MockBirthToUTConverter'
import { MockChartCalculator } from '@/domain/chart/__mocks__/MockChartCalculator'
import { BirthData } from '@/domain/birth/BirthData.vo'

describe('CalculateChartUseCase', () => {
  const validInput = {
    birthDataId: 'birth_123',
    userId: 'user_123',
  }

  function seedBirthData(
    repository: MockBirthDataRepository,
    overrides: Partial<{
      id: string
      userId: string
      time: { hour: number; minute: number } | null
      timeUnknown: boolean
    }> = {},
  ): BirthData {
    const id = overrides.id ?? 'birth_123'
    const birthData = BirthData.from({
      id,
      userId: overrides.userId ?? 'user_123',
      date: { year: 1990, month: 6, day: 10 },
      time:
        overrides.time !== undefined
          ? overrides.time
          : { hour: 10, minute: 30 },
      timeUnknown: overrides.timeUnknown ?? false,
      latitude: 10.39,
      longitude: -75.5,
      timezone: 'America/Bogota',
      placeName: 'Cartagena, Bolívar, Colombia',
    })
    repository.seed(id, birthData)
    return birthData
  }

  describe('execute', () => {
    it('should return success with natal chart when input is valid', async () => {
      const repository = new MockBirthDataRepository()
      seedBirthData(repository)
      const useCase = new CalculateChartUseCase(
        repository,
        new MockBirthToUTConverter(),
        new MockChartCalculator(),
      )
      const result = await useCase.execute(validInput)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBeDefined()
        expect(result.data.birthDataId).toBe('birth_123')
        expect(result.data.planets).toHaveLength(10)
        expect(result.data.houses).toHaveLength(12)
        expect(result.warning).toBeUndefined()
      }
    })

    it('should return 404 error when birth data is not found', async () => {
      const repository = new MockBirthDataRepository()
      const useCase = new CalculateChartUseCase(
        repository,
        new MockBirthToUTConverter(),
        new MockChartCalculator(),
      )
      const result = await useCase.execute({
        birthDataId: 'nonexistent',
        userId: 'user_123',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('no encontrados')
        expect(result.status).toBe(404)
      }
    })

    it('should return 401 error when user is not authorized', async () => {
      const repository = new MockBirthDataRepository()
      seedBirthData(repository)
      const useCase = new CalculateChartUseCase(
        repository,
        new MockBirthToUTConverter(),
        new MockChartCalculator(),
      )
      const result = await useCase.execute({
        birthDataId: 'birth_123',
        userId: 'user_other',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('No autorizado')
        expect(result.status).toBe(401)
      }
    })

    it('should return warning when birth time is unknown', async () => {
      const repository = new MockBirthDataRepository()
      seedBirthData(repository, {
        time: null,
        timeUnknown: true,
      })
      const useCase = new CalculateChartUseCase(
        repository,
        new MockBirthToUTConverter(),
        new MockChartCalculator(),
      )
      const result = await useCase.execute(validInput)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.warning).toBeDefined()
        expect(result.warning).toContain('hora de nacimiento')
      }
    })

    it('should return error when UT conversion fails', async () => {
      const repository = new MockBirthDataRepository()
      seedBirthData(repository)
      const useCase = new CalculateChartUseCase(
        repository,
        new MockBirthToUTConverter().withFailure('Error al convertir a UT'),
        new MockChartCalculator(),
      )
      const result = await useCase.execute(validInput)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Error al convertir a UT')
      }
    })
  })
})
