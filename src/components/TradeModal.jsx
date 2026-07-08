import { useState, useEffect } from 'react'
import { todayStr, nowTimeStr } from '../lib/fmt'
import { useLang } from '../contexts/LangContext'

const EMPTY_FORM = {
  date: '', time: '', instrument: '', direction: 'BUY',
  status: 'OPEN', entry: '', stop_loss: '', lot: '',
  risk_percent: '', take_profits_raw: '', profit: '', notes: '',
}

function tradeToForm(trade) {
  if (!trade) return { ...EMPTY_FORM, date: todayStr(), time: nowTimeStr() }
  return {
    date:             trade.date        ?? todayStr(),
    time:             trade.time        ?? nowTimeStr(),
    instrument:       trade.instrument  ?? '',
    direction:        trade.direction   ?? 'BUY',
    status:           trade.status      ?? 'OPEN',
    entry:            trade.entry       ?? '',
    stop_loss:        trade.stop_loss   ?? '',
    lot:              trade.lot         ?? '',
    risk_percent:     trade.risk_percent ?? '',
    take_profits_raw: (trade.take_profits ?? []).join(', '),
    profit:           trade.profit      ?? '',
    notes:            trade.notes       ?? '',
  }
}

export default function TradeModal({ trade, onSave, onClose }) {
  const { t } = useLang()
  const [form, setForm] = useState(EMPTY_FORM)
  const isNew = trade === null

  useEffect(() => {
    if (trade !== undefined) setForm(tradeToForm(trade))
  }, [trade])

  if (trade === undefined) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = () => {
    const take_profits = form.take_profits_raw
      ? form.take_profits_raw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
      : []
    onSave({
      date:         form.date,
      time:         form.time,
      instrument:   form.instrument.trim().toUpperCase(),
      direction:    form.direction,
      status:       form.status,
      entry:        parseFloat(form.entry),
      stop_loss:    parseFloat(form.stop_loss),
      lot:          parseFloat(form.lot),
      risk_percent: parseFloat(form.risk_percent),
      take_profits,
      profit:       form.profit !== '' ? parseFloat(form.profit) : null,
      notes:        form.notes.trim() || null,
    })
  }

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">{isNew ? t('modal.addTrade') : t('modal.editTrade')}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.date')}</label>
                  <input type="date" className="form-control" value={form.date} onChange={set('date')} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">{t('modal.time')}</label>
                  <input type="time" className="form-control" value={form.time} onChange={set('time')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.instr')}</label>
                  <input type="text" className="form-control" value={form.instrument} onChange={set('instrument')} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">{t('modal.direction')}</label>
                  <select className="form-select" value={form.direction} onChange={set('direction')}>
                    <option>BUY</option><option>SELL</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small">{t('modal.status')}</label>
                  <select className="form-select" value={form.status} onChange={set('status')}>
                    <option>OPEN</option><option>CLOSED</option><option>CANCELLED</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.entry')}</label>
                  <input type="number" step="any" className="form-control" value={form.entry} onChange={set('entry')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.sl')}</label>
                  <input type="number" step="any" className="form-control" value={form.stop_loss} onChange={set('stop_loss')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.lot')}</label>
                  <input type="number" step="0.01" className="form-control" value={form.lot} onChange={set('lot')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">{t('modal.riskPct')}</label>
                  <input type="number" step="0.1" className="form-control" value={form.risk_percent} onChange={set('risk_percent')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">{t('modal.tps')}</label>
                  <input type="text" className="form-control" value={form.take_profits_raw} onChange={set('take_profits_raw')} placeholder="4159.2, 4166.1, 4180" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">{t('modal.pl')}</label>
                  <input type="number" step="any" className="form-control" value={form.profit} onChange={set('profit')} />
                </div>
                <div className="col-12">
                  <label className="form-label small">{t('modal.notes')}</label>
                  <textarea className="form-control" rows="2" value={form.notes} onChange={set('notes')}></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button className="btn btn-secondary" onClick={onClose}>{t('modal.cancel')}</button>
              <button className="btn btn-accent" onClick={handleSave}>{t('modal.save')}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }} onClick={onClose}></div>
    </>
  )
}
