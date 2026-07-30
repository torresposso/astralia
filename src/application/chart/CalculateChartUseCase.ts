/**
 * Calculate Chart Use Case
 *
 * Orchestrates the natal chart calculation flow:
 * 1. Loads birth data from the repository
 * 2. Verifies the birth data belongs to the requesting user
 * 3. Converts local time to Universal Time (UT)
 * 4. Calculates the natal chart via IChartCalculator
 * 5. Returns a warning when time is unknown
 */

import type { IBirthDataRepository } from '@/domain/birth/repositories/IBirthDataRepository'
import type { IBirthToUTConverter } from '@/domain/birth/ports/IBirthToUTConverter'
import type { IChartCalculator } from '@/domain/chart/ports/IChartCalculator'
import type { NatalChart } from '@/domain/chart/NatalChart.vo'

export type CalculateChartInput = {
  birthDataId: string
  userId: string
}

export type CalculateChartOutput =
  | { ok: true; data: NatalChart; warning?: string }
  | { ok: false; error: string; status?: number }

export class CalculateChartUseCase {
  constructor(
    private readonly repository: IBirthDataRepository,
    private readonly utConverter: IBirthToUTConverter,
    private readonly chartCalculator: IChartCalculator,
  ) {}

  async execute(input: CalculateChartInput): Promise<CalculateChartOutput> {
    // 1. Get the birth data
    const birthData = await this.repository.findById(input.birthDataId)
    if (!birthData) {
      return { ok: false, error: 'Datos de nacimiento no encontrados', status: 404 }
    }

    // 2. Verify ownership
    if (birthData.userId !== input.userId) {
      return { ok: false, error: 'No autorizado', status: 401 }
    }

    // 3. Convert to UT
    const utResult = this.utConverter.convert(birthData)
    if (!utResult.ok) {
      return { ok: false, error: utResult.error }
    }

    // 4. Calculate chart
    const chartResult = this.chartCalculator.calculate(birthData, utResult.data)
    if (!chartResult.ok) {
      return { ok: false, error: chartResult.error }
    }

    // 5. Return with warning if time unknown
    const output: CalculateChartOutput = { ok: true, data: chartResult.data }
    if (!birthData.hasTime()) {
      output.warning =
        'La hora de nacimiento no fue registrada. Los cálculos de casas son aproximados.'
    }

    return output
  }
}
