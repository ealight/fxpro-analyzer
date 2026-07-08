import { useState } from 'react'
import { API } from '../lib/api'
import { getSettings } from '../lib/storage'
import { getInstrumentDefaults } from '../lib/risk'
import { fmtNum, todayStr, nowTimeStr } from '../lib/fmt'
import { useLang } from '../contexts/LangContext'

const INSTRUMENTS = [
  'XAU/USD', 'XAG/USD',
  'EUR/USD', 'GBP/USD', 'AUD/USD', 'NZD/USD',
  'USD/JPY', 'EUR/JPY', 'GBP/JPY',
  'USD/CAD', 'USD/CHF', 'EUR/GBP', 'EUR/AUD', 'GBP/AUD',
  'BTC/USD', 'ETH/USD',
  'NAS100', 'US30', 'GER40', 'UK100', 'SPX500',
  'OIL', 'BRENT',
]

function MiniCard({ label, children }) {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div className="signal-mini-card text-center">
        <div className="mini-label">{label}</div>
        <div className="mini-val">{children}</div>
      </div>
    </div>
  )
}

function RiskCard({ label, children }) {
  return (
    <div className="col-6 col-md-4">
      <div className="signal-mini-card">
        <div className="mini-label">{label}</div>
        <div className="mini-val">{children}</div>
      </div>
    </div>
  )
}

