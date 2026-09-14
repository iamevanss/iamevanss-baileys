const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

export const BAILEYS_BANNER = `${BOLD}ㅤ༺ㅤꜱᴛᴀɪɴㅤ༻ㅤ${RESET}`
export const BAILEYS_TELEGRAM = 'https://t.me/heisevanss'

let bannerPrinted = false

export const printBaileysBanner = () => {
  if (bannerPrinted) return
  bannerPrinted = true

  console.log(BAILEYS_BANNER)
  console.log(`Telegram: ${BAILEYS_TELEGRAM}`)
}
