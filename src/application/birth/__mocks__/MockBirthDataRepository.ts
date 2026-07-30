/**
 * Mock BirthData Repository
 *
 * Shared mock for IBirthDataRepository used across all Application test files.
 *
 * Two modes:
 * - Normal mode: create succeeds with a default BirthData
 * - Fail mode: create returns { ok: false, error }
 *
 * Helpers:
 * - withBirthData(birthData): customize the returned BirthData
 * - withFailure(): switch to fail mode
 * - reset(): reset to default state
 */

import { vi } from 'vitest'
import type { IBirthDataRepository, BirthDataResult } from '@/domain/birth/repositories/IBirthDataRepository'
import { BirthData } from '@/domain/birth/BirthData.vo'

export class MockBirthDataRepository implements IBirthDataRepository {
  private mockBirthData: BirthData | null = null
  private shouldFail = false
  private failMessage = 'Error al guardar los datos de nacimiento'

  // Spy-able methods for assertion
  readonly createSpy = vi.fn<IBirthDataRepository['create']>()

  constructor() {
    this.setupDefaultBehavior()
  }

  // ---- IBirthDataRepository implementation ----

  async create(_birthData: BirthData): Promise<BirthDataResult> {
    return this.createSpy(_birthData)
  }

  // ---- Helpers ----

  /** Configure the mock to succeed with a custom BirthData (overrides pass-through) */
  withBirthData(birthData: BirthData): this {
    this.mockBirthData = birthData
    return this
  }

  /** Configure the mock to return errors */
  withFailure(message?: string): this {
    this.shouldFail = true
    if (message) this.failMessage = message
    return this
  }

  /** Reset to default state and clear spies */
  reset(): this {
    this.shouldFail = false
    this.failMessage = 'Error al guardar los datos de nacimiento'
    this.mockBirthData = null
    this.createSpy.mockReset()
    this.setupDefaultBehavior()
    return this
  }

  /** Set up default spy implementations (happy path) */
  private setupDefaultBehavior(): void {
    this.createSpy.mockImplementation(async (birthData: BirthData) => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      return { ok: true, data: this.mockBirthData ?? birthData }
    })
  }
}
