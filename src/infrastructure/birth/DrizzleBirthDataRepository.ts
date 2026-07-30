/**
 * Drizzle BirthData Repository
 *
 * Concrete implementation of IBirthDataRepository using Drizzle ORM.
 * Maps between the domain BirthData value object and the birth_data table.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { birthData as birthDataTable } from "@/db/schema";
import { BirthData } from "@/domain/birth/BirthData.vo";
import type { IBirthDataRepository, BirthDataResult } from "@/domain/birth/repositories/IBirthDataRepository";

export class DrizzleBirthDataRepository implements IBirthDataRepository {
  async create(data: BirthData): Promise<BirthDataResult> {
    try {
      const id = data.id ?? crypto.randomUUID();

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
      });

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
      });

      return { ok: true, data: saved };
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Error desconocido al guardar los datos de nacimiento";
      return { ok: false, error: message };
    }
  }

  async findById(id: string): Promise<BirthData | null> {
    try {
      const rows = await db
        .select()
        .from(birthDataTable)
        .where(eq(birthDataTable.id, id))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      const hasTime = row.birthHour !== null && row.birthMinute !== null;

      return BirthData.from({
        id: row.id,
        userId: row.userId,
        date: {
          year: row.birthYear,
          month: row.birthMonth,
          day: row.birthDay,
        },
        time: hasTime && !row.timeUnknown ? { hour: row.birthHour!, minute: row.birthMinute! } : null,
        timeUnknown: Boolean(row.timeUnknown),
        latitude: row.latitude,
        longitude: row.longitude,
        timezone: row.timezone,
        placeName: row.placeName,
      });
    } catch {
      return null;
    }
  }

  async findByUserId(userId: string): Promise<BirthData | null> {
    try {
      const rows = await db
        .select()
        .from(birthDataTable)
        .where(eq(birthDataTable.userId, userId))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      const hasTime = row.birthHour !== null && row.birthMinute !== null;

      return BirthData.from({
        id: row.id,
        userId: row.userId,
        date: {
          year: row.birthYear,
          month: row.birthMonth,
          day: row.birthDay,
        },
        time: hasTime && !row.timeUnknown ? { hour: row.birthHour!, minute: row.birthMinute! } : null,
        timeUnknown: Boolean(row.timeUnknown),
        latitude: row.latitude,
        longitude: row.longitude,
        timezone: row.timezone,
        placeName: row.placeName,
      });
    } catch {
      return null;
    }
  }

  async update(id: string, data: BirthData): Promise<BirthDataResult> {
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
        .where(eq(birthDataTable.id, id));

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
      });

      return { ok: true, data: updated };
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Error desconocido al actualizar los datos de nacimiento";
      return { ok: false, error: message };
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(birthDataTable)
        .where(eq(birthDataTable.id, id));

      const rowsAffected = (result as { rowsAffected?: number })?.rowsAffected;
      if (typeof rowsAffected === 'number') {
        return rowsAffected > 0;
      }
      return true;
    } catch {
      return false;
    }
  }
}
