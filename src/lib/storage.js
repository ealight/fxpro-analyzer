const TRADES_KEY   = 'ta_trades'
const SETTINGS_KEY = 'ta_settings'

const DEFAULT_SETTINGS = {
  currency:        'USD',
  default_deposit: 10000,
  default_risk:    1.0,
  theme:           'dark',
  min_lot:         0.01,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function saveSettings(patch) {
  const updated = { ...getSettings(), ...patch }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  return updated
}

function _all() {
  try {
    const raw = localStorage.getItem(TRADES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function _save(trades) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
}

function _nextId(trades) {
  return trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1
}

export function createTrade(data) {
  const trades = _all()
  const trade = {
    ...data,
    id:         _nextId(trades),
    created_at: new Date().toISOString(),
    profit:     data.profit  ?? null,
    notes:      data.notes   ?? null,
    screenshot_path: null,
  }
  trades.push(trade)
  _save(trades)
  return trade
}

export function getTrades({
  instrument, status, direction, date_from, date_to,
  page = 1, page_size = 20,
  sort_by = 'created_at', sort_order = 'desc',
} = {}) {
  let trades = _all()
  if (instrument) trades = trades.filter(t => t.instrument === instrument)
  if (status)     trades = trades.filter(t => t.status     === status)
  if (direction)  trades = trades.filter(t => t.direction  === direction)
  if (date_from)  trades = trades.filter(t => t.date >= date_from)
  if (date_to)    trades = trades.filter(t => t.date <= date_to)

  trades.sort((a, b) => {
    const av = a[sort_by] ?? ''
    const bv = b[sort_by] ?? ''
    return sort_order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const total       = trades.length
  const total_pages = Math.max(1, Math.ceil(total / page_size))
  const items       = trades.slice((page - 1) * page_size, page * page_size)
  return { items, total, page, page_size, total_pages }
}

export function getTradeById(id) {
  return _all().find(t => t.id === id) ?? null
}

export function updateTrade(id, patch) {
  const trades = _all()
  const idx = trades.findIndex(t => t.id === id)
  if (idx === -1) return null
  trades[idx] = { ...trades[idx], ...patch }
  _save(trades)
  return trades[idx]
}

export function deleteTrade(id) {
  const trades = _all()
  const next   = trades.filter(t => t.id !== id)
  if (next.length === trades.length) return false
  _save(next)
  return true
}

export function getStats() {
  const settings  = getSettings()
  const allTrades = _all()
  const closed    = allTrades.filter(t => t.status === 'CLOSED')
  const open      = allTrades.filter(t => t.status === 'OPEN')

  const profits  = closed.map(t => t.profit ?? 0)
  const wins     = profits.filter(p => p > 0)
  const losses   = profits.filter(p => p < 0)

  const total_profit  = profits.reduce((a, b) => a + b, 0)
  const win_rate      = closed.length ? Math.round(wins.length / closed.length * 10000) / 100 : 0
  const avg_win       = wins.length   ? wins.reduce((a, b) => a + b, 0)   / wins.length   : 0
  const avg_loss_raw  = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0
  const gross_win     = wins.reduce((a, b) => a + b, 0)
  const gross_loss    = Math.abs(losses.reduce((a, b) => a + b, 0))
  const profit_factor = gross_loss > 0 ? gross_win / gross_loss : (gross_win > 0 ? 99 : 0)
  const expectancy    = closed.length ? total_profit / closed.length : 0

  const today        = new Date().toISOString().slice(0, 10)
  const today_profit = closed.filter(t => t.date === today).reduce((a, t) => a + (t.profit ?? 0), 0)

  const rr_vals = closed.filter(t => t.profit != null && t.risk_percent > 0).map(t => {
    const risk = settings.default_deposit * t.risk_percent / 100
    return t.profit / risk
  })
  const avg_rr = rr_vals.length ? rr_vals.reduce((a, b) => a + b, 0) / rr_vals.length : 0

  let peak = settings.default_deposit, balance = settings.default_deposit, max_dd = 0
  const sortedClosed = [...closed].sort((a, b) => a.date > b.date ? 1 : -1)
  for (const t of sortedClosed) {
    balance += t.profit ?? 0
    if (balance > peak) peak = balance
    const dd = peak > 0 ? (peak - balance) / peak * 100 : 0
    if (dd > max_dd) max_dd = dd
  }

  const r = v => Math.round(v * 100) / 100
  return {
    current_deposit:  settings.default_deposit,
    current_balance:  r(settings.default_deposit + total_profit),
    total_profit:     r(total_profit),
    today_profit:     r(today_profit),
    open_trades:      open.length,
    closed_trades:    closed.length,
    win_rate,
    avg_rr:           r(avg_rr),
    profit_factor:    r(profit_factor),
    expectancy:       r(expectancy),
    avg_win:          r(avg_win),
    avg_loss:         r(Math.abs(avg_loss_raw)),
    largest_win:      wins.length   ? Math.max(...wins)              : 0,
    largest_loss:     losses.length ? Math.abs(Math.min(...losses)) : 0,
    max_drawdown:     r(max_dd),
  }
}

export function getCharts() {
  const settings = getSettings()
  const base     = settings.default_deposit
  const trades   = [..._all()]
    .filter(t => t.status === 'CLOSED')
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)

  let bal = base
  const eq_labels = [], eq_data = [], dd_data = []
  let peak = base
  for (const t of trades) {
    bal += t.profit ?? 0
    if (bal > peak) peak = bal
    const dd = peak > 0 ? -((peak - bal) / peak * 100) : 0
    eq_labels.push(t.date)
    eq_data.push(Math.round(bal * 100) / 100)
    dd_data.push(Math.round(dd * 100) / 100)
  }

  const monthly = {}
  for (const t of trades) {
    const m = t.date.slice(0, 7)
    monthly[m] = (monthly[m] ?? 0) + (t.profit ?? 0)
  }
  const mo_labels = Object.keys(monthly).sort()
  const mo_data   = mo_labels.map(m => Math.round(monthly[m] * 100) / 100)

  const n_wins   = trades.filter(t => (t.profit ?? 0) > 0).length
  const n_losses = trades.filter(t => (t.profit ?? 0) < 0).length
  const n_be     = trades.filter(t => (t.profit ?? 0) === 0).length

  const RR_LABELS = ['<0', '0-0.5', '0.5-1', '1-2', '2-3', '3-5', '5+']
  const rr_counts = [0, 0, 0, 0, 0, 0, 0]
  for (const t of trades) {
    const risk = base * (t.risk_percent || 1) / 100
    const rr   = risk > 0 ? (t.profit ?? 0) / risk : 0
    if      (rr < 0)   rr_counts[0]++
    else if (rr < 0.5) rr_counts[1]++
    else if (rr < 1)   rr_counts[2]++
    else if (rr < 2)   rr_counts[3]++
    else if (rr < 3)   rr_counts[4]++
    else if (rr < 5)   rr_counts[5]++
    else               rr_counts[6]++
  }

  const PD_LABELS = ['<-100', '-100–-50', '-50–0', '0–50', '50–100', '>100']
  const pd_counts = [0, 0, 0, 0, 0, 0]
  for (const t of trades) {
    const p = t.profit ?? 0
    if      (p < -100) pd_counts[0]++
    else if (p < -50)  pd_counts[1]++
    else if (p <   0)  pd_counts[2]++
    else if (p <  50)  pd_counts[3]++
    else if (p < 100)  pd_counts[4]++
    else               pd_counts[5]++
  }

  const mkLine = (label, labels, data, color) => ({
    labels, datasets: [{ label, data, border_color: color, background_color: color + '33' }],
  })
  const mkBar = (label, labels, data, color) => ({
    labels, datasets: [{ label, data, background_color: color }],
  })

  return {
    equity_curve:        mkLine('Balance',     eq_labels, eq_data,   '#4caf82'),
    balance_curve:       mkLine('Balance',     eq_labels, eq_data,   '#4caf82'),
    monthly_profit:      mkBar ('Monthly P/L', mo_labels, mo_data,   '#4caf82'),
    win_rate_pie:        { labels: ['Wins','Losses','Break-even'], datasets: [{ label: 'Trades', data: [n_wins, n_losses, n_be], background_color: '#4caf82' }] },
    drawdown:            mkLine('Drawdown %',  eq_labels, dd_data,   '#f44336'),
    rr_distribution:     mkBar ('Trades',      RR_LABELS, rr_counts, '#4caf82'),
    profit_distribution: mkBar ('Trades',      PD_LABELS, pd_counts, '#4caf82'),
  }
}
