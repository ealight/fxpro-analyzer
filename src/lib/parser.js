const INSTRUMENT_MAP = {
  'XAU/USD':'XAU/USD','XAUUSD':'XAU/USD','GOLD':'XAU/USD',
  'XAG/USD':'XAG/USD','XAGUSD':'XAG/USD','SILVER':'XAG/USD',
  'GBP/USD':'GBP/USD','GBPUSD':'GBP/USD',
  'EUR/USD':'EUR/USD','EURUSD':'EUR/USD',
  'AUD/USD':'AUD/USD','AUDUSD':'AUD/USD',
  'NZD/USD':'NZD/USD','NZDUSD':'NZD/USD',
  'USD/JPY':'USD/JPY','USDJPY':'USD/JPY',
  'EUR/JPY':'EUR/JPY','EURJPY':'EUR/JPY',
  'GBP/JPY':'GBP/JPY','GBPJPY':'GBP/JPY',
  'USD/CAD':'USD/CAD','USDCAD':'USD/CAD',
  'USD/CHF':'USD/CHF','USDCHF':'USD/CHF',
  'EUR/GBP':'EUR/GBP','EURGBP':'EUR/GBP',
  'EUR/AUD':'EUR/AUD','EURAUD':'EUR/AUD',
  'GBP/AUD':'GBP/AUD','GBPAUD':'GBP/AUD',
  'BTC/USD':'BTC/USD','BTCUSD':'BTC/USD','BITCOIN':'BTC/USD',
  'ETH/USD':'ETH/USD','ETHUSD':'ETH/USD','ETHEREUM':'ETH/USD',
  'NAS100':'NAS100','NASDAQ100':'NAS100','NASDAQ':'NAS100','NDX':'NAS100',
  'US30':'US30','DOW30':'US30','DOWJONES':'US30',
  'GER40':'GER40','DAX40':'GER40','DAX':'GER40',
  'UK100':'UK100','FTSE100':'UK100','FTSE':'UK100',
  'SPX500':'SPX500','SP500':'SPX500','S&P500':'SPX500',
  'OIL':'OIL','USOIL':'OIL','CRUDE':'OIL','WTI':'OIL',
  'BRENT':'BRENT','UKOIL':'BRENT',
}

const _instAlts = Object.keys(INSTRUMENT_MAP)
  .sort((a, b) => b.length - a.length)
  .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|')
const INSTRUMENT_RE = new RegExp(`(?<![A-Z/])(${_instAlts})(?![A-Z/])`, 'i')
const DIRECTION_RE  = /\b(BUY|SELL|LONG|SHORT)\b/i

const NUM = '[\\d,.]+'
const ENTRY_RANGE_RE  = new RegExp(`(?:entry|enter|price|ep)\\s*:?\\s*(${NUM})\\s*[-–~to]+\\s*(${NUM})`, 'i')
const ENTRY_SINGLE_RE = new RegExp(`(?:entry|enter|price|ep)\\s*:?\\s*(${NUM})`, 'i')
const BARE_RANGE_RE   = new RegExp(`(${NUM})\\s*[-–]\\s*(${NUM})`)
const SL_RE = new RegExp(
  `(?:stop[\\s_]?loss|stoploss|sl|stop)\\s*(?:\\([^)]*\\))?\\s*:?\\s*\\n?\\s*(${NUM})`, 'i'
)
const TP_RE = new RegExp(
  `(?:take[\\s_]?profit[\\s_]?\\d*|tp[\\s_]?\\d+|target[\\s_]?\\d*)\\s*:?\\s*\\n?\\s*(${NUM})`, 'gi'
)

function clean(text) {
  return text.replace(/[^\x00-\x7F]/g, ' ').replace(/[ \t]+/g, ' ')
}

function toFloat(raw) {
  let s = raw.trim()
  if (s.includes(',') && !s.includes('.')) {
    const parts = s.split(',')
    if (parts.length === 2 && parts[1].length !== 3) s = parts[0] + '.' + parts[1]
    else s = s.replace(/,/g, '')
  } else {
    s = s.replace(/,/g, '')
  }
  return parseFloat(s)
}

function normalizeRange(a, b) {
  if (a <= 0 || b <= 0) return [a, b]
  const ratio = Math.max(a, b) / Math.min(a, b)
  if (ratio < 100) return [a, b]
  const large = b > a ? b : a
  const small  = b > a ? a : b
  for (const power of [10, 100, 1000, 10000, 100000]) {
    const candidate = large / power
    if (candidate > 0 && candidate / small >= 0.5 && candidate / small <= 2.0) {
      return a < b ? [small, candidate] : [candidate, small]
    }
  }
  return [a, b]
}

export function parse(text) {
  const c = clean(text)

  const dirMatch = DIRECTION_RE.exec(c)
  if (!dirMatch) throw new Error('Could not detect direction (BUY or SELL) in the signal.')
  let direction = dirMatch[1].toUpperCase()
  if (direction === 'LONG')  direction = 'BUY'
  if (direction === 'SHORT') direction = 'SELL'

  const instMatch = INSTRUMENT_RE.exec(c)
  if (!instMatch) throw new Error('Could not detect a known trading instrument in the signal.')
  const instrument = INSTRUMENT_MAP[instMatch[1].toUpperCase()] || instMatch[1].toUpperCase()

  let entry_low, entry_high, entry_avg
  let m = ENTRY_RANGE_RE.exec(c)
  if (m) {
    ;[entry_low, entry_high] = normalizeRange(toFloat(m[1]), toFloat(m[2]))
    entry_avg = (entry_low + entry_high) / 2
  } else {
    m = ENTRY_SINGLE_RE.exec(c)
    if (m) {
      entry_low = toFloat(m[1]); entry_high = null; entry_avg = entry_low
    } else {
      m = BARE_RANGE_RE.exec(c)
      if (m) {
        ;[entry_low, entry_high] = normalizeRange(toFloat(m[1]), toFloat(m[2]))
        entry_avg = (entry_low + entry_high) / 2
      } else {
        throw new Error('Could not detect an entry price in the signal.')
      }
    }
  }

  const slMatch = SL_RE.exec(c)
  if (!slMatch) throw new Error('Could not detect a stop loss in the signal.')
  const stop_loss = toFloat(slMatch[1])

  const take_profits = []
  TP_RE.lastIndex = 0
  let tpM
  while ((tpM = TP_RE.exec(c)) !== null) take_profits.push(toFloat(tpM[1]))

  return {
    direction, instrument,
    entry_low, entry_high,
    entry_avg: Math.round(entry_avg * 100000) / 100000,
    stop_loss, take_profits,
  }
}
