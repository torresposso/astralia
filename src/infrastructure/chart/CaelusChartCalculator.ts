/**
 * CaelusChartCalculator
 *
 * Infrastructure implementation of IChartCalculator using the `caelus` library.
 * Loads ephemeris data lazily on first calculation and caches the Engine singleton.
 */

import type { IChartCalculator, ChartCalculationResult, ChartCalculationOptions } from '@/domain/chart/ports/IChartCalculator'
import type { BirthData } from '@/domain/birth/BirthData.vo'
import type { UTConversionData } from '@/domain/birth/ports/IBirthToUTConverter'
import { CaelusChartMapper } from './CaelusChartMapper'
import { Engine } from 'caelus'
import { loadNodeData } from 'caelus/node'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let engineInstance: Engine | null = null

function getEngine(): Engine {
  if (!engineInstance) {
    const caelusPkgPath = require.resolve('caelus/package.json')
    const dataDir = path.join(path.dirname(caelusPkgPath), 'data')
    const data = loadNodeData(dataDir, 'full', 'full')
    engineInstance = new Engine(data)
  }
  return engineInstance
}

export class CaelusChartCalculator implements IChartCalculator {
  calculate(
    birthData: BirthData,
    utData: UTConversionData,
    options?: ChartCalculationOptions,
  ): ChartCalculationResult {
    try {
      const engine = getEngine()
      const lat = birthData.latitude
      const lonEast = birthData.longitude

      const caelusChart = engine.chartAt(utData.jdUt, lat, lonEast, {
        houseSystem: options?.houseSystem?.toLowerCase() ?? 'placidus',
        zodiac: options?.zodiac?.toLowerCase() ?? 'tropical',
        bodies: ['mean_lilith', 'true_lilith'],
      })

      const lots = engine.lots(caelusChart as any)

      const natalChart = CaelusChartMapper.map(
        { ...caelusChart, lots },
        birthData.id ?? 'unknown',
      )
      return { ok: true, data: natalChart }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      return { ok: false, error: `Error al calcular la carta: ${message}` }
    }
  }
}

/**
 * Reset the engine singleton — useful for testing.
 */
export function resetCaelusEngine(): void {
  engineInstance = null
}
