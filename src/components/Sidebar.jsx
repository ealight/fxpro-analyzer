import { useLang } from '../contexts/LangContext'

export default function Sidebar({ currentPage, navigate }) {
  const { lang, switchLang, t } = useLang()

  const NAV_ITEMS = [
    { page: 'dashboard',          icon: 'bi-speedometer2',    label: t('nav.dashboard')   },
    { page: 'calculator',         icon: 'bi-lightning-charge', label: t('nav.parsingCalc') },
    { page: 'manual-calculator',  icon: 'bi-sliders',         label: t('nav.calculator')  },
    { page: 'journal',            icon: 'bi-journal-text',    label: t('nav.journal')     },
    { page: 'statistics',         icon: 'bi-bar-chart-line',  label: t('nav.statistics')  },
    { page: 'settings',           icon: 'bi-gear',            label: t('nav.settings')    },
    { page: 'faq',                icon: 'bi-question-circle', label: t('nav.faq')         },
  ]

  return (
    <nav id="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-graph-up-arrow me-2 text-accent"></i>
        <span>FxPro Analyzer</span>
      </div>
      <ul className="nav flex-column mt-3">
        {NAV_ITEMS.map(({ page, icon, label }) => (
          <li className="nav-item" key={page}>
            <a
              className={`nav-link${currentPage === page ? ' active' : ''}`}
              href={`#${page}`}
              onClick={e => { e.preventDefault(); navigate(page) }}
            >
              <i className={`bi ${icon}`}></i> {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted">{t('nav.version')}</small>
          <div className="d-flex gap-1">
            <button
              className={`btn btn-sm py-0 px-2 ${lang === 'en' ? 'btn-accent' : 'btn-outline-secondary'}`}
              style={{ fontSize: '.7rem' }}
              onClick={() => switchLang('en')}
            >EN</button>
            <button
              className={`btn btn-sm py-0 px-2 ${lang === 'uk' ? 'btn-accent' : 'btn-outline-secondary'}`}
              style={{ fontSize: '.7rem' }}
              onClick={() => switchLang('uk')}
            >UA</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
