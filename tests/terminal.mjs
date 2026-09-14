import assert from 'node:assert/strict'
import { BAILEYS_TELEGRAM, printBaileysBanner } from '../lib/branding.js'

const output = []
const originalLog = console.log
console.log = (...args) => output.push(args.join(' '))

try {
  printBaileysBanner()
} finally {
  console.log = originalLog
}

const stripAnsi = value => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
const plain = stripAnsi(output.join('\n'))

const expectedBanner = `███████╗████████╗ █████╗ ██╗███╗   ██╗
██╔════╝╚══██╔══╝██╔══██╗██║████╗  ██║
███████╗   ██║   ███████║██║██╔██╗ ██║
╚════██║   ██║   ██╔══██║██║██║╚██╗██║
███████║   ██║   ██║  ██║██║██║ ╚████║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝`

assert.equal(output.length, 2)
assert.equal(stripAnsi(output[0]), expectedBanner)
assert.equal(stripAnsi(output[1]), `Telegram: ${BAILEYS_TELEGRAM}`)

console.log('Terminal branding tests passed')
