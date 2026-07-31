/**
 * Drizzle BirthData Repository
 *
 * Concrete implementation of IBirthDataRepository using Drizzle ORM.
 * Maps between the domain BirthData value object and the birth_data table.
 *
 * Truthful error modes: DB failures surface as UnavailableError; a missing
 * row surfaces as NotFoundError — callers can distinguish the two.
 */

import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import { birthData as birthDataTable } from '@/infrastructure/db/schema'
import { BirthData } from '@/domain/birth/BirthData.vo'
import type {
  IBirthDataRepository,
  BirthDataDeleteResult,
  BirthDataLookupResult,
  BirthDataWriteResult,
} from '@/domain/birth/ports/IBirthDataRepository'
import type { UnavailableError } from '@/domain/birth/errors'

function unavailableError(error: unknown, fallback: string): UnavailableError {
  return {
    type: 'unavailable',
    message: error instanceof Error ? error.message : fallback,
  }
}

export class DrizzleBirthDataRepository implements IBirthDataRepository {
  async create(data: BirthData): Promise<BirthDataWriteResult> {
    try {
      const id = data.id ?? crypto.randomUUID()

      await db.insert(birthDataTable).values({
        id,
        userId: data.userId,
        birthYear: data.date.year,
        birthMonth: data.date.month,
        birthDay: data.date.day,
        birthHour: data.time?.hour ?? null,
        birthMinute: data.time?.minute ?? null,
        timeUnknown: data.timeUnknown,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        placeName: data.placeName,
      })

      const saved = BirthData.from({
        id,
        userId: data.userId,
        date: data.date,
        time: data.time,
        timeUnknown: data.timeUnknown,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        placeName: data.placeName,
      })

      return { ok: true, data: saved }
    } catch (error) {
      return {
        ok: false,
        error: unavailableError(
          error,
          'Error desconocido al guardar los datos de nacimiento',
        ),
      }
    }
  }

  private mapRowToBirthData(
    row: typeof birthDataTable.$inferSelect,
  ): BirthData {
    const hasTime = row.birthHour !== null && row.birthMinute !== null
    return BirthData.from({
      id: row.id,
      userId: row.userId,
      date: {
        year: row.birthYear,
        month: row.birthMonth,
        day: row.birthDay,
      },
      time:
        hasTime && !row.timeUnknown
          ? { hour: row.birthHour!, minute: row.birthMinute! }
          : null,
      timeUnknown: Boolean(row.timeUnknown),
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
      placeName: row.placeName,
    })
  }

  async findById(id: string): Promise<BirthDataLookupResult> {
    try {
      const rows = await db
        .select()
        .from(birthDataTable)
        .where(eq(birthDataTable.id, id))
        .limit(1)

      if (rows.length === 0) {
        return {
          ok: false,
          error: { type: 'not-found', message: 'Birth data not found' },
        }
      }
      return { ok: true, data: this.mapRowToBirthData(rows[0]) }
    } catch (error) {
      return {
        ok: false,
        error: unavailableError(
          error,
          'Error desconocido al buscar los datos de nacimiento',
        ),
      }
    }
  }

  async findByUserId(userId: string): Promise<BirthData | null> {
    try {
      const rows = await db
        .select()
        .from(birthDataTable)
        .where(eq(birthDataTable.userId, userId))
        .limit(1)

      if (rows.length === 0) return null
      return this.mapRowToBirthData(rows[0])
    } catch {
      return null
    }
  }

  async update(id: string, data: BirthData): Promise<BirthDataWriteResult> {
    try {
      await db
        .update(birthDataTable)
        .set({
          userId: data.userId,
          birthYear: data.date.year,
          birthMonth: data.date.month,
          birthDay: data.date.day,
          birthHour: data.time?.hour ?? null,
          birthMinute: data.time?.minute ?? null,
          timeUnknown: data.timeUnknown,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          placeName: data.placeName,
          updatedAt: new Date(),
        })
        .where(eq(birthDataTable.id, id))

      const updated = BirthData.from({
        id,
        userId: data.userId,
        date: data.date,
        time: data.time,
        timeUnknown: data.timeUnknown,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        placeName: data.placeName,
      })

      return { ok: true, data: updated }
    } catch (error) {
      return {
        ok: false,
        error: unavailableError(
          error,
          'Error desconocido al actualizar los datos de nacimiento',
        ),
      }
    }
  }

  async delete(id: string): Promise<BirthDataDeleteResult> {
    try {
      const result = await db
        .delete(birthDataTable)
        .where(eq(birthDataTable.id, id))
        .returning({ id: birthDataTable.id })

      if (Array.isArray(result)) {
        return result.length > 0
          ? { ok: true }
          : {
              ok: false,
              error: { type: 'not-found', message: 'Birth data not found' },
            }
      }

      const rowsAffected = (result as { rowsAffected?: number })?.rowsAffected
      if (typeof rowsAffected === 'number') {
        return rowsAffected > 0
          ? { ok: true }
          : {
              ok: false,
              error: { type: 'not-found', message: 'Birth data not found' },
            }
      }

      return {
        ok: false,
        error: { type: 'not-found', message: 'Birth data not found' },
      }
    } catch (error) {
      return {
        ok: false,
        error: unavailableError(
          error,
          'Error desconocido al eliminar los datos de nacimiento',
        ),
      }
    }
  }
}
