/**
 * BirthData Repository Interface
 *
 * Lives in the domain layer so application use cases depend on
 * the interface, not on infrastructure.
 *
 * Truthfulness contract (grilling decision A):
 * - findById distinguishes NotFoundError from UnavailableError so callers
 *   never mistake a DB outage for a missing record
 * - create/update/delete report UnavailableError on DB failure instead of
 *   collapsing into not-found
 */

import type { BirthData } from '../BirthData.vo'
import type { NotFoundError, UnavailableError } from '../errors'

export type BirthDataWriteResult =
  { ok: true; data: BirthData } | { ok: false; error: UnavailableError }

export type BirthDataLookupResult =
  | { ok: true; data: BirthData }
  | { ok: false; error: NotFoundError | UnavailableError }

export type BirthDataDeleteResult =
  { ok: true } | { ok: false; error: NotFoundError | UnavailableError }

export interface IBirthDataRepository {
  /** Persist a new BirthData record. Returns the stored BirthData or an error. */
  create(birthData: BirthData): Promise<BirthDataWriteResult>

  /** Find a BirthData record by id. NotFoundError when absent, UnavailableError on DB failure. */
  findById(id: string): Promise<BirthDataLookupResult>

  /** Find a BirthData record by userId. Returns the BirthData or null if not found. */
  findByUserId(userId: string): Promise<BirthData | null>

  /** Update an existing BirthData record by id. Returns the updated BirthData or an error. */
  update(id: string, birthData: BirthData): Promise<BirthDataWriteResult>

  /** Delete a BirthData record by id. NotFoundError when absent, UnavailableError on DB failure. */
  delete(id: string): Promise<BirthDataDeleteResult>
}
