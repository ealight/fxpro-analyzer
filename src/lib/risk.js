const INSTRUMENT_DATA = {
  // ── Forex (contract size = 100,000 units) ──────────────────────────────
  'XAU/USD': { pip_size: 0.01,   pip_value: 1.0,   contract_size: 100     }, // 100 oz
  'XAG/USD': { pip_size: 0.001,  pip_value: 5.0,   contract_size: 5000    }, // 5,000 oz
  'EUR/USD': { pip_size: 0.0001, pip_value: 10.0,  contract_size: 100000  },
  'GBP/USD': { pip_size: 0.0001, pip_value: 10.0,  contract_size: 100000  },
  'AUD/USD': { pip_size: 0.0001, pip_value: 10.0,  contract_size: 100000  },
  'NZD/USD': { pip_size: 0.0001, pip_value: 10.0,  contract_size: 100000  },
  'USD/JPY': { pip_size: 0.01,   pip_value: 9.09,  contract_size: 100000  }, // approx — varies with JPY rate
  'EUR/JPY': { pip_size: 0.01,   pip_value: 9.09,  contract_size: 100000  },
  'GBP/JPY': { pip_size: 0.01,   pip_value: 9.09,  contract_size: 100000  },
  'USD/CAD': { pip_size: 0.0001, pip_value: 7.6,   contract_size: 100000  }, // approx — varies with CAD rate
  'USD/CHF': { pip_size: 0.0001, pip_value: 11.0,  contract_size: 100000  }, // approx — varies with CHF rate
  'EUR/GBP': { pip_size: 0.0001, pip_value: 12.5,  contract_size: 100000  }, // approx — varies with GBP rate
  'EUR/AUD': { pip_size: 0.0001, pip_value: 6.5,   contract_size: 100000  }, // approx
  'GBP/AUD': { pip_size: 0.0001, pip_value: 6.5,   contract_size: 100000  }, // approx
  // ── Crypto ─────────────────────────────────────────────────────────────
  'BTC/USD': { pip_size: 1.0,    pip_value: 1.0,   contract_size: 1       },
  'ETH/USD': { pip_size: 0.01,   pip_value: 1.0,   contract_size: 100     },
  // ── Indices (contract size = 10 per FxPro) ─────────────────────────────
  'NAS100':  { pip_size: 1.0,    pip_value: 10.0,  contract_size: 10      },
  'US30':    { pip_size: 1.0,    pip_value: 10.0,  contract_size: 10      },
  'GER40':   { pip_size: 1.0,    pip_value: 11.0,  contract_size: 10      }, // EUR-denominated, approx at 1.10 EUR/USD
  'UK100':   { pip_size: 1.0,    pip_value: 13.0,  contract_size: 10      }, // GBP-denominated, approx at 1.30 GBP/USD
  'SPX500':  { pip_size: 0.1,    pip_value: 1.0,   contract_size: 10      }, // 10 × 0.1 = $1/pip
  // ── Energy (contract size = 100 barrels per FxPro) ─────────────────────
  'OIL':     { pip_size: 0.01,   pip_value: 1.0,   contract_size: 100     }, // 100 × 0.01 = $1/pip
  'BRENT':   { pip_size: 0.01,   pip_value: 1.0,   contract_size: 100     },
}
const DEFAULT_DATA = { pip_size: 0.0001, pip_value: 10.0, contract_size: 100000 }

function _getData(instrument) {
  return INSTRUMENT_DATA[instrument] || DEFAULT_DATA
}

export function getInstrumentDefaults(instrument) {
  return _getData(instrument)
}

export function pips(price_distance, pip_size) {
  return pip_size === 0 ? 0 : Math.abs(price_distance) / pip_size
}

export function profitForLot(lot, price_distance, pip_size, pip_value) {
  return Math.round(lot * pips(price_distance, pip_size) * pip_value * 100) / 100
}

