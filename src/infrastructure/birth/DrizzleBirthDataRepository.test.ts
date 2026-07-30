/**
 * DrizzleBirthDataRepository Unit Tests
 *
 * Tests for the concrete IBirthDataRepository implementation using Drizzle.
 * The @/db module is fully mocked — we only test the repository's orchestration
 * logic (calling db.insert, mapping domain objects, handling errors), not drizzle itself.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleBirthDataRepository } from "./DrizzleBirthDataRepository";
import { BirthData } from "@/domain/birth/BirthData.vo";

// ---------------------------------------------------------------------------
// Mock @/db — vi.mock is hoisted to the top by vitest
// ---------------------------------------------------------------------------
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the mocked db reference for assertion calls. */
async function getMockedDb() {
  const { db } = await import("@/db");
  return db;
}

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const validProps = {
  userId: "user_123",
  date: { year: 1990, month: 6, day: 10 },
  time: { hour: 10, minute: 30 } as { hour: number; minute: number } | null,
  timeUnknown: false,
  latitude: 10.39,
  longitude: -75.5,
  timezone: "America/Bogota",
  placeName: "Cartagena, Bolívar, Colombia",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DrizzleBirthDataRepository", () => {
  let repository: DrizzleBirthDataRepository;
  let validBirthData: BirthData;

  beforeEach(() => {
    repository = new DrizzleBirthDataRepository();
    vi.clearAllMocks();

    const result = BirthData.create(validProps);
    if (result.ok) {
      validBirthData = result.value;
    } else {
      throw new Error(`Failed to create test BirthData: ${result.error}`);
    }
  });

  // -----------------------------------------------------------------------
  // create
  // -----------------------------------------------------------------------
  describe("create", () => {
    it("should insert birth data into the database and return success", async () => {
      const result = await repository.create(validBirthData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe(validBirthData);
      }
    });

    it("should call db.insert with correct id generated", async () => {
      const mockDb = await getMockedDb();

      await repository.create(validBirthData);

      expect(mockDb.insert).toHaveBeenCalledOnce();
      const calls = vi.mocked(mockDb.insert).mock.calls;
      expect(calls[0][0]).toBeDefined();
    });

    it("should call db.insert(...).values() with correct mapped columns", async () => {
      const mockDb = await getMockedDb();
      // Spy on the values mock
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(mockDb.insert).mockReturnValue({ values: mockValues } as any);

      await repository.create(validBirthData);

      expect(mockValues).toHaveBeenCalledOnce();
      const valuesArg = mockValues.mock.calls[0][0];

      expect(valuesArg.userId).toBe("user_123");
      expect(valuesArg.birthYear).toBe(1990);
      expect(valuesArg.birthMonth).toBe(6);
      expect(valuesArg.birthDay).toBe(10);
      expect(valuesArg.birthHour).toBe(10);
      expect(valuesArg.birthMinute).toBe(30);
      expect(valuesArg.timeUnknown).toBe(false);
      expect(valuesArg.latitude).toBe(10.39);
      expect(valuesArg.longitude).toBe(-75.5);
      expect(valuesArg.timezone).toBe("America/Bogota");
      expect(valuesArg.placeName).toBe("Cartagena, Bolívar, Colombia");
      // id should be a UUID string
      expect(valuesArg.id).toEqual(expect.any(String));
    });

    it("should map null time fields when time is unknown", async () => {
      const mockDb = await getMockedDb();
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(mockDb.insert).mockReturnValue({ values: mockValues } as any);

      const noTimeResult = BirthData.create({
        ...validProps,
        time: null,
        timeUnknown: true,
      });
      if (!noTimeResult.ok) throw new Error("Failed to create no-time BirthData");

      await repository.create(noTimeResult.value);

      const valuesArg = mockValues.mock.calls[0][0];
      expect(valuesArg.birthHour).toBeNull();
      expect(valuesArg.birthMinute).toBeNull();
      expect(valuesArg.timeUnknown).toBe(true);
    });

    it("should return error when database insertion fails", async () => {
      const mockDb = await getMockedDb();
      vi.mocked(mockDb.insert).mockReturnValueOnce({
        values: vi.fn().mockRejectedValue(new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed")),
      } as any);

      const result = await repository.create(validBirthData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("SQLITE_CONSTRAINT");
      }
    });

    it("should handle non-Error exceptions gracefully", async () => {
      const mockDb = await getMockedDb();
      vi.mocked(mockDb.insert).mockReturnValueOnce({
        values: vi.fn().mockRejectedValue("string error"),
      } as any);

      const result = await repository.create(validBirthData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("desconocido");
      }
    });
  });
});
