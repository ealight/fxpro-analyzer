# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

```bash
npm install        # install dependencies (once)
npm run dev        # dev server with HMR at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the built dist/
```

Opening `dist/index.html` directly in a browser also works — all asset paths are relative (`./assets/...`). No server required.

## Architecture

Pure client-side React SPA. No backend, no server. All data lives in `localStorage`.

```
src/
  main.jsx          – React entry; imports Bootstrap CSS, Bootstrap Icons, style.css
  App.jsx           – Hash router (#dashboard, #calculator, etc.); applies stored theme
  style.css         – Dark theme variables and overrides on top of Bootstrap 5
  lib/
    parser.js       – Signal text → parsed object (regex, no ML)
    risk.js         – Lot size / R:R / profit math; all 23 instruments defined here
    storage.js      – localStorage CRUD for trades + settings; statistics calculations
    api.js          – Thin async facade over parser/risk/storage (same interface shape as old REST API)
    fmt.js          – fmtNum(), todayStr(), nowTimeStr()
  components/
    Sidebar.jsx     – Fixed nav sidebar
    TradeModal.jsx  – Add/edit trade modal (React-controlled, no Bootstrap JS)
  pages/
    Dashboard.jsx   – Stats grid from Storage.getStats()
    Calculator.jsx  – Signal parse → calculate → display → save to journal
    Journal.jsx     – Trades table with filters, sort, pagination, edit/delete
    Statistics.jsx  – Chart.js charts (line, bar, doughnut) via useRef
    Settings.jsx    – Persists currency, deposit, risk, theme, min_lot to localStorage
dist/               – Vite build output (gitignored)
```

## Key conventions

- `api.js` methods are all `async` even though they're synchronous locally — keeps call sites uniform.
- Instrument pip data lives in `src/lib/risk.js` `INSTRUMENT_DATA` constant.
- `min_lot` is read from settings inside `api.js#calculate()` — callers don't pass it.
- TradeModal uses `trade === undefined` for closed, `null` for new trade, object for edit.
- Charts are imperative Chart.js (not react-chartjs-2); each chart component destroys on unmount via `useEffect` cleanup.
- `base: './'` in `vite.config.js` is what makes `dist/index.html` work without a server.
