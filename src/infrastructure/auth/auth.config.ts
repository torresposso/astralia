import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/infrastructure/db'

// Configure better-auth from the existing environment (values live in .env).
// Secrets are never hardcoded or rotated here.
const baseURL = process.env.BETTER_AUTH_URL
const secret = process.env.BETTER_AUTH_SECRET

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  secret,
  baseURL,
  trustedOrigins: baseURL ? [baseURL] : [],
  emailAndPassword: {
    enabled: true,
  },
})
