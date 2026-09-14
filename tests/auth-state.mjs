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

  const testKey = { keyId: 'smoke-test', value: Buffer.from('iamvanss') }
  await first.state.keys.set({ 'app-state-sync-key': { [testKey.keyId]: testKey.value } })
  const loaded = await first.state.keys.get('app-state-sync-key', [testKey.keyId])
  assert.ok(loaded[testKey.keyId])
  assert.equal(Buffer.from(loaded[testKey.keyId].keyData || loaded[testKey.keyId]).toString(), 'iamvanss')

  await first.state.keys.set({ 'app-state-sync-key': { [testKey.keyId]: null } })
  const removed = await first.state.keys.get('app-state-sync-key', [testKey.keyId])
  assert.equal(removed[testKey.keyId], undefined)
  first.close()

  const second = await useSqliteAuthState(dbPath)
  assert.ok(second.state.creds.noiseKey)
  second.close()

  console.log('SQLite auth-state smoke test passed')
} finally {
  await rm(folder, { recursive: true, force: true })
}
