/**
 * GET /api/chart/natal?birthDataId=<id>
 *
 * Calculates the natal chart for a user's birth data.
 * Chart is ephemeral — calculated on demand, never persisted.
 */

import type { APIRoute } from 'astro'
import { CalculateChart } from '@/application/chart/CalculateChart'
import { DrizzleBirthDataRepository } from '@/infrastructure/birth/DrizzleBirthDataRepository'
import { CaelusBirthConverter } from '@/infrastructure/birth/CaelusBirthConverter'
import { CaelusChartCalculator } from '@/infrastructure/chart/CaelusChartCalculator'

export const GET: APIRoute = async ({ locals, url }) => {
  const birthDataId = url.searchParams.get('birthDataId')

  if (!birthDataId) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'El parámetro birthDataId es requerido',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const userId = locals?.user?.id ?? ''

  if (!userId) {
    return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const useCase = new CalculateChart(
    new DrizzleBirthDataRepository(),
    new CaelusBirthConverter(),
    new CaelusChartCalculator(),
  )

  const result = await useCase.execute({ birthDataId, userId })

  if (!result.ok) {
    return new Response(JSON.stringify({ ok: false, error: result.error }), {
      status: result.status ?? 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body: Record<string, unknown> = { ok: true, data: result.data.toJSON() }
  if (result.warning) {
    body.warning = result.warning
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
