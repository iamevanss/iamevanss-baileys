import assert from 'node:assert/strict'
import {
  PAIRING_CODE_LENGTH,
  generatePairingCode,
  isValidPairingCode,
  normalizePairingCode,
  getChannelForceJoinConfig,
  isChannelForceJoinConfigured
} from '../lib/index.js'

const generated = generatePairingCode()
assert.equal(generated.length, PAIRING_CODE_LENGTH)
assert.equal(isValidPairingCode(generated), true)
assert.equal(normalizePairingCode(` ${generated.toLowerCase()} `), generated)
assert.equal(isValidPairingCode('12345678'), true)
assert.equal(isValidPairingCode('1234567'), false)
assert.equal(isValidPairingCode('1234567!'), false)

const forceJoin = getChannelForceJoinConfig()
assert.equal(forceJoin.enabled, false)
assert.equal(forceJoin.url, null)
assert.equal(isChannelForceJoinConfigured(), false)

console.log('Smoke tests passed')
