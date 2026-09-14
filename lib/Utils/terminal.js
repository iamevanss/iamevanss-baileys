const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const DIM = '\x1b[2m'

const enabled = value => value !== false
const TELEGRAM = 'https://t.me/heisevanss'

// STAIN reference artwork. Each character is doubled horizontally to give the
// same large terminal presence as the reference screenshot without requiring
// a locally installed font package.
const STAIN_BASE = [
  '███████╗████████╗ █████╗ ██╗███╗   ██╗',
  '██╔════╝╚══██╔══╝██╔══██╗██║████╗  ██║',
  '███████╗   ██║   ███████║██║██╔██╗ ██║',
  '╚════██║   ██║   ██╔══██║██║██║╚██╗██║',
  '███████║   ██║   ██║  ██║██║██║ ╚████║',
  '╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝'
]

const scaleBanner = line => [...line].map(char => char.repeat(2)).join('')
const STAIN_ART = STAIN_BASE.map(scaleBanner)

const stamp = () => new Date().toLocaleTimeString('en-GB', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

export const terminalInfo = message => {
  console.log(`[${stamp()}] ${CYAN}[INFO]${RESET}  ${message}`)
}

export const terminalSuccess = message => {
  console.log(`[${stamp()}] ${GREEN}[INFO]${RESET}  ${message}`)
}

export const terminalError = message => {
  console.log(`[${stamp()}] ${RED}[INFO]${RESET}  ${message}`)
}

export const printTerminalStartup = (config = {}) => {
  if (!enabled(config.terminalUI)) return

  terminalInfo('Loading @iamvanss/baileys...')
  terminalInfo(`Baileys version: ${config.terminalVersion || '7.x'} (custom)`)
  terminalInfo(`Using ${config.terminalAuthLabel || 'SQLite auth state'}`)
  terminalInfo('Initializing socket...')
  console.log('')
  printReferenceBanner()
  console.log('')
}

export const printReferenceBanner = () => {
  const width = 100
  const line = '━'.repeat(width)
  console.log(`${RED}${line}${RESET}`)

  for (const row of STAIN_ART) {
    const padding = Math.max(0, Math.floor((width - row.length) / 2))
    console.log(`${RED}${BOLD}${' '.repeat(padding)}${row}${RESET}`)
  }

  const mark = '────────── ✺  ➜  S T A I N  ➜  ✺ ──────────'
  const markPadding = Math.max(0, Math.floor((width - mark.length) / 2))
  console.log(`${RED}${BOLD}${' '.repeat(markPadding)}${mark}${RESET}`)
  console.log(`${RED}${line}${RESET}`)
  console.log(`${RED}${BOLD}Telegram:${RESET} ${TELEGRAM}`)
}

// Optional connection UI. Disabled by default because applications commonly
// already print their own pairing/connection state and should not get duplicates.
export const attachTerminalConnectionUI = (sock, config = {}) => {
  if (config.terminalConnectionUI !== true) return sock
  if (!sock?.ev?.on) return sock
  if (sock.__stainTerminalUIAttached) return sock

  Object.defineProperty(sock, '__stainTerminalUIAttached', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false
  })

  const originalRequestPairingCode = sock.requestPairingCode
  if (typeof originalRequestPairingCode === 'function') {
    sock.requestPairingCode = async (...args) => {
      terminalInfo('Requesting pairing code...')
      const code = await originalRequestPairingCode(...args)
      console.log(`${CYAN}[ PAIRING ]${RESET}`)
      console.log(`${DIM}  |${RESET} Code: ${BOLD}${code}${RESET}`)
      console.log(`${DIM}  |${RESET} Open WhatsApp → Linked Devices → Link with phone number`)
      return code
    }
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode || 'unknown'
      terminalError(`Connection closed (${reason}).`)
    } else if (connection === 'open') {
      terminalSuccess('[ CONNECTED ]')
      const owner = sock.user?.id?.split('@')[0]?.split(':')[0]
      if (owner) console.log(`${DIM}  |${RESET} Owner:  ${owner}`)
      console.log(`${DIM}  |${RESET} Status: Online`)
    }
  })

  return sock
}

export const printTerminalReady = ({ owner, appName = 'STAIN MD TEST BOT', mode = 'Multi-device', commands = [] } = {}) => {
  terminalSuccess('Bot is ready!')
  console.log('')
  console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`)
  console.log(`${GREEN}${BOLD}${appName}${RESET}`)
  if (owner) console.log(`${GREEN}Owner:   ${owner}${RESET}`)
  console.log(`${GREEN}Mode:    ${mode}${RESET}`)
  console.log(`${GREEN}Library: @iamvanss/baileys${RESET}`)
  console.log(`${GREEN}Ready for commands...${RESET}`)
  if (commands.length) console.log(`${GREEN}${commands.join('  |  ')}${RESET}`)
}

export { TELEGRAM }
