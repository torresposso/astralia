/**
 * DrizzleBirthDataRepository Unit Tests
 *
 * Tests for the concrete IBirthDataRepository implementation using Drizzle.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleBirthDataRepository } from "./DrizzleBirthDataRepository";
import { BirthData } from "@/domain/birth/BirthData.vo";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

async function getMockedDb() {
  const { db } = await import("@/db");
  return db;
}

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

  describe("create", () => {
    it("should insert birth data into the database and return success", async () => {
      const result = await repository.create(validBirthData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.userId).toBe(validBirthData.userId);
        expect(result.data.id).toBeDefined();
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

  describe("findById", () => {
    it("should return BirthData when record exists", async () => {
      const mockDb = await getMockedDb();
      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "bd_123",
                userId: "user_123",
                birthYear: 1990,
                birthMonth: 6,
                birthDay: 10,
                birthHour: 10,
                birthMinute: 30,
                timeUnknown: false,
                latitude: 10.39,
                longitude: -75.5,
                timezone: "America/Bogota",
                placeName: "Cartagena, Bolívar, Colombia",
              },
            ]),
          }),
        }),
      } as any);

      const result = await repository.findById("bd_123");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("bd_123");
      expect(result?.placeName).toBe("Cartagena, Bolívar, Colombia");
    });

    it("should return null when record does not exist or db throws", async () => {
      const mockDb = await getMockedDb();
      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await repository.findById("non_existent");
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update record in db and return updated BirthData", async () => {
      const mockDb = await getMockedDb();
      const mockSet = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(mockDb.update).mockReturnValue({ set: mockSet } as any);

      const result = await repository.update("bd_123", validBirthData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBe("bd_123");
      }
    });
  });

  describe("delete", () => {
    it("should delete record from db and return true", async () => {
      const mockDb = await getMockedDb();
      vi.mocked(mockDb.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      } as any);

      const result = await repository.delete("bd_123");
      expect(result).toBe(true);
    });
  });
});
