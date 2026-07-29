import { describe, it, expect } from 'vitest'
import { SignInUseCase } from './SignInUseCase'
import { MockAuthRepository } from './__mocks__/MockAuthRepository'

describe('SignInUseCase', () => {
  it('should return success with redirect to /dashboard when email and password are valid', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository())
    const result = await useCase.execute({ email: 'user@example.com', password: 'SecurePass123' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.redirectTo).toBe('/dashboard')
      expect(result.cookies).toEqual(['session=abc123'])
    }
  })

  it('should return validation error when email is invalid', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository())
    const result = await useCase.execute({ email: 'invalid-email', password: 'SecurePass123' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('El formato del correo electrónico no es válido')
    }
  })

  it('should return validation error when email is empty', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository())
    const result = await useCase.execute({ email: '', password: 'SecurePass123' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('El correo electrónico es requerido')
    }
  })

  it('should return validation error when password is too short', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository())
    const result = await useCase.execute({ email: 'user@example.com', password: '1234567' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('La contraseña debe tener al menos 8 caracteres')
    }
  })

  it('should return validation error when password is empty', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository())
    const result = await useCase.execute({ email: 'user@example.com', password: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('La contraseña es requerida')
    }
  })

  it('should return repository error when the repository fails', async () => {
    const useCase = new SignInUseCase(new MockAuthRepository().withFailure('Invalid credentials'))
    const result = await useCase.execute({ email: 'user@example.com', password: 'SecurePass123' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid credentials')
    }
  })
})
