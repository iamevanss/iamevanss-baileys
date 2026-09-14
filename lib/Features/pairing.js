import { randomBytes } from 'crypto'
const CROCKFORD_CHARACTERS = '123456789ABCDEFGHJKLMNPQRSTVWXYZ'
const PAIRING_CODE_SIZE = 8
export const PAIRING_CODE_ALPHABET = CROCKFORD_CHARACTERS
export const PAIRING_CODE_LENGTH = PAIRING_CODE_SIZE
export const isValidPairingCode = (code) => typeof code === 'string' && code.length === PAIRING_CODE_SIZE && /^[123456789ABCDEFGHJKLMNPQRSTVWXYZ]+$/.test(code.toUpperCase())
export const normalizePairingCode = (code) => {
  if (typeof code !== 'string') throw new TypeError('Pairing code must be a string')
  const normalized = code.trim().toUpperCase()
  if (!isValidPairingCode(normalized)) throw new Error(`Pairing code must be exactly ${PAIRING_CODE_SIZE} characters using the Crockford alphabet`)
  return normalized
}
export const generatePairingCode = () => {
  let value = 0
  let bitCount = 0
  let code = ''
  for (const byte of randomBytes(5)) {
    value = (value << 8) | byte
    bitCount += 8
    while (bitCount >= 5 && code.length < PAIRING_CODE_SIZE) {
      code += CROCKFORD_CHARACTERS[(value >>> (bitCount - 5)) & 31]
      bitCount -= 5
    }
  }
  return code
}
