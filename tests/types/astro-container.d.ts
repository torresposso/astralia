/**
 * Test-only module augmentation for the Astro Container API.
 *
 * `experimental_AstroContainer.renderToResponse()` accepts endpoint modules at
 * runtime (the container routes `routeType: 'endpoint'` straight to the module
 * namespace instead of wrapping it as a component), but the public typing only
 * models `AstroComponentFactory`. This overload documents the endpoint
 * contract so endpoint tests keep full typing (`locals`, `params`, `request`)
 * without per-call `as any` casts.
 */
import type { APIRoute } from 'astro'

declare module 'astro/container' {
  interface experimental_AstroContainer {
    renderToResponse(
      component: Record<string, APIRoute>,
      options: ContainerRenderOptions & { routeType: 'endpoint' },
    ): Promise<Response>
  }
}
