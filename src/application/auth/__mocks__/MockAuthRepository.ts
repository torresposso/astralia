import { vi } from 'vitest'
import { User } from '@/domain/auth/User.entity'
import type { IAuthRepository, SignInInput, SignUpInput, AuthResult } from '@/domain/auth/repositories/IAuthRepository'

/**
 * Shared mock for IAuthRepository used across all Application test files.
 *
 * Two modes:
 * - Normal mode: all operations succeed with a default mock user
 * - Fail mode: all operations return { ok: false, error }
 *
 * Helpers:
 * - withUser(user): customize the returned user
 * - withFailure(): switch to fail mode
 * - reset(): reset to default state
 */
export class MockAuthRepository implements IAuthRepository {
  private mockUser: User
  private shouldFail = false
  private failMessage = 'Operation failed'
  private mockCookies: string[] = ['session=abc123']

  // Spy-able methods for assertion
  readonly signInSpy = vi.fn<IAuthRepository['signIn']>()
  readonly signUpSpy = vi.fn<IAuthRepository['signUp']>()
  readonly signOutSpy = vi.fn<IAuthRepository['signOut']>()
  readonly getSessionSpy = vi.fn<IAuthRepository['getSession']>()

  constructor() {
    this.mockUser = User.create({ id: '1', name: 'Test User', email: 'test@test.com' })
    this.setupDefaultBehavior()
  }

  // ---- IAuthRepository implementation ----

  async signIn(_input: SignInInput): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }> {
    return this.signInSpy(_input)
  }

  async signUp(_input: SignUpInput): Promise<{ ok: true; data: AuthResult } | { ok: false; error: string }> {
    return this.signUpSpy(_input)
  }

  async signOut(_input?: { headers?: Headers }): Promise<{ cookies?: string[] } | void> {
    return this.signOutSpy(_input)
  }

  async getSession(_headers?: Headers): Promise<User | null> {
    return this.getSessionSpy(_headers)
  }

  // ---- Helpers ----

  /** Configure the mock to succeed with a custom user */
  withUser(user: User): this {
    this.mockUser = user
    return this
  }

  /** Configure the mock to return errors */
  withFailure(message?: string): this {
    this.shouldFail = true
    if (message) this.failMessage = message
    return this
  }

  /** Configure the mock with cookies */
  withCookies(cookies: string[]): this {
    this.mockCookies = cookies
    return this
  }

  /** Reset to default state and clear spies */
  reset(): this {
    this.mockUser = User.create({ id: '1', name: 'Test User', email: 'test@test.com' })
    this.shouldFail = false
    this.failMessage = 'Operation failed'
    this.mockCookies = ['session=abc123']
    this.signInSpy.mockReset()
    this.signUpSpy.mockReset()
    this.signOutSpy.mockReset()
    this.getSessionSpy.mockReset()
    // Set default behaviors
    this.setupDefaultBehavior()
    return this
  }

  /** Set up default spy implementations (happy path) */
  private setupDefaultBehavior(): void {
    this.signInSpy.mockImplementation(async () => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      return {
        ok: true,
        data: {
          user: this.mockUser,
          cookies: this.mockCookies,
        },
      }
    })

    this.signUpSpy.mockImplementation(async () => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      return {
        ok: true,
        data: {
          user: this.mockUser,
          cookies: this.mockCookies,
        },
      }
    })

    this.signOutSpy.mockImplementation(async () => {
      if (this.shouldFail) throw new Error(this.failMessage)
      return { cookies: this.mockCookies }
    })

    this.getSessionSpy.mockImplementation(async () => {
      if (this.shouldFail) return null
      return this.mockUser
    })
  }
}
