import { describe, it, expect } from 'vitest'
import { Email } from './Email.vo.ts'

describe('Email', () => {
  describe('create', () => {
    it('should create an Email with a valid address', () => {
      const result = Email.create('user@example.com')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Email)
        expect(result.value.value).toBe('user@example.com')
      }
    })

    it('should return an error when email is empty', () => {
      const result = Email.create('')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('El correo electrónico es requerido')
      }
    })

    it('should return an error when email is only whitespace', () => {
      const result = Email.create('   ')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('El correo electrónico es requerido')
      }
    })

    it('should return an error when email has no @', () => {
      const result = Email.create('userexample.com')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('El formato del correo electrónico no es válido')
      }
    })

    it('should return an error when email has no domain', () => {
      const result = Email.create('user@')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('El formato del correo electrónico no es válido')
      }
    })

    it('should return an error when email is too long (>254)', () => {
      const localPart = 'a'.repeat(250)
      const longEmail = `${localPart}@b.co`
      expect(longEmail.length).toBeGreaterThan(254)
      const result = Email.create(longEmail)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('El correo electrónico es demasiado largo')
      }
    })
  })

  describe('value getter', () => {
    it('should return the normalized email (trimmed, lowercase)', () => {
      const result = Email.create('  USER@Example.COM  ')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe('user@example.com')
      }
    })
  })

  describe('domain getter', () => {
    it('should return the part after the @', () => {
      const result = Email.create('user@example.com')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.domain).toBe('example.com')
      }
    })
  })

  describe('localPart getter', () => {
    it('should return the part before the @', () => {
      const result = Email.create('user@example.com')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.localPart).toBe('user')
      }
    })
  })

  describe('equals', () => {
    it('should return true when two emails have the same normalized value', () => {
      const email1 = Email.create('user@example.com')
      const email2 = Email.create('USER@example.com')
      expect(email1.ok).toBe(true)
      expect(email2.ok).toBe(true)
      if (email1.ok && email2.ok) {
        expect(email1.value.equals(email2.value)).toBe(true)
      }
    })

    it('should return false when two emails have different values', () => {
      const email1 = Email.create('user@example.com')
      const email2 = Email.create('other@example.com')
      expect(email1.ok).toBe(true)
      expect(email2.ok).toBe(true)
      if (email1.ok && email2.ok) {
        expect(email1.value.equals(email2.value)).toBe(false)
      }
    })
  })

  describe('toString', () => {
    it('should return the normalized email', () => {
      const result = Email.create('user@example.com')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.toString()).toBe('user@example.com')
      }
    })
  })

  describe('from', () => {
    it('should create an Email from a validated string without validation', () => {
      const email = Email.from('User@Example.com')
      expect(email).toBeInstanceOf(Email)
      expect(email.value).toBe('user@example.com')
    })
  })
})
