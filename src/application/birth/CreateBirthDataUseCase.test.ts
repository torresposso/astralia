import { describe, it, expect } from 'vitest'
import { CreateBirthDataUseCase } from './CreateBirthDataUseCase'
import { MockBirthDataRepository } from './__mocks__/MockBirthDataRepository'

describe('CreateBirthDataUseCase', () => {
  const validInput = {
    userId: 'user_123',
    date: { year: 1990, month: 6, day: 10 },
    time: { hour: 10, minute: 30 },
    timeUnknown: false,
    latitude: 10.39,
    longitude: -75.5,
    timezone: 'America/Bogota',
    placeName: 'Cartagena, Bolívar, Colombia',
  }

  describe('execute', () => {
    it('should return success with birth data when input is valid', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute(validInput)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBeDefined()
        expect(result.data.hasTime()).toBe(true)
        expect(result.data.userId).toBe('user_123')
        expect(result.warning).toBeUndefined()
      }
    })

    it('should return warning when time is not provided', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        time: null,
        timeUnknown: true,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.warning).toBeDefined()
        expect(result.warning).toContain('No registraste la hora')
        expect(result.data.hasTime()).toBe(false)
      }
    })

    it('should return validation error when date is before 1800', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        date: { year: 1700, month: 1, day: 1 },
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('1800')
      }
    })

    it('should return validation error when date is after today', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        date: { year: 3000, month: 1, day: 1 },
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('hoy')
      }
    })

    it('should return validation error when latitude is out of range', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        latitude: 100,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('latitud')
      }
    })

    it('should return validation error when longitude is out of range', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        longitude: 200,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('longitud')
      }
    })

    it('should return validation error when timezone is empty', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        timezone: '',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('zona horaria')
      }
    })

    it('should return validation error when placeName is empty', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        placeName: '',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('lugar')
      }
    })

    it('should return validation error when userId is empty', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        userId: '',
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('usuario')
      }
    })

    it('should return repository error when save fails', async () => {
      const useCase = new CreateBirthDataUseCase(
        new MockBirthDataRepository().withFailure('Database connection failed'),
      )
      const result = await useCase.execute(validInput)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Database connection failed')
      }
    })

    it('should return validation error when time is null and timeUnknown is false', async () => {
      const useCase = new CreateBirthDataUseCase(new MockBirthDataRepository())
      const result = await useCase.execute({
        ...validInput,
        time: null,
        timeUnknown: false,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('hora es requerida')
      }
    })
  })
})
