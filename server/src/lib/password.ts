import { hash, verify } from '@node-rs/argon2'

// Argon2id (the library default) with OWASP-recommended cost settings.
const options = { memoryCost: 19_456, timeCost: 2, parallelism: 1 }

export const hashPassword = (password: string) => hash(password, options)

export async function verifyPassword(stored: string, password: string) {
  try {
    return await verify(stored, password)
  } catch {
    return false
  }
}

// Verified against when the email is unknown, so both cases take the same time.
let dummy: Promise<string> | undefined
export const dummyHash = () => (dummy ??= hashPassword('not-a-real-password-' + Math.random()))
