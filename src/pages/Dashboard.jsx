import { useState, useEffect } from 'react'
import { API } from '../lib/api'
import { fmtNum } from '../lib/fmt'
import { useLang } from '../contexts/LangContext'

function StatCard({ label, value, cls = '' }) {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${cls}`}>{value}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useLang()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    API.getStats().then(setStats).catch(e => setError(e.message))
  }, [])

  const p = (n, dec = 2) => fmtNum(n, dec)

  return (
    <>
      <div className="page-header">
        <h2><i className="bi bi-speedometer2 me-2 text-accent"></i>{t('dashboard.title')}</h2>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {!stats && !error && (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-accent"></div>
          </div>
        )}
        {stats && (
          <div className="row g-3">
            <StatCard label={t('dashboard.deposit')}      value={`$${p(stats.current_deposit)}`} />
            <StatCard label={t('dashboard.balance')}      value={`$${p(stats.current_balance)}`}  cls={stats.total_profit >= 0 ? 'profit-pos' : 'profit-neg'} />
            <StatCard label={t('dashboard.totalPL')}      value={`${stats.total_profit >= 0 ? '+' : ''}$${p(stats.total_profit)}`} cls={stats.total_profit >= 0 ? 'profit-pos' : 'profit-neg'} />
            <StatCard label={t('dashboard.todayPL')}      value={`${stats.today_profit  >= 0 ? '+' : ''}$${p(stats.today_profit)}`}  cls={stats.today_profit  >= 0 ? 'profit-pos' : 'profit-neg'} />
            <StatCard label={t('dashboard.openTrades')}   value={stats.open_trades}   cls="text-accent" />
            <StatCard label={t('dashboard.closedTrades')} value={stats.closed_trades} />
            <StatCard label={t('dashboard.winRate')}      value={`${p(stats.win_rate)}%`} cls={stats.win_rate >= 50 ? 'profit-pos' : 'profit-neg'} />
            <StatCard label={t('dashboard.avgRR')}        value={`1:${p(stats.avg_rr)}`} />
            <StatCard label={t('dashboard.profitFactor')} value={p(stats.profit_factor)} />
            <StatCard label={t('dashboard.expectancy')}   value={`${stats.expectancy >= 0 ? '+' : ''}$${p(stats.expectancy)}`} cls={stats.expectancy >= 0 ? 'profit-pos' : 'profit-neg'} />
            <StatCard label={t('dashboard.avgWin')}       value={`+$${p(stats.avg_win)}`}   cls="profit-pos" />
            <StatCard label={t('dashboard.avgLoss')}      value={`$${p(stats.avg_loss)}`}   cls="profit-neg" />
            <StatCard label={t('dashboard.largestWin')}   value={`+$${p(stats.largest_win)}`}  cls="profit-pos" />
            <StatCard label={t('dashboard.largestLoss')}  value={`$${p(stats.largest_loss)}`} cls="profit-neg" />
            <StatCard label={t('dashboard.maxDrawdown')}  value={`${p(stats.max_drawdown)}%`} cls="profit-neg" />
          </div>
        )}
      </div>
    </>
  )
}
