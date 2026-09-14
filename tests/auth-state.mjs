import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { useSqliteAuthState } from '../lib/Utils/use-sqlite-auth-state.js'

const folder = await mkdtemp(join(tmpdir(), 'iamvanss-baileys-'))
const dbPath = join(folder, 'auth.db')

try {
  const first = await useSqliteAuthState(dbPath)
  assert.ok(first.state.creds)
  assert.ok(first.state.creds.noiseKey)

  const testKey = 'smoke-test'
  const testValue = Buffer.from('iamvanss')
  await first.state.keys.set({ 'pre-key': { [testKey]: testValue } })
  const loaded = await first.state.keys.get('pre-key', [testKey])
  assert.ok(Buffer.isBuffer(loaded[testKey]))
  assert.equal(loaded[testKey].toString(), 'iamvanss')

  await first.state.keys.set({ 'pre-key': { [testKey]: null } })
  const removed = await first.state.keys.get('pre-key', [testKey])
  assert.equal(removed[testKey], undefined)
  first.close()

  const second = await useSqliteAuthState(dbPath)
  assert.ok(second.state.creds.noiseKey)
  second.close()

  console.log('SQLite auth-state smoke test passed')
} finally {
  await rm(folder, { recursive: true, force: true })
}
