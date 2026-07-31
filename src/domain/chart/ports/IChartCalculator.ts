import type { NatalChart } from '@/domain/chart/NatalChart.vo'
import type { BirthData } from '@/domain/birth/BirthData.vo'
import type { UTConversionData } from '@/domain/birth/ports/IBirthToUTConverter'
import type { HouseSystem } from '@/domain/chart/enums'
import type { ZodiacType } from '@/domain/chart/enums'

export type ChartCalculationOptions = {
  houseSystem?: HouseSystem
  zodiac?: ZodiacType
}

export type ChartCalculationResult =
  { ok: true; data: NatalChart } | { ok: false; error: string }

export interface IChartCalculator {
  /**
   * Calculate the natal chart from birth data and UT conversion data.
   * This is a synchronous operation (like toUT()).
   */
  calculate(
    birthData: BirthData,
    utData: UTConversionData,
    options?: ChartCalculationOptions,
  ): ChartCalculationResult
}
