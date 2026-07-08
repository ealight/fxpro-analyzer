import { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { API } from '../lib/api'
import { useLang } from '../contexts/LangContext'

const COLORS = { green: '#4caf82', red: '#ef4444', blue: '#3b82f6', yellow: '#f59e0b' }

const DARK_SCALES = {
  x: { ticks: { color: '#6b7280' }, grid: { color: '#2a2e38' } },
  y: { ticks: { color: '#6b7280' }, grid: { color: '#2a2e38' } },
}
const DARK_LEGEND = { labels: { color: '#d0d5e0' } }

function LineChart({ data, color }) {
  const ref   = useRef(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!ref.current || !data) return
    chart.current?.destroy()
    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0]?.data ?? [],
          borderColor: color,
          backgroundColor: color + '22',
          fill: true, tension: 0.3,
          pointRadius: data.labels.length > 50 ? 0 : 3,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: DARK_SCALES,
      },
    })
    return () => chart.current?.destroy()
  }, [data, color])
  return <canvas ref={ref} height="200"></canvas>
}

function BarChart({ data }) {
  const ref   = useRef(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!ref.current || !data) return
    chart.current?.destroy()
    const vals = data.datasets[0]?.data ?? []
    chart.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.datasets[0]?.label ?? '',
          data: vals,
          backgroundColor: vals.map(v => v >= 0 ? COLORS.green + 'cc' : COLORS.red + 'cc'),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: DARK_SCALES,
      },
    })
    return () => chart.current?.destroy()
  }, [data])
  return <canvas ref={ref} height="200"></canvas>
}

function PieChart({ data }) {
  const ref   = useRef(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!ref.current || !data) return
    chart.current?.destroy()
    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0]?.data ?? [],
          backgroundColor: [COLORS.green, COLORS.red, COLORS.yellow],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: DARK_LEGEND },
      },
    })
    return () => chart.current?.destroy()
  }, [data])
  return <canvas ref={ref} height="200"></canvas>
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  )
}

export default function Statistics() {
  const { t } = useLang()
  const [cd, setCd]     = useState(null)
  const [error, setErr] = useState(null)

  useEffect(() => {
    API.getCharts().then(setCd).catch(e => setErr(e.message))
  }, [])

  return (
    <>
      <div className="page-header">
        <h2><i className="bi bi-bar-chart-line me-2 text-accent"></i>{t('statistics.title')}</h2>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {!cd && !error && <div className="text-center py-5"><div className="spinner-border text-accent"></div></div>}
        {cd && (
          <div className="row g-4">
            <div className="col-lg-6"><ChartCard title={t('statistics.equity')}><LineChart data={cd.equity_curve}     color={COLORS.green} /></ChartCard></div>
            <div className="col-lg-6"><ChartCard title={t('statistics.balance')}><LineChart data={cd.balance_curve}    color={COLORS.blue}  /></ChartCard></div>
            <div className="col-lg-6"><ChartCard title={t('statistics.monthly')}><BarChart  data={cd.monthly_profit}  /></ChartCard></div>
            <div className="col-lg-6"><ChartCard title={t('statistics.winLoss')}><PieChart  data={cd.win_rate_pie}    /></ChartCard></div>
            <div className="col-lg-6"><ChartCard title={t('statistics.drawdown')}><LineChart data={cd.drawdown}        color={COLORS.red}   /></ChartCard></div>
            <div className="col-lg-6"><ChartCard title={t('statistics.rrDist')}><BarChart   data={cd.rr_distribution} /></ChartCard></div>
            <div className="col-12"><ChartCard   title={t('statistics.profitDist')}><BarChart data={cd.profit_distribution} /></ChartCard></div>
          </div>
        )}
      </div>
    </>
  )
}
