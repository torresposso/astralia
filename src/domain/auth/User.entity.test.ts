import { describe, it, expect } from 'vitest'
import { User } from './User.entity.ts'

describe('User', () => {
  const now = new Date()

  describe('create', () => {
    it('should create a User with only id, name, and email, using defaults for other fields', () => {
      const user = User.create({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      })

      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe('1')
      expect(user.name).toBe('Test User')
      expect(user.email).toBe('test@example.com')
      expect(user.emailVerified).toBe(false)
      expect(user.image).toBeNull()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should accept optional fields when provided', () => {
      const user = User.create({
        id: '2',
        name: 'Jane',
        email: 'jane@example.com',
        emailVerified: true,
        image: 'https://example.com/avatar.png',
        createdAt: now,
        updatedAt: now,
      })

      expect(user.emailVerified).toBe(true)
      expect(user.image).toBe('https://example.com/avatar.png')
      expect(user.createdAt).toBe(now)
      expect(user.updatedAt).toBe(now)
    })
  })

  describe('from', () => {
    it('should create a User with all fields as provided', () => {
      const user = User.from({
        id: '3',
        name: 'Bob',
        email: 'bob@example.com',
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      })

      expect(user.id).toBe('3')
      expect(user.name).toBe('Bob')
      expect(user.email).toBe('bob@example.com')
      expect(user.emailVerified).toBe(true)
      expect(user.image).toBeNull()
      expect(user.createdAt).toBe(now)
      expect(user.updatedAt).toBe(now)
    })
  })

  describe('getInitial', () => {
    it('should return the first letter of the name in uppercase', () => {
      const user = User.create({
        id: '1',
        name: 'ana',
        email: 'ana@example.com',
      })
      expect(user.getInitial()).toBe('A')
    })

    it('should fall back to the first letter of the email in uppercase when name is empty', () => {
      const user = User.create({ id: '2', name: '', email: 'bob@example.com' })
      expect(user.getInitial()).toBe('B')
    })

    it('should handle single-letter name', () => {
      const user = User.create({ id: '3', name: 'z', email: 'z@example.com' })
      expect(user.getInitial()).toBe('Z')
    })
  })

  describe('canSignIn', () => {
    it('should return true', () => {
      const user = User.create({
        id: '1',
        name: 'Test',
        email: 'test@example.com',
      })
      expect(user.canSignIn()).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true when two Users have the same id', () => {
      const user1 = User.create({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      })
      const user2 = User.create({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      })
      expect(user1.equals(user2)).toBe(true)
    })

    it('should return true when two Users have the same id but different attributes', () => {
      const user1 = User.create({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      })
      const user2 = User.from({
        id: '1',
        name: 'Different',
        email: 'other@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      })
      expect(user1.equals(user2)).toBe(true)
    })

    it('should return false when two Users have different ids', () => {
      const user1 = User.create({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      })
      const user2 = User.create({
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
      })
      expect(user1.equals(user2)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return a plain object with all fields', () => {
      const user = User.create({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: 'https://example.com/pic.png',
      })

      const json = user.toJSON()

      expect(json).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: 'https://example.com/pic.png',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    })

    it('should include null image when not provided', () => {
      const user = User.create({
        id: '1',
        name: 'Test',
        email: 'test@example.com',
      })
      const json = user.toJSON()
      expect(json.image).toBeNull()
    })
  })

  describe('properties are exposed', () => {
    it('should expose all properties from the User entity', () => {
      const user = User.create({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      })

      expect(user).toHaveProperty('id', '1')
      expect(user).toHaveProperty('name', 'Test User')
      expect(user).toHaveProperty('email', 'test@example.com')
      expect(user).toHaveProperty('emailVerified', false)
      expect(user).toHaveProperty('image', null)
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
    })
  })
})
