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
const lines = plain.split('\n')

// The reference banner is two separator rows + six artwork rows + marker +
// separator + Telegram line. Keep the test structural so harmless glyph-width
// changes do not make CI fail.
assert.equal(output.length, 10)
assert.equal(lines.length, 10)
assert.equal(lines[0], '━'.repeat(100))
assert.equal(lines[8], '━'.repeat(100))
assert.ok(lines.slice(1, 7).every(line => line.length > 40))
assert.ok(lines[7].includes('S T A I N'))
assert.ok(lines[9].includes('Telegram: https://t.me/heisevanss'))

console.log('Terminal reference banner tests passed')
