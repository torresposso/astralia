/**
 * Save Birth Data
 *
 * Owns the birth data save pipeline (create + update), absorbing the former
 * CreateBirthDataUseCase and UpdateBirthDataUseCase:
 * 1. Maps a route-provided BirthDataInput onto the BirthData value object
 *    (VO validation is preserved, including rejection of absent coordinates)
 * 2. Gates the local time through the UT converter (DST policy):
 *    - status 'nonexistent' → rejected with NonexistentTimeError
 *    - status 'ambiguous' → accepted (the library already picks the earliest
 *      candidate) and emits a 'dst-ambiguous' warning
 *    - status 'ok' → no DST warning
 * 3. Verifies existence and ownership on update
 * 4. Persists via the repository
 * 5. Returns typed warnings (WarningCode[]); UI strings are mapped at the
 *    interface layer (routes), never here
 *
 * Following Clean Architecture:
 * - Depends only on domain interfaces (IBirthDataRepository, IBirthToUTConverter, BirthData)
 * - No framework dependencies
 * - Testable by passing mock dependencies
 */

import type { IBirthDataRepository } from '@/domain/birth/ports/IBirthDataRepository'
import type { IBirthToUTConverter } from '@/domain/birth/ports/IBirthToUTConverter'
import { BirthData } from '@/domain/birth/BirthData.vo'
import type { WarningCode } from '@/domain/birth/warnings'
import type { BirthDataError, NotFoundError } from '@/domain/birth/errors'

/**
 * Route-level birth data payload. Coordinates, timezone, and placeName are
 * optional at the boundary; the value object validation rejects them when
 * absent — no sentinel defaults are injected here.
 */
export type BirthDataInput = {
  date: { year: number; month: number; day: number }
  time?: { hour: number; minute: number } | null
  timeUnknown?: boolean
  latitude?: number
  longitude?: number
  timezone?: string
  placeName?: string
}

export type SaveBirthDataOutput =
  | { ok: true; data: BirthData; warnings: WarningCode[] }
  | { ok: false; error: BirthDataError }

const NOT_FOUND_ERROR: NotFoundError = {
  type: 'not-found',
  message: 'Birth data not found',
}

/**
 * Maps a raw HTTP body onto BirthDataInput. Shared by the POST and PUT
 * routes so the body→input mapping lives in one place.
 */
export function toBirthDataInput(
  body: Record<string, unknown>,
): BirthDataInput {
  return {
    date: body.date as { year: number; month: number; day: number },
    time: body.time as { hour: number; minute: number } | null | undefined,
    timeUnknown: body.timeUnknown as boolean | undefined,
    latitude: body.latitude as number | undefined,
    longitude: body.longitude as number | undefined,
    timezone: body.timezone as string | undefined,
    placeName: body.placeName as string | undefined,
  }
}

export class SaveBirthData {
  constructor(
    private readonly repository: IBirthDataRepository,
    private readonly utConverter: IBirthToUTConverter,
  ) {}

  create(input: BirthDataInput, ownerId: string): Promise<SaveBirthDataOutput> {
    return this.save(input, ownerId)
  }

  update(
    id: string,
    input: BirthDataInput,
    ownerId: string,
  ): Promise<SaveBirthDataOutput> {
    return this.save(input, ownerId, id)
  }

  private async save(
    input: BirthDataInput,
    ownerId: string,
    id?: string,
  ): Promise<SaveBirthDataOutput> {
    const warnings: WarningCode[] = []

    // 1. Update only: verify existence and ownership before validating payload
    if (id !== undefined) {
      if (!id.trim()) {
        return {
          ok: false,
          error: {
            type: 'validation',
            message: 'El identificador es requerido',
          },
        }
      }

      const lookup = await this.repository.findById(id)
      if (!lookup.ok) {
        return { ok: false, error: lookup.error }
      }
      if (lookup.data.userId !== ownerId) {
        return { ok: false, error: NOT_FOUND_ERROR }
      }
    }

    // 2. Validate all invariants via the BirthData value object
    const birthDataResult = BirthData.create({
      id,
      userId: ownerId,
      date: input.date,
      time: input.time ?? null,
      timeUnknown: input.timeUnknown ?? false,
      latitude: input.latitude as number,
      longitude: input.longitude as number,
      timezone: input.timezone ?? '',
      placeName: input.placeName ?? '',
    })

    if (!birthDataResult.ok) {
      return {
        ok: false,
        error: { type: 'validation', message: birthDataResult.error },
      }
    }

    const birthData = birthDataResult.value

    // 3. Validate Universal Time (UT) conversion — DST policy gate
    const utResult = this.utConverter.convert(birthData)
    if (!utResult.ok) {
      return {
        ok: false,
        error: { type: 'conversion-failed', message: utResult.error },
      }
    }

    if (utResult.data.status === 'nonexistent') {
      return {
        ok: false,
        error: {
          type: 'nonexistent-time',
          message: 'Birth time does not exist in the given timezone',
        },
      }
    }

    if (utResult.data.status === 'ambiguous') {
      warnings.push('dst-ambiguous')
    }

    // 4. Persist
    const writeResult =
      id !== undefined
        ? await this.repository.update(id, birthData)
        : await this.repository.create(birthData)
    if (!writeResult.ok) {
      return { ok: false, error: writeResult.error }
    }

    // 5. Whole-sign warning: fires when the saved record has no time component
    if (!writeResult.data.hasTime()) {
      warnings.push('whole-sign')
    }

    return { ok: true, data: writeResult.data, warnings }
  }
}
