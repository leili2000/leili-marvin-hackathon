import React, { useState } from 'react'
import type { RelapsePattern } from '../../types'

interface PatternInsightsProps {
  patterns: RelapsePattern[]
  totalCleanDays: number
  totalDays: number
  relapseCount: number
}

export const PatternInsights: React.FC<PatternInsightsProps> = ({
  patterns,
  totalCleanDays,
  totalDays,
  relapseCount,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null)

  const cleanPercent = totalDays > 0 ? Math.round((totalCleanDays / totalDays) * 100) : 0

  return (
    <div className="pattern-insights">
      <h3 className="pattern-insights__title">Your patterns</h3>
      <p className="pattern-insights__intro">
        Based on what you've shared, here's what we've noticed. This isn't a judgment —
        it's a map. Understanding your patterns is part of the journey.
      </p>

      <div className="pattern-insights__summary">
        <div className="stat-card">
          <span className="stat-card__value">{totalCleanDays}</span>
          <span className="stat-card__label">clean days total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{cleanPercent}%</span>
          <span className="stat-card__label">of days logged clean</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{relapseCount}</span>
          <span className="stat-card__label">relapses logged</span>
        </div>
      </div>

      {patterns.length === 0 ? (
        <div className="pattern-insights__empty">
          <p>
            No patterns identified yet. As you log more check-ins and share what's behind
            hard days, we'll start reflecting insights back to you.
          </p>
        </div>
      ) : (
        <div className="pattern-insights__list">
          {patterns.map((p) => (
            <div
              key={p.id}
              className={`pattern-card ${expanded === p.id ? 'pattern-card--expanded' : ''}`}
            >
              <button
                className="pattern-card__header"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <span className="pattern-card__type">{p.patternType}</span>
                <span className="pattern-card__freq">
                  {p.frequency} {p.frequency === 1 ? 'time' : 'times'}
                </span>
                <span className="pattern-card__toggle">{expanded === p.id ? '▲' : '▼'}</span>
              </button>
              {expanded === p.id && (
                <div className="pattern-card__body">
                  <p>{p.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pattern-insights__positive">
        <h4>What's working</h4>
        <p>
          You've logged {totalCleanDays} clean days. That's {totalCleanDays} days you chose
          yourself. The patterns above aren't your identity — they're information you can use.
        </p>
      </div>
    </div>
  )
}
