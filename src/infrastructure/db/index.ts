import { existsSync } from 'node:fs'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export const db = drizzle({ client, schema })