export default function ManualCalculator() {
  const { t } = useLang()
  const s = getSettings()
  const initInstr = 'XAU/USD'
  const initSpec  = getInstrumentDefaults(initInstr)

  const [direction, setDirection]       = useState('BUY')
  const [instrument, setInstrument]     = useState(initInstr)
  const [contractSize, setContractSize] = useState(String(initSpec.contract_size))
  const [pipSize, setPipSize]           = useState(String(initSpec.pip_size))
  const [pipValue, setPipValue]         = useState(String(initSpec.pip_value))
  const [entry, setEntry]               = useState('')
  const [stopLoss, setStopLoss]         = useState('')
  const [tps, setTps]                   = useState([''])
  const [deposit, setDeposit]           = useState(String(s.default_deposit))
  const [risk, setRisk]                 = useState(String(s.default_risk))
  const [split, setSplit]               = useState(String(s.default_split ?? 4))
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [calc, setCalc]                 = useState(null)
  const [saveDate, setSaveDate]         = useState(todayStr())
  const [saveTime, setSaveTime]         = useState(nowTimeStr())
  const [saveNotes, setSaveNotes]       = useState('')
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)

  const onInstrumentChange = (sym) => {
    setInstrument(sym)
    const spec = getInstrumentDefaults(sym)
    setContractSize(String(spec.contract_size))
    setPipSize(String(spec.pip_size))
    setPipValue(String(spec.pip_value))
  }

  const addTp    = () => setTps(t => [...t, ''])
  const removeTp = (i) => setTps(t => t.filter((_, idx) => idx !== i))
  const setTp    = (i, val) => setTps(t => t.map((v, idx) => idx === i ? val : v))

  const calculate = async () => {
    setError('')
    const dep = parseFloat(deposit), rsk = parseFloat(risk)
    const ent = parseFloat(entry),   sl  = parseFloat(stopLoss)
    if (isNaN(dep) || dep <= 0) { setError(t('calc.errDeposit')); return }
    if (isNaN(rsk) || rsk <= 0) { setError(t('calc.errRisk')); return }
    if (isNaN(ent) || ent <= 0) { setError(t('calc.errEntry')); return }
    if (isNaN(sl)  || sl  <= 0) { setError(t('calc.errSL')); return }
    const parsedTps = tps.map(v => parseFloat(v)).filter(v => !isNaN(v) && v > 0)
    setLoading(true)
    try {
      const result = await API.calculate({
        direction,
        instrument,
        entry_avg:    ent,
        stop_loss:    sl,
        take_profits: parsedTps,
        deposit:      dep,
        risk_percent: rsk,
        split:        parseInt(split),
        pip_size:     parseFloat(pipSize),
        pip_value:    parseFloat(pipValue),
      })
      setCalc(result)
      setSaveDate(todayStr())
      setSaveTime(nowTimeStr())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const saveToJournal = async () => {
    if (!calc) return
    setSaving(true)
    try {
      await API.createTrade({
        date: saveDate, time: saveTime,
        instrument: calc.instrument, direction: calc.direction,
        entry: calc.entry, stop_loss: calc.stop_loss,
        take_profits: calc.take_profits, lot: calc.lot,
        risk_percent: parseFloat(risk), status: 'OPEN',
        notes: saveNotes || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const copy = (val) => navigator.clipboard.writeText(String(val))

  return (
    <>
      <div className="page-header">
        <h2><i className="bi bi-sliders me-2 text-accent"></i>{t('calc.titleManual')}</h2>
      </div>
      <div className="page-body">
        <div className="row g-4">

          <div className="col-xl-5">
            <div className="card">
              <div className="card-body">
                <div className="row g-3">

                  <div className="col-6">
                    <label className="form-label fw-semibold">{t('calc.direction')}</label>
                    <select className="form-select" value={direction} onChange={e => setDirection(e.target.value)}>
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold">{t('calc.instrument')}</label>
                    <select className="form-select" value={instrument} onChange={e => onInstrumentChange(e.target.value)}>
                      {INSTRUMENTS.map(sym => <option key={sym} value={sym}>{sym}</option>)}
                    </select>
                  </div>

                  <div className="col-4">
                    <label className="form-label small">{t('calc.contractSize')}</label>
                    <input type="number" className="form-control form-control-sm" step="any" min="0"
                      value={contractSize} onChange={e => setContractSize(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label className="form-label small">{t('calc.pipSize')}</label>
                    <input type="number" className="form-control form-control-sm" step="any" min="0"
                      value={pipSize} onChange={e => setPipSize(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label className="form-label small">{t('calc.pipValue')}</label>
                    <input type="number" className="form-control form-control-sm" step="any" min="0"
                      value={pipValue} onChange={e => setPipValue(e.target.value)} />
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold">{t('calc.entry')}</label>
                    <input type="number" className="form-control" placeholder="e.g. 4150" step="any"
                      value={entry} onChange={e => setEntry(e.target.value)} />
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold">{t('calc.stopLoss')}</label>
                    <input type="number" className="form-control" placeholder="e.g. 4136" step="any"
                      value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">{t('calc.takeProfits')}</label>
                    {tps.map((tp, i) => (
                      <div key={i} className="d-flex align-items-center gap-2 mb-2">
                        <span className="text-muted" style={{ fontSize: '.78rem', minWidth: 28 }}>TP{i + 1}</span>
                        <input type="number" className="form-control" placeholder="price" step="any"
                          value={tp} onChange={e => setTp(i, e.target.value)} />
                        {tps.length > 1 && (
                          <button className="btn btn-sm btn-outline-danger px-2" onClick={() => removeTp(i)}>
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    {tps.length < 8 && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={addTp}>
                        <i className="bi bi-plus me-1"></i>{t('calc.addTp')}
                      </button>
                    )}
                  </div>

                  <div className="col-6">
                    <label className="form-label small">{t('calc.deposit')}</label>
                    <input type="number" className="form-control" min="1"
                      value={deposit} onChange={e => setDeposit(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">{t('calc.risk')}</label>
                    <input type="number" className="form-control" min="0.01" max="100" step="0.1"
                      value={risk} onChange={e => setRisk(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small">{t('calc.split')}</label>
                    <select className="form-select" value={split} onChange={e => setSplit(e.target.value)}>
                      <option value="1">{t('calc.split1')}</option>
                      <option value="2">{t('calc.split2')}</option>
                      <option value="4">{t('calc.split4')}</option>
                      <option value="8">{t('calc.split8')}</option>
                    </select>
                  </div>
                </div>

                <div className="d-grid mt-3">
                  <button className="btn btn-accent btn-lg" onClick={calculate} disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('calc.calculating')}</>
                      : <><i className="bi bi-calculator me-1"></i>{t('calc.calcBtn')}</>}
                  </button>
                </div>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
              </div>
            </div>

            {calc && (
              <div className="card mt-3">
                <div className="card-body">
                  <h6 className="fw-semibold mb-3">{t('calc.saveJournal')}</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small">{t('calc.date')}</label>
                      <input type="date" className="form-control" value={saveDate} onChange={e => setSaveDate(e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">{t('calc.time')}</label>
                      <input type="time" className="form-control" value={saveTime} onChange={e => setSaveTime(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">{t('calc.notes')}</label>
                      <textarea className="form-control" rows="2" value={saveNotes} onChange={e => setSaveNotes(e.target.value)}></textarea>
                    </div>
                  </div>
                  <button className="btn btn-outline-accent mt-2 w-100" onClick={saveToJournal} disabled={saving}>
                    {saved
                      ? <><i className="bi bi-check-lg me-1"></i>{t('calc.saved')}</>
                      : saving
                        ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('calc.saving')}</>
                        : <><i className="bi bi-floppy me-1"></i>{t('calc.saveTrade')}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="col-xl-7">
            {!calc ? (
              <div className="card h-100 d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 260 }}>
                <div className="text-center">
                  <i className="bi bi-arrow-left-circle fs-2 mb-2 d-block"></i>
                  {t('calc.placeholderManual')} <strong>{t('calc.calcBtn')}</strong>
                </div>
              </div>
            ) : (
              <>
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row text-center g-3">
                      <MiniCard label={t('calc.dirLbl')}>
                        <span className={calc.direction === 'BUY' ? 'text-accent' : 'profit-neg'}>{calc.direction}</span>
                      </MiniCard>
                      <MiniCard label={t('calc.instrLbl')}>{calc.instrument}</MiniCard>
                      <MiniCard label={t('calc.entryLbl')}>{fmtNum(calc.entry, 5)}</MiniCard>
                      <MiniCard label={t('calc.slLbl')}>{fmtNum(calc.stop_loss, 5)}</MiniCard>
                      <MiniCard label={t('calc.slDist')}>{fmtNum(calc.sl_pips, 1)} {t('calc.pips')}</MiniCard>
                      {calc.take_profits.map((tp, i) => (
                        <MiniCard key={i} label={`TP${i + 1}`}>{fmtNum(tp, 5)}</MiniCard>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header fw-semibold">{t('calc.riskLot')}</div>
                  <div className="card-body">
                    <div className="row g-3">
                      <RiskCard label={t('calc.recLot')}>
                        <span className="text-accent">{calc.raw_lot}</span>
                        {calc.lot_clamped && (
                          <span className="badge bg-danger ms-1" title={`Below broker minimum — trade will use ${calc.lot}`}>MIN {calc.lot}</span>
                        )}
                      </RiskCard>
                      <RiskCard label={t('calc.riskAmount')}>${fmtNum(calc.risk_amount)}</RiskCard>
                      <RiskCard label={t('calc.expLoss')}>
                        <span className="profit-neg">-${fmtNum(Math.abs(calc.expected_loss))}</span>
                      </RiskCard>
                    </div>

                    {calc.lot_clamped && calc.min_risk_for_deposit != null && (
                      <div className="alert alert-danger mt-3 mb-0">
                        <strong>{t('calc.warnMinLot', { raw: calc.raw_lot, min: calc.lot })}</strong><br />
                        {t('calc.warnMinRiskA', { deposit: fmtNum(parseFloat(deposit)) })} <strong>{calc.min_risk_for_deposit}%</strong>.<br />
                        {t('calc.warnMinRiskB', { risk })} <strong>${fmtNum(calc.min_deposit_for_risk)}</strong>.
                      </div>
                    )}

                    <div className="mt-2 d-flex flex-wrap gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => copy(calc.lot)}>
                        <i className="bi bi-clipboard me-1"></i>{t('calc.copyLot')}
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => copy(calc.entry)}>
                        <i className="bi bi-clipboard me-1"></i>{t('calc.copyEntry')}
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => copy(calc.stop_loss)}>
                        <i className="bi bi-clipboard me-1"></i>{t('calc.copySL')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header fw-semibold">{t('calc.tpTargets')}</div>
                  <div className="card-body p-0">
                    <table className="table table-dark table-hover mb-0">
                      <thead><tr>
                        <th>#</th><th>{t('calc.price')}</th><th>{t('calc.pips')}</th><th>{t('calc.profit')}</th><th>{t('calc.rr')}</th><th></th>
                      </tr></thead>
                      <tbody>
                        {calc.take_profit_results.length
                          ? calc.take_profit_results.map(tp => (
                            <tr key={tp.tp_level}>
                              <td><strong>TP{tp.tp_level}</strong></td>
                              <td>{fmtNum(tp.price, 5)}</td>
                              <td>{fmtNum(tp.pips, 1)}</td>
                              <td className="profit-pos">+${fmtNum(tp.profit)}</td>
                              <td>1:{fmtNum(tp.rr)}</td>
                              <td><button className="btn-copy" onClick={() => copy(tp.price)}><i className="bi bi-clipboard"></i></button></td>
                            </tr>
                          ))
                          : <tr><td colSpan="6" className="text-muted text-center">{t('calc.noTPsSet')}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {calc.positions.length > 1 && (
                  <>
                    <div className="card mb-3">
                      <div className="card-header fw-semibold">{t('calc.posSplit')}</div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-dark table-hover mb-0">
                            <thead><tr>
                              <th>{t('calc.posNum')}</th><th>{t('calc.lot')}</th><th>{t('calc.riskDollar')}</th>
                              <th>{t('calc.targetTP')}</th><th>{t('calc.tpPrice')}</th>
                              <th>{t('calc.pips')}</th><th>{t('calc.profit')}</th><th>{t('calc.rr')}</th>
                            </tr></thead>
                            <tbody>
                              {calc.positions.map(pos => {
                                const tp = pos.target_tp
                                return (
                                  <tr key={pos.position_number}>
                                    <td><strong>#{pos.position_number}</strong></td>
                                    <td>
                                      {pos.raw_lot}
                                      {pos.clamped_to_min && (
                                        <span className="badge bg-danger ms-1" title={`Below broker minimum — trade will use ${pos.lot}`}>MIN {pos.lot}</span>
                                      )}
                                    </td>
                                    <td>${fmtNum(pos.risk_amount)}</td>
                                    <td><strong>TP{tp.tp_level}</strong></td>
                                    <td>{fmtNum(tp.price, 5)}</td>
                                    <td>{fmtNum(tp.pips, 1)}</td>
                                    <td className="profit-pos">+${fmtNum(tp.profit)}</td>
                                    <td>1:{fmtNum(tp.rr)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    {calc.positions.some(p => p.clamped_to_min) && (
                      <div className="alert alert-danger">
                        {t('calc.warnSplitMin', { min: calc.positions[0].lot, actual: fmtNum(calc.actual_split_risk), risk: fmtNum(calc.risk_amount) })}<br />
                        {t('calc.warnSplitFixDeposit', { risk })} <strong>${fmtNum(calc.min_deposit_for_split)}</strong>.<br />
                        {t('calc.warnSplitFixRisk', { deposit: fmtNum(parseFloat(deposit)) })} <strong>{calc.min_risk_for_split}%</strong>.<br />
                        {t('calc.warnSplitSuggest', { n: calc.suggested_split })}
                      </div>
                    )}
                  </>
                )}

                {calc.take_profits.length > 0 && (
                  <div className="card mb-3 border-warning">
                    <div className="card-header text-warning fw-semibold">{t('calc.breakEven')}</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="stat-label">{t('calc.locked')}</div>
                          <div className="text-accent fw-bold fs-5">+${fmtNum(calc.break_even.locked_profit_at_tp1)}</div>
                        </div>
                        <div className="col-md-6">
                          <div className="stat-label">{t('calc.remaining')}</div>
                          <div className="text-accent fw-bold fs-5">${fmtNum(calc.break_even.remaining_risk_after_be)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
