/**
 * Mock Birth Data Repository
 *
 * Shared mock for IBirthDataRepository used across all Application test files.
 *
 * Truthful failure modes mirror the port contract:
 * - a store miss returns NotFoundError
 * - withUnavailable() makes every operation report UnavailableError
 *   (never a fake null / false)
 */

import { vi } from 'vitest'
import type {
  IBirthDataRepository,
  BirthDataDeleteResult,
  BirthDataLookupResult,
  BirthDataWriteResult,
} from '@/domain/birth/ports/IBirthDataRepository'
import { BirthData, type BirthDataProps } from '@/domain/birth/BirthData.vo'

export class MockBirthDataRepository implements IBirthDataRepository {
  private store = new Map<string, BirthData>()
  private unavailable = false
  private unavailableMessage = 'Birth data store unavailable'

  // Spy-able methods for assertion
  readonly createSpy = vi.fn<IBirthDataRepository['create']>()
  readonly findByIdSpy = vi.fn<IBirthDataRepository['findById']>()
  readonly findByUserIdSpy = vi.fn<IBirthDataRepository['findByUserId']>()
  readonly updateSpy = vi.fn<IBirthDataRepository['update']>()
  readonly deleteSpy = vi.fn<IBirthDataRepository['delete']>()

  constructor() {
    this.setupDefaultBehavior()
  }

  // ---- IBirthDataRepository implementation ----

  async create(birthData: BirthData): Promise<BirthDataWriteResult> {
    return this.createSpy(birthData)
  }

  async findById(id: string): Promise<BirthDataLookupResult> {
    return this.findByIdSpy(id)
  }

  async findByUserId(userId: string): Promise<BirthData | null> {
    return this.findByUserIdSpy(userId)
  }

  async update(
    id: string,
    birthData: BirthData,
  ): Promise<BirthDataWriteResult> {
    return this.updateSpy(id, birthData)
  }

  async delete(id: string): Promise<BirthDataDeleteResult> {
    return this.deleteSpy(id)
  }

  // ---- Helpers ----

  /** Seed the mock store with a BirthData */
  seed(id: string, birthData: BirthData): this {
    this.store.set(id, birthData)
    return this
  }

  /** Configure the mock to report UnavailableError on every operation */
  withUnavailable(message?: string): this {
    this.unavailable = true
    if (message) this.unavailableMessage = message
    return this
  }

  /** Reset to default state and clear spies */
  reset(): this {
    this.unavailable = false
    this.unavailableMessage = 'Birth data store unavailable'
    this.store.clear()
    this.createSpy.mockReset()
    this.findByIdSpy.mockReset()
    this.findByUserIdSpy.mockReset()
    this.updateSpy.mockReset()
    this.deleteSpy.mockReset()
    this.setupDefaultBehavior()
    return this
  }

  /** Set up default spy implementations */
  private setupDefaultBehavior(): void {
    this.createSpy.mockImplementation(async (birthData: BirthData) => {
      if (this.unavailable) {
        return {
          ok: false,
          error: { type: 'unavailable', message: this.unavailableMessage },
        }
      }
      const id = birthData.id ?? 'mock_birth_data_id'
      const saved = BirthData.from({
        ...birthData.toJSON(),
        id,
        date: birthData.date,
        time: birthData.time,
      } as unknown as BirthDataProps)
      this.store.set(id, saved)
      return { ok: true, data: saved }
    })

    this.findByIdSpy.mockImplementation(async (id: string) => {
      if (this.unavailable) {
        return {
          ok: false,
          error: { type: 'unavailable', message: this.unavailableMessage },
        }
      }
      const found = this.store.get(id)
      if (!found) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      return { ok: true, data: found }
    })

    this.findByUserIdSpy.mockImplementation(async (userId: string) => {
      if (this.unavailable) return null
      for (const data of this.store.values()) {
        if (data.userId === userId) return data
      }
      return null
    })

    this.updateSpy.mockImplementation(
      async (id: string, birthData: BirthData) => {
        if (this.unavailable) {
          return {
            ok: false,
            error: { type: 'unavailable', message: this.unavailableMessage },
          }
        }
        const updated = BirthData.from({
          ...birthData.toJSON(),
          id,
          date: birthData.date,
          time: birthData.time,
        } as unknown as BirthDataProps)
        this.store.set(id, updated)
        return { ok: true, data: updated }
      },
    )

    this.deleteSpy.mockImplementation(async (id: string) => {
      if (this.unavailable) {
        return {
          ok: false,
          error: { type: 'unavailable', message: this.unavailableMessage },
        }
      }
      if (!this.store.has(id)) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      this.store.delete(id)
      return { ok: true }
    })
  }
}
