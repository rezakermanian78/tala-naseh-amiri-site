import { existsSync } from 'node:fs'

/** Loads ./.env for local scripts if present (Node ≥ 20.12). Production uses real env vars. */
export function loadEnvFile() {
  if (existsSync('.env')) process.loadEnvFile('.env')
}
