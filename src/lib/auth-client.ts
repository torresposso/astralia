/**
 * Re-export shim for backward compatibility.
 * The auth client config now lives at src/infrastructure/auth/auth.client.ts
 * to follow DDD + Clean Architecture layers.
 */
export { authClient } from '../infrastructure/auth/auth.client';
