/**
 * BirthData Repository Interface
 *
 * Lives in the domain layer so application use cases depend on
 * the interface, not on infrastructure.
 */

import type { BirthData } from '../BirthData.vo'

export type BirthDataResult =
  | { ok: true; data: BirthData }
  | { ok: false; error: string }

export interface IBirthDataRepository {
  /** Persist a new BirthData record. Returns the stored BirthData or an error. */
  create(birthData: BirthData): Promise<BirthDataResult>

  /** Find a BirthData record by id. Returns the BirthData or null if not found. */
  findById(id: string): Promise<BirthData | null>

  /** Update an existing BirthData record by id. Returns the updated BirthData or an error. */
  update(id: string, birthData: BirthData): Promise<BirthDataResult>

  /** Delete a BirthData record by id. Returns true if deleted, false if not found. */
  delete(id: string): Promise<boolean>
}
