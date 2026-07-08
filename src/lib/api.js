import { parse }       from './parser'
import { calculate }   from './risk'
import { getSettings, saveSettings, createTrade, getTrades, getTradeById, updateTrade, deleteTrade, getStats, getCharts } from './storage'

export const API = {
  async parse(signal_text) {
    return parse(signal_text)
  },

  async calculate(payload) {
    const s = getSettings()
    return calculate({ ...payload, min_lot: s.min_lot })
  },

  async getTrades(params = {})  { return getTrades(params) },
  async getTrade(id)            { const t = getTradeById(id); if (!t) throw new Error('Trade not found'); return t },
  async createTrade(data)       { return createTrade(data) },
  async updateTrade(id, data)   { const t = updateTrade(id, data); if (!t) throw new Error('Trade not found'); return t },
  async deleteTrade(id)         { deleteTrade(id); return null },
  async getStats()              { return getStats() },
  async getCharts()             { return getCharts() },
  async getSettings()           { return getSettings() },
  async saveSettings(data)      { return saveSettings(data) },
}
