/**
 * BirthData Repository Interface
 *
 * Lives in the domain layer so application use cases depend on
 * the interface, not on infrastructure.
 *
 * Following the same pattern as IAuthRepository — a small interface
 * that pays for itself in testability.
 */

import type { BirthData } from '../BirthData.vo'

export type BirthDataResult =
  | { ok: true; data: BirthData }
  | { ok: false; error: string }

export interface IBirthDataRepository {
  /** Persist a new BirthData record. Returns the stored BirthData or an error. */
  create(birthData: BirthData): Promise<BirthDataResult>
}
