import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { access } from 'node:fs/promises'

const required = [
  'lib/index.js',
  'lib/Socket/index.js',
  'lib/Features/pairing.js',
  'lib/Features/channel-force-join.js',
  'lib/branding.js',
  'lib/Utils/use-sqlite-auth-state.js',
  'lib/Store/make-cache-manager-store.js',
  'WAProto/index.js',
  'WAProto/index.d.ts',
  'LICENSE',
  'README.md'
]

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
assert.equal(pkg.name, '@iamvanss/baileys')
assert.equal(pkg.license, 'MIT')
assert.equal(pkg.main, 'lib/index.js')
assert.ok(pkg.files.includes('lib/**/*'))
assert.ok(pkg.files.includes('WAProto/**/*'))

for (const file of required) await access(file)

const sourceFiles = [
  'lib/index.js',
  'lib/Store/make-cache-manager-store.js',
  'lib/Utils/use-sqlite-auth-state.js',
  'lib/Features/pairing.js',
  'lib/Features/channel-force-join.js',
  'lib/branding.js'
]

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8')
  assert.ok(!source.includes("WAProto/compiler.js"), `${file} contains a stale WAProto/compiler.js import`)
}

const index = await readFile('lib/index.js', 'utf8')
assert.ok(index.includes("./Features/index.js"))
assert.ok(index.includes("./Store/index.js"))
assert.ok(index.includes("./branding.js"))

const pairing = await readFile('lib/Features/pairing.js', 'utf8')
assert.ok(pairing.includes('PAIRING_CODE_LENGTH'))
assert.ok(pairing.includes('generatePairingCode'))

const branding = await readFile('lib/branding.js', 'utf8')
assert.ok(branding.includes('███████╗████████╗'))
assert.ok(branding.includes('https://t.me/heisevanss'))

console.log('Package validation passed')