export function calculate({
  direction, instrument, entry_avg, stop_loss, take_profits,
  deposit, risk_percent, leverage = null, split = 1, min_lot = 0.01,
  pip_size: pip_size_override = null, pip_value: pip_value_override = null,
}) {
  const data    = _getData(instrument)
  const pip_size = pip_size_override != null ? pip_size_override : data.pip_size
  const pip_val  = pip_value_override != null ? pip_value_override : data.pip_value

  const risk_dollars = deposit * risk_percent / 100
  const sl_distance  = Math.abs(entry_avg - stop_loss)
  const sl_pips_raw  = pips(sl_distance, pip_size)
  const sl_pip_count = Math.round(sl_pips_raw * 10) / 10

  const raw_lot     = sl_pips_raw > 0 ? risk_dollars / (sl_pips_raw * pip_val) : 0
  const lot         = Math.max(min_lot, Math.round(raw_lot * 100) / 100)
  const lot_clamped = raw_lot < min_lot

  let min_risk_for_deposit = null
  let min_deposit_for_risk = null
  if (lot_clamped && sl_pips_raw > 0) {
    const denom = sl_pips_raw * pip_val
    min_risk_for_deposit = Math.round(min_lot * denom * 100 / deposit * 100) / 100
    min_deposit_for_risk = Math.round(min_lot * denom * 100 / risk_percent * 100) / 100
  }

  const expected_loss = -Math.round(risk_dollars * 100) / 100

  const take_profit_results = take_profits.map((tp_price, i) => {
    const price_diff = direction === 'BUY' ? tp_price - entry_avg : entry_avg - tp_price
    const tp_pips    = Math.round(pips(price_diff, pip_size) * 10) / 10
    const tp_profit  = profitForLot(raw_lot, price_diff, pip_size, pip_val)
    const rr         = risk_dollars ? Math.round(tp_profit / risk_dollars * 100) / 100 : 0
    return { tp_level: i + 1, price: tp_price, pips: tp_pips, profit: tp_profit, rr }
  })

  const raw_per_lot = raw_lot / split
  const per_lot     = Math.max(min_lot, Math.round(raw_per_lot * 100) / 100)
  const pos_clamped = raw_per_lot < min_lot
  const per_risk    = risk_dollars / split

  const positions = Array.from({ length: split }, (_, idx) => {
    const pos_num  = idx + 1
    const tp_idx   = Math.min(idx, take_profits.length - 1)
    const tp_price = take_profits.length > 0 ? take_profits[tp_idx] : entry_avg
    const tp_level = tp_idx + 1
    const price_diff = direction === 'BUY' ? tp_price - entry_avg : entry_avg - tp_price
    const tp_pips    = Math.round(pips(price_diff, pip_size) * 10) / 10
    const tp_profit  = profitForLot(raw_per_lot, price_diff, pip_size, pip_val)
    const rr         = per_risk ? Math.round(tp_profit / per_risk * 100) / 100 : 0
    return {
      position_number: pos_num,
      lot:             per_lot,
      raw_lot:         Math.round(raw_per_lot * 10000) / 10000,
      risk_amount:     Math.round(per_risk * 100) / 100,
      clamped_to_min:  pos_clamped,
      target_tp: { tp_level, price: tp_price, pips: tp_pips, profit: tp_profit, rr },
    }
  })

  const locked_profit = take_profit_results.length > 0
    ? Math.round(take_profit_results[0].profit / split * 100) / 100
    : 0

  let margin_required = null
  if (leverage && leverage > 0) {
    const notional = lot * (pip_val / pip_size) * entry_avg
    margin_required = Math.round(notional / leverage * 100) / 100
  }

  return {
    direction, instrument,
    entry:               Math.round(entry_avg * 100000) / 100000,
    stop_loss, take_profits,
    sl_pips:             sl_pip_count,
    lot,
    raw_lot:             Math.round(raw_lot * 10000) / 10000,
    lot_clamped,
    min_risk_for_deposit,
    min_deposit_for_risk,
    risk_amount:         Math.round(risk_dollars * 100) / 100,
    expected_loss,
    take_profit_results,
    positions,
    margin_required,
    break_even: {
      locked_profit_at_tp1:    locked_profit,
      remaining_risk_after_be: 0,
    },
  }
}
