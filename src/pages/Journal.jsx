import { useState, useEffect, useCallback } from 'react'
import { API } from '../lib/api'
import { fmtNum } from '../lib/fmt'
import TradeModal from '../components/TradeModal'
import { useLang } from '../contexts/LangContext'

function DirBadge({ dir }) {
  return <span className={`badge ${dir === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{dir}</span>
}

function StatusBadge({ status }) {
  return <span className={`status-${(status || '').toLowerCase()}`}>{status}</span>
}

function Profit({ n }) {
  if (n == null) return <span className="profit-zero">—</span>
  const cls  = n > 0 ? 'profit-pos' : n < 0 ? 'profit-neg' : 'profit-zero'
  const sign = n > 0 ? '+' : ''
  return <span className={cls}>{sign}{fmtNum(n)}</span>
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) pages.push(p)
    else if (Math.abs(p - page) === 3) pages.push('…')
  }
  return (
    <nav><ul className="pagination pagination-sm mb-0">
      <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
        <a className="page-link" href="#" onClick={e => { e.preventDefault(); onPage(page - 1) }}>‹</a>
      </li>
      {pages.map((p, i) =>
        p === '…'
          ? <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
          : <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
              <a className="page-link" href="#" onClick={e => { e.preventDefault(); onPage(p) }}>{p}</a>
            </li>
      )}
      <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
        <a className="page-link" href="#" onClick={e => { e.preventDefault(); onPage(page + 1) }}>›</a>
      </li>
    </ul></nav>
  )
}

export default function Journal() {
  const { t } = useLang()
  const [page, setPage]           = useState(1)
  const [sortBy, setSortBy]       = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filters, setFilters]     = useState({ instrument: '', direction: '', status: '', date_from: '', date_to: '' })
  const [pendingFilters, setPending] = useState({ instrument: '', direction: '', status: '', date_from: '', date_to: '' })
  const [data, setData]           = useState({ items: [], total: 0, total_pages: 1 })
  const [loading, setLoading]     = useState(false)
  const [modalTrade, setModalTrade] = useState(undefined)

  const loadPage = useCallback(async (p, f = filters, sb = sortBy, so = sortOrder) => {
    setLoading(true)
    try {
      const result = await API.getTrades({ ...f, page: p, page_size: 20, sort_by: sb, sort_order: so })
      setData(result)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy, sortOrder])

  useEffect(() => { loadPage(1) }, [])

  const applyFilters = () => {
    setFilters(pendingFilters)
    loadPage(1, pendingFilters, sortBy, sortOrder)
  }

  const handleSort = (col) => {
    const newOrder = sortBy === col && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(col); setSortOrder(newOrder)
    loadPage(1, filters, col, newOrder)
  }

  const editTrade = async (id) => {
    const trade = await API.getTrade(id)
    setModalTrade(trade)
  }

  const deleteTrade = async (id) => {
    if (!confirm(t('journal.deleteConfirm'))) return
    await API.deleteTrade(id)
    loadPage(page)
  }

  const handleModalSave = async (payload) => {
    try {
      if (modalTrade && modalTrade.id) await API.updateTrade(modalTrade.id, payload)
      else await API.createTrade(payload)
      setModalTrade(undefined)
      loadPage(page)
    } catch (e) { alert(t('journal.saveFailed') + e.message) }
  }

  const sf = (field) => (e) => setPending(f => ({ ...f, [field]: e.target.value }))

  return (
    <>
      <div className="page-header d-flex align-items-center justify-content-between">
        <h2><i className="bi bi-journal-text me-2 text-accent"></i>{t('journal.title')}</h2>
        <button className="btn btn-accent btn-sm" onClick={() => setModalTrade(null)}>
          <i className="bi bi-plus-lg me-1"></i>{t('journal.addTrade')}
        </button>
      </div>
      <div className="page-body">

        <div className="card mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-end">
              <div className="col-sm-3">
                <label className="form-label small mb-1">{t('journal.instrument')}</label>
                <input type="text" className="form-control form-control-sm" value={pendingFilters.instrument} onChange={sf('instrument')} placeholder="XAU/USD…" />
              </div>
              <div className="col-sm-2">
                <label className="form-label small mb-1">{t('journal.direction')}</label>
                <select className="form-select form-select-sm" value={pendingFilters.direction} onChange={sf('direction')}>
                  <option value="">{t('journal.all')}</option><option value="BUY">BUY</option><option value="SELL">SELL</option>
                </select>
              </div>
              <div className="col-sm-2">
                <label className="form-label small mb-1">{t('journal.status')}</label>
                <select className="form-select form-select-sm" value={pendingFilters.status} onChange={sf('status')}>
                  <option value="">{t('journal.all')}</option>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="col-sm-2">
                <label className="form-label small mb-1">{t('journal.from')}</label>
                <input type="date" className="form-control form-control-sm" value={pendingFilters.date_from} onChange={sf('date_from')} />
              </div>
              <div className="col-sm-2">
                <label className="form-label small mb-1">{t('journal.to')}</label>
                <input type="date" className="form-control form-control-sm" value={pendingFilters.date_to} onChange={sf('date_to')} />
              </div>
              <div className="col-sm-1">
                <button className="btn btn-accent btn-sm w-100" onClick={applyFilters}>
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('date')}>
                      {t('journal.date')} <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th>{t('journal.instrument')}</th>
                    <th>Dir</th>
                    <th>{t('journal.entry')}</th>
                    <th>{t('journal.sl')}</th>
                    <th>{t('journal.lot')}</th>
                    <th>{t('journal.riskPct')}</th>
                    <th>{t('journal.profit')}</th>
                    <th>{t('journal.status')}</th>
                    <th>{t('journal.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="10" className="text-center text-muted py-3">
                      <span className="spinner-border spinner-border-sm"></span>
                    </td></tr>
                  ) : data.items.length === 0 ? (
                    <tr><td colSpan="10" className="text-center text-muted py-4">{t('journal.noTrades')}</td></tr>
                  ) : data.items.map(trade => (
                    <tr key={trade.id}>
                      <td>{trade.date} {trade.time}</td>
                      <td>{trade.instrument}</td>
                      <td><DirBadge dir={trade.direction} /></td>
                      <td>{fmtNum(trade.entry, 5)}</td>
                      <td>{fmtNum(trade.stop_loss, 5)}</td>
                      <td>{trade.lot}</td>
                      <td>{trade.risk_percent}%</td>
                      <td><Profit n={trade.profit} /></td>
                      <td><StatusBadge status={trade.status} /></td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary py-0 me-1" onClick={() => editTrade(trade.id)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger py-0" onClick={() => deleteTrade(trade.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            {t('journal.showing')} {data.items.length} {t('journal.of')} {data.total} {t('journal.trades')}
          </small>
          <Pagination page={page} totalPages={data.total_pages} onPage={p => loadPage(p)} />
        </div>
      </div>

      <TradeModal trade={modalTrade} onSave={handleModalSave} onClose={() => setModalTrade(undefined)} />
    </>
  )
}
