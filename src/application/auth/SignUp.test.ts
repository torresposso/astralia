import { describe, it, expect } from 'vitest'
import { SignUp } from './SignUp'
import { MockAuthRepository } from './__mocks__/MockAuthRepository'

describe('SignUp', () => {
  it('should return success with redirect to /dashboard when all data is valid', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.redirectTo).toBe('/dashboard')
      expect(result.cookies).toEqual(['session=abc123'])
    }
  })

  it('should return validation error when name is empty', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: '',
      email: 'user@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Ingresa tu nombre')
    }
  })

  it('should return validation error when name is only whitespace', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: '   ',
      email: 'user@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Ingresa tu nombre')
    }
  })

  it('should return validation error when email is invalid', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: 'Test User',
      email: 'not-an-email',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'El formato del correo electrónico no es válido',
      )
    }
  })

  it('should return validation error when password is too short', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: '1234567',
      confirmPassword: '1234567',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'La contraseña debe tener al menos 8 caracteres',
      )
    }
  })

  it('should return validation error when passwords do not match', async () => {
    const useCase = new SignUp(new MockAuthRepository())
    const result = await useCase.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: 'SecurePass123',
      confirmPassword: 'DifferentPass456',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Las contraseñas no coinciden')
    }
  })

  it('should return repository error when the repository fails', async () => {
    const useCase = new SignUp(
      new MockAuthRepository().withFailure('Email already registered'),
    )
    const result = await useCase.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Email already registered')
    }
  })
})
