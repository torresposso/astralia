/**
 * Sign Up API Route — Unit Tests
 *
 * Tests the controller's input validation layer (HTTP boundary).
 * The Container API renders the endpoint without a live server.
 *
 * Per Clean Architecture testing strategy:
 * - Input validation errors (400, 415) → unit tests here
 * - Happy path & auth errors → integration tests (tests/integration/auth-flow.test.ts)
 *
 * The Use Case's domain validation (Name, Email, Password value objects)
 * runs before the repository is called, so BetterAuthRepository is never
 * reached for these input-level tests.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import * as signupEndpoint from './signup'

describe('POST /api/auth/signup — controller input validation', () => {
  let container: AstroContainer

  beforeAll(async () => {
    container = await AstroContainer.create()
  })

  it('should return 415 when Content-Type is not application/json', async () => {
    const response = await container.renderToResponse(signupEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'hello',
      }),
    })

    expect(response.status).toBe(415)
    const data = await response.json()
    expect(data).toEqual({ error: 'Content-Type must be application/json' })
  })

  it('should return 400 when request body is not valid JSON', async () => {
    const response = await container.renderToResponse(signupEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Solicitud inválida' })
  })

  it('should return 400 when name is missing (domain validation)', async () => {
    const response = await container.renderToResponse(signupEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'SecurePass123',
        }),
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Ingresa tu nombre' })
  })

  it('should return 400 when email is missing (domain validation — Email value object)', async () => {
    const response = await container.renderToResponse(signupEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', password: 'SecurePass123' }),
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'El correo electrónico es requerido' })
  })

  it('should return 400 when password is missing (domain validation — Password value object)', async () => {
    const response = await container.renderToResponse(signupEndpoint, {
      routeType: 'endpoint',
      request: new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email: 'user@example.com' }),
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'La contraseña es requerida' })
  })
})
