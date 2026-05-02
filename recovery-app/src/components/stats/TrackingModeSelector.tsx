import React from 'react'
import type { TrackingMode } from '../../types'

interface TrackingModeSelectorProps {
  current: TrackingMode
  onChange: (mode: TrackingMode) => void
}

export const TrackingModeSelector: React.FC<TrackingModeSelectorProps> = ({
  current,
  onChange,
}) => {
  return (
    <div className="tracking-mode-selector">
      <h3 className="tracking-mode-selector__title">How do you want to track your progress?</h3>
      <p className="tracking-mode-selector__subtitle">You can change this at any time.</p>

      <div className="tracking-mode-selector__options">
        <button
          className={`mode-btn ${current === 'daily_checkin' ? 'mode-btn--selected' : ''}`}
          onClick={() => onChange('daily_checkin')}
        >
          <span className="mode-btn__icon">📋</span>
          <div className="mode-btn__text">
            <span className="mode-btn__name">Daily check-in</span>
            <span className="mode-btn__desc">
              You confirm each day manually. Missed days can be filled in later — no pressure,
              but no assumptions either.
            </span>
          </div>
        </button>

        <button
          className={`mode-btn ${current === 'auto_increment' ? 'mode-btn--selected' : ''}`}
          onClick={() => onChange('auto_increment')}
        >
          <span className="mode-btn__icon">🌱</span>
          <div className="mode-btn__text">
            <span className="mode-btn__name">Auto-increment</span>
            <span className="mode-btn__desc">
              We assume each day was a good day unless you tell us otherwise. You'll still
              get a daily prompt when you log in — just lighter.
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
