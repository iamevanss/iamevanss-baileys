const BOLD = '\x1b[1m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

export const BAILEYS_BANNER = `${RED}${BOLD}███████╗████████╗ █████╗ ██╗███╗   ██╗
██╔════╝╚══██╔══╝██╔══██╗██║████╗  ██║
███████╗   ██║   ███████║██║██╔██╗ ██║
╚════██║   ██║   ██╔══██║██║██║╚██╗██║
███████║   ██║   ██║  ██║██║██║ ╚████║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝${RESET}`

export const BAILEYS_TELEGRAM = 'https://t.me/heisevanss'

let bannerPrinted = false

export const printBaileysBanner = () => {
  if (bannerPrinted) return
  bannerPrinted = true

  console.log(BAILEYS_BANNER)
  console.log(`${RED}${BOLD}Telegram:${RESET} ${BAILEYS_TELEGRAM}`)
}
