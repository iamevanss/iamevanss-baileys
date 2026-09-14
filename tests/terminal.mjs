import assert from 'node:assert/strict'
import { printReferenceBanner } from '../lib/Utils/terminal.js'

const output = []
const originalLog = console.log
console.log = (...args) => output.push(args.join(' '))

try {
  printReferenceBanner()
} finally {
  console.log = originalLog
}

const stripAnsi = value => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
const plain = stripAnsi(output.join('\n'))

assert.equal(output.length, 10)
assert.ok(plain.includes('━'.repeat(100)))
assert.ok(plain.includes('██████████████╗╗████████████████╗╗'))
assert.ok(plain.includes('████████████╔╔════════╝╝╚╚════████╔╔════╝╝'))
assert.ok(plain.includes('S T A I N'))
assert.ok(plain.includes('Telegram: https://t.me/heisevanss'))

console.log('Terminal reference banner tests passed')
