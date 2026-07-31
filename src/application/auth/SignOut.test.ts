import { describe, it, expect } from 'vitest'
import { SignOut } from './SignOut'
import { MockAuthRepository } from './__mocks__/MockAuthRepository'

describe('SignOut', () => {
  it('should return success with redirect to / when sign out succeeds', async () => {
    const useCase = new SignOut(new MockAuthRepository())
    const result = await useCase.execute()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.redirectTo).toBe('/')
    }
  })

  it('should return error when the repository throws', async () => {
    const useCase = new SignOut(new MockAuthRepository().withFailure())
    const result = await useCase.execute()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Error de conexión. Intenta de nuevo.')
    }
  })
})
