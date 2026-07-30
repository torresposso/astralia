/**
 * Mock BirthData Repository
 *
 * Shared mock for IBirthDataRepository used across all Application test files.
 */

import { vi } from 'vitest'
import type { IBirthDataRepository, BirthDataResult } from '@/domain/birth/repositories/IBirthDataRepository'
import { BirthData } from '@/domain/birth/BirthData.vo'

export class MockBirthDataRepository implements IBirthDataRepository {
  private store = new Map<string, BirthData>()
  private shouldFail = false
  private failMessage = 'Error en el repositorio de datos de nacimiento'

  // Spy-able methods for assertion
  readonly createSpy = vi.fn<IBirthDataRepository['create']>()
  readonly findByIdSpy = vi.fn<IBirthDataRepository['findById']>()
  readonly updateSpy = vi.fn<IBirthDataRepository['update']>()
  readonly deleteSpy = vi.fn<IBirthDataRepository['delete']>()

  constructor() {
    this.setupDefaultBehavior()
  }

  // ---- IBirthDataRepository implementation ----

  async create(birthData: BirthData): Promise<BirthDataResult> {
    return this.createSpy(birthData)
  }

  async findById(id: string): Promise<BirthData | null> {
    return this.findByIdSpy(id)
  }

  async update(id: string, birthData: BirthData): Promise<BirthDataResult> {
    return this.updateSpy(id, birthData)
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteSpy(id)
  }

  // ---- Helpers ----

  /** Seed the mock store with a BirthData */
  seed(id: string, birthData: BirthData): this {
    this.store.set(id, birthData)
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
    this.failMessage = 'Error en el repositorio de datos de nacimiento'
    this.store.clear()
    this.createSpy.mockReset()
    this.findByIdSpy.mockReset()
    this.updateSpy.mockReset()
    this.deleteSpy.mockReset()
    this.setupDefaultBehavior()
    return this
  }

  /** Set up default spy implementations */
  private setupDefaultBehavior(): void {
    this.createSpy.mockImplementation(async (birthData: BirthData) => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      const id = birthData.id ?? 'mock_birth_data_id'
      const saved = BirthData.from({ ...birthData.toJSON(), id, date: birthData.date, time: birthData.time } as any)
      this.store.set(id, saved)
      return { ok: true, data: saved }
    })

    this.findByIdSpy.mockImplementation(async (id: string) => {
      if (this.shouldFail) return null
      return this.store.get(id) ?? null
    })

    this.updateSpy.mockImplementation(async (id: string, birthData: BirthData) => {
      if (this.shouldFail) return { ok: false, error: this.failMessage }
      const updated = BirthData.from({ ...birthData.toJSON(), id, date: birthData.date, time: birthData.time } as any)
      this.store.set(id, updated)
      return { ok: true, data: updated }
    })

    this.deleteSpy.mockImplementation(async (id: string) => {
      if (this.shouldFail) return false
      return this.store.delete(id)
    })
  }
}
