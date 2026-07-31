import { describe, it, expect } from 'vitest'
import { Password } from './Password.vo.ts'

describe('Password', () => {
  describe('create', () => {
    it('should create a Password with 8 or more characters', () => {
      const result = Password.create('SecurePass123')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Password)
        expect(result.value.value).toBe('SecurePass123')
      }
    })

    it('should return an error when password is empty', () => {
      const result = Password.create('')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('La contraseña es requerida')
      }
    })

    it('should return an error when password is less than 8 characters', () => {
      const result = Password.create('1234567')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe(
          'La contraseña debe tener al menos 8 caracteres',
        )
      }
    })

    it('should return an error when password is exactly at the boundary (7 chars)', () => {
      const result = Password.create('a'.repeat(7))
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe(
          'La contraseña debe tener al menos 8 caracteres',
        )
      }
    })
  })

  describe('value getter', () => {
    it('should return the raw password value', () => {
      const result = Password.create('MySecureP@ss')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe('MySecureP@ss')
      }
    })
  })

  describe('matches', () => {
    it('should return true when the confirmation string matches the password', () => {
      const result = Password.create('SecurePass123')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.matches('SecurePass123')).toBe(true)
      }
    })

    it('should return false when the confirmation string does not match', () => {
      const result = Password.create('SecurePass123')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.matches('WrongPassword')).toBe(false)
      }
    })
  })

  describe('mask getter', () => {
    it('should not expose the actual password', () => {
      const result = Password.create('MySecureP@ss')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.mask).not.toBe('MySecureP@ss')
        expect(result.value.mask).toMatch(/^•+$/)
      }
    })

    it('should cap the mask length at 12 characters', () => {
      const result = Password.create('a'.repeat(20))
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.mask).toBe('•'.repeat(12))
        expect(result.value.mask.length).toBe(12)
      }
    })
  })

  describe('fromHashed', () => {
    it('should create a Password from a hashed value without validation', () => {
      const hashed = '$2b$10$SomeHashedPasswordValue'
      const password = Password.fromHashed(hashed)
      expect(password).toBeInstanceOf(Password)
      expect(password.value).toBe(hashed)
    })

    it('should allow creating a Password from an empty hash (bypasses validation)', () => {
      const password = Password.fromHashed('')
      expect(password).toBeInstanceOf(Password)
      expect(password.value).toBe('')
    })
  })

  describe('toString', () => {
    it('should not expose the actual password', () => {
      const result = Password.create('MySecureP@ss')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.toString()).not.toBe('MySecureP@ss')
        expect(result.value.toString()).toMatch(/^•+$/)
      }
    })

    it('should return the same value as the mask getter', () => {
      const result = Password.create('SecurePass123')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.toString()).toBe(result.value.mask)
      }
    })
  })
})
