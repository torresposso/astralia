/**
 * Drizzle BirthData Repository
 *
 * Concrete implementation of IBirthDataRepository using Drizzle ORM.
 * Maps between the domain BirthData value object and the birth_data table.
 *
 * Lives in the infrastructure layer — depends on the domain port (IBirthDataRepository),
 * the Drizzle ORM, and the DB schema. The domain layer knows nothing about Drizzle.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { birthData as birthDataTable } from "@/db/schema";
import { BirthData } from "@/domain/birth/BirthData.vo";
import type { IBirthDataRepository, BirthDataResult } from "@/domain/birth/repositories/IBirthDataRepository";

export class DrizzleBirthDataRepository implements IBirthDataRepository {
  async create(data: BirthData): Promise<BirthDataResult> {
    try {
      const id = crypto.randomUUID();

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

      return { ok: true, data };
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Error desconocido al guardar los datos de nacimiento";
      return { ok: false, error: message };
    }
  }
}
