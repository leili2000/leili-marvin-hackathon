import { useState } from 'react'
import { SocialTab } from './components/social/SocialTab'
import { StatsTab } from './components/stats/StatsTab'
import './App.css'

type Tab = 'social' | 'stats'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('social')

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo">🌱</span>
            <span className="app-header__name">Recover</span>
          </div>
          <div className="app-header__user">Alex M.</div>
        </div>
      </header>

      <nav className="app-tabs">
        <button
          className={`app-tab ${activeTab === 'social' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Community
        </button>
        <button
          className={`app-tab ${activeTab === 'stats' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          My Progress
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'social' ? <SocialTab /> : <StatsTab />}
      </main>
    </div>
  )
}

export default App
