import { useState, useEffect } from 'react'
import { API } from '../lib/api'
import { useLang } from '../contexts/LangContext'

export default function Settings() {
  const { t } = useLang()
  const [form, setForm] = useState({
    currency: 'USD', default_deposit: 10000, default_risk: 1.0, min_lot: 0.01,
  })
  const [msg, setMsg]       = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    API.getSettings().then(s => setForm(s)).catch(console.error)
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const save = async () => {
    setSaving(true); setMsg(null)
    const payload = {
      currency:        form.currency,
      default_deposit: parseFloat(form.default_deposit),
      default_risk:    parseFloat(form.default_risk),
      min_lot:         parseFloat(form.min_lot),
    }
    try {
      await API.saveSettings(payload)
      setMsg({ type: 'success', text: t('settings.saved') })
    } catch (e) {
      setMsg({ type: 'danger', text: t('settings.failed') + e.message })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2><i className="bi bi-gear me-2 text-accent"></i>{t('settings.title')}</h2>
      </div>
      <div className="page-body">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">{t('settings.currency')}</label>
                  <select className="form-select" value={form.currency} onChange={set('currency')}>
                    <option value="USD">USD – US Dollar</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="UAH">UAH – Ukrainian Hryvnia</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('settings.deposit')}</label>
                  <input type="number" className="form-control" min="1"
                    value={form.default_deposit} onChange={set('default_deposit')} />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('settings.risk')}</label>
                  <input type="number" className="form-control" min="0.01" max="100" step="0.1"
                    value={form.default_risk} onChange={set('default_risk')} />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('settings.minLot')}</label>
                  <input type="number" className="form-control" min="0.001" max="100" step="0.001"
                    value={form.min_lot} onChange={set('min_lot')} />
                  <div className="form-text">{t('settings.minLotHint')}</div>
                </div>
                <button className="btn btn-accent w-100" onClick={save} disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('settings.saving')}</>
                    : <><i className="bi bi-floppy me-1"></i>{t('settings.save')}</>}
                </button>
                {msg && (
                  <div className={`alert alert-${msg.type} mt-3 mb-0`}>{msg.text}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
