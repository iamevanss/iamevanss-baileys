# @iamvanss/baileys

A customized WhatsApp Web API library built on the Baileys ecosystem. It keeps the familiar Baileys developer experience while adding pairing, authentication, connection, storage, protocol, and utility improvements.

## Install

```bash
npm install @iamvanss/baileys
```

## Highlights

- Multi-device WhatsApp Web support
- QR login
- Pairing-code login with optional custom 8-character codes
- Session persistence and reconnection handling
- WhatsApp Rust Bridge support
- Reduced protobuf footprint where practical
- `makeInMemoryStore` and persistent store utilities
- Cache-manager store support
- SQLite authentication state
- Communities
- Interop
- Privacy APIs
- GraphQL support
- Newsletter support
- MEX protocol utilities
- Luxu protocol utilities
- Advanced message-builder APIs
- Familiar Baileys-compatible socket architecture

## Pairing code

```js
const code = await sock.requestPairingCode('234XXXXXXXXXX')
```

Custom 8-character pairing codes are supported by the pairing layer when a custom code is supplied through the socket implementation.

## Authentication

For normal deployments, use a persistent authentication state. SQLite authentication is available through `useSqliteAuthState` and uses Node's built-in `node:sqlite` support.

```js
import makeWASocket, { useSqliteAuthState } from '@iamvanss/baileys'

const { state, saveCreds } = await useSqliteAuthState('./auth/auth.db')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)
```

SQLite auth requires a Node.js release that provides `node:sqlite` (Node 22.5+).

## Stores

The package exposes the existing in-memory store along with persistent and cache-manager based store utilities.

```js
import { makeInMemoryStore, makeCacheManagerStore } from '@iamvanss/baileys'
```

The in-memory store also provides `writeToFile`, `readFromFile`, and `writeToFileInterval` helpers for JSON persistence.

## Terminal branding

The terminal banner uses the STAIN identity. The npm package and public API remain branded as `@iamvanss/baileys`.

## Contact

[![Telegram](https://img.shields.io/badge/Telegram-@heisevanss-229ED9?logo=telegram&logoColor=white)](https://t.me/heisevanss)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?logo=whatsapp&logoColor=white)](https://wa.me/2348132589873)

## Compatibility

The package targets Node.js 20 or newer. Some optional features have additional runtime requirements, such as SQLite authentication requiring Node 22.5+.

## License

MIT. See `LICENSE`.

This project incorporates open-source work from the Baileys ecosystem. Upstream copyright notices, licenses, and attribution requirements are retained where applicable. See `THIRD_PARTY_NOTICES/` for recorded upstream licenses.
