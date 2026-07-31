/**
 * CaelusChartCalculator
 *
 * Infrastructure implementation of IChartCalculator using the `caelus` library.
 * Loads ephemeris data lazily on first calculation and caches the Engine singleton.
 */

import type {
  IChartCalculator,
  ChartCalculationResult,
  ChartCalculationOptions,
} from '@/domain/chart/ports/IChartCalculator'
import type { BirthData } from '@/domain/birth/BirthData.vo'
import type { UTConversionData } from '@/domain/birth/ports/IBirthToUTConverter'
import { HouseSystem, ZodiacType } from '@/domain/chart/enums'
import type {
  HouseSystem as CaelusHouseSystem,
  Zodiac as CaelusZodiac,
} from 'caelus'
import { CaelusChartMapper } from './CaelusChartMapper'
import { Engine } from 'caelus'
import { loadNodeData } from 'caelus/node'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * Exhaustive mapping of domain house systems to Caelus canonical ids.
 * Kept at the adapter boundary: adding a new domain enum member makes the
 * Record literal fail to compile here instead of silently passing an
 * invalid id to caelus.
 */
const CAELUS_HOUSE_SYSTEMS: Record<HouseSystem, CaelusHouseSystem> = {
  [HouseSystem.PLACIDUS]: 'placidus',
}

/**
 * Exhaustive mapping of domain zodiac types to Caelus canonical ids.
 */
const CAELUS_ZODIACS: Record<ZodiacType, CaelusZodiac> = {
  [ZodiacType.TROPICAL]: 'tropical',
}

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
        // Domain enums map to caelus canonical ids via the exhaustive local
        // Records above; defaults match caelus' own defaults (Placidus, tropical).
        houseSystem: options?.houseSystem
          ? CAELUS_HOUSE_SYSTEMS[options.houseSystem]
          : 'placidus',
        zodiac: options?.zodiac ? CAELUS_ZODIACS[options.zodiac] : 'tropical',
        bodies: ['mean_lilith', 'true_lilith'],
      })

      const lots = engine.lots(caelusChart)

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
