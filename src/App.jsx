import { useState, useEffect } from 'react'
import { LangProvider } from './contexts/LangContext'
import Sidebar          from './components/Sidebar'
import Dashboard        from './pages/Dashboard'
import Calculator       from './pages/Calculator'
import ManualCalculator from './pages/ManualCalculator'
import Journal          from './pages/Journal'
import Statistics       from './pages/Statistics'
import Settings         from './pages/Settings'
import FAQ              from './pages/FAQ'

const PAGES = {
  dashboard:           Dashboard,
  calculator:          Calculator,
  'manual-calculator': ManualCalculator,
  journal:             Journal,
  statistics:          Statistics,
  settings:            Settings,
  faq:                 FAQ,
}

function getHash() {
  return window.location.hash.replace('#', '') || 'dashboard'
}

export default function App() {
  const [page, setPage] = useState(getHash)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark')

    const handler = () => setPage(getHash())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = (p) => {
    window.location.hash = p
    setPage(p)
  }

  const Page = PAGES[page] || Dashboard

  return (
    <LangProvider>
      <div className="d-flex" id="wrapper">
        <Sidebar currentPage={page} navigate={navigate} />
        <div id="content-wrapper" className="flex-grow-1">
          <Page />
        </div>
      </div>
    </LangProvider>
  )
}
