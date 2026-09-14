import assert from 'node:assert/strict'
import { resolveRealJid } from '../lib/Utils/jid-resolver.js'

const pn = '2347020169019@s.whatsapp.net'
const lid = '109711399624710@lid'

const direct = await resolveRealJid({}, pn)
assert.equal(direct.jid, pn)
assert.equal(direct.phone, '2347020169019')
assert.equal(direct.resolved, true)

const fromAlt = await resolveRealJid({}, lid, { remoteJidAlt: pn })
assert.equal(fromAlt.jid, pn)
assert.equal(fromAlt.phone, '2347020169019')
assert.equal(fromAlt.resolved, true)
assert.equal(fromAlt.lid, lid)

const fromMapping = await resolveRealJid({
  signalRepository: {
    lidMapping: {
      async getPNForLID(value) {
        assert.equal(value, lid)
        return pn
      }
    }
  }
}, lid)
assert.equal(fromMapping.jid, pn)
assert.equal(fromMapping.phone, '2347020169019')
assert.equal(fromMapping.resolved, true)
assert.equal(fromMapping.lid, lid)

const fromSelf = await resolveRealJid({
  user: { id: pn }
}, lid, { fromMe: true })
assert.equal(fromSelf.jid, pn)
assert.equal(fromSelf.phone, '2347020169019')
assert.equal(fromSelf.resolved, true)
assert.equal(fromSelf.lid, lid)

const unresolved = await resolveRealJid({}, lid)
assert.equal(unresolved.jid, lid)
assert.equal(unresolved.lid, lid)
assert.equal(unresolved.resolved, false)

console.log('LID resolver tests passed')
