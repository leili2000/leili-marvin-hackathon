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

  const triggers   = patterns.filter((p) => p.side === 'regression')
  const habits     = patterns.filter((p) => p.side === 'protective')
  // Patterns without a side (legacy / unclassified) fall into triggers
  const unclassified = patterns.filter((p) => !p.side)

  const allTriggers = [...triggers, ...unclassified]

  const toggle = (id: string) => setExpanded(expanded === id ? null : id)

  return (
    <div className="pattern-insights">
      <h3 className="pattern-insights__title">Your patterns</h3>
      <p className="pattern-insights__intro">
        Based on what you've shared, here's what we've noticed. This isn't a judgment —
        it's a map. Understanding your patterns is part of the journey.
      </p>

      {/* ── Summary stats ── */}
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
            hard days or good ones, we'll start reflecting insights back to you.
          </p>
        </div>
      ) : (
        <>
          {/* ── What helps you stay clean ── */}
          {habits.length > 0 && (
            <div className="pattern-insights__section pattern-insights__section--protective">
              <h4 className="pattern-insights__section-title">
                🌱 What helps you stay clean
              </h4>
              <p className="pattern-insights__section-desc">
                These are the habits and conditions that show up on your good days.
              </p>
              <div className="pattern-insights__list">
                {habits.map((p) => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    expanded={expanded === p.id}
                    onToggle={() => toggle(p.id)}
                    variant="protective"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── What makes you regress ── */}
          {allTriggers.length > 0 && (
            <div className="pattern-insights__section pattern-insights__section--regression">
              <h4 className="pattern-insights__section-title">
                ⚠️ What tends to make you regress
              </h4>
              <p className="pattern-insights__section-desc">
                These are the triggers that have shown up before hard days. Knowing them
                is the first step to getting ahead of them.
              </p>
              <div className="pattern-insights__list">
                {allTriggers.map((p) => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    expanded={expanded === p.id}
                    onToggle={() => toggle(p.id)}
                    variant="regression"
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Sub-component ─────────────────────────────────────────────────────────────

interface PatternCardProps {
  pattern: RelapsePattern
  expanded: boolean
  onToggle: () => void
  variant: 'protective' | 'regression'
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, expanded, onToggle, variant }) => (
  <div className={`pattern-card pattern-card--${variant} ${expanded ? 'pattern-card--expanded' : ''}`}>
    <button className="pattern-card__header" onClick={onToggle}>
      <span className="pattern-card__type">{pattern.patternType}</span>
      <span className="pattern-card__freq">
        {pattern.frequency} {pattern.frequency === 1 ? 'time' : 'times'}
      </span>
      <span className="pattern-card__toggle">{expanded ? '▲' : '▼'}</span>
    </button>

    {expanded && (
      <div className="pattern-card__body">
        <p>{pattern.description}</p>
        {pattern.tags && pattern.tags.length > 0 && (
          <div className="pattern-card__tags">
            {pattern.tags.map((tag) => (
              <span key={tag} className={`tag tag--${variant}`}>{tag}</span>
            ))}
          </div>
        )}
        {pattern.lastSeen && (
          <p className="pattern-card__last-seen">
            Last seen: {new Date(pattern.lastSeen).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        )}
      </div>
    )}
  </div>
)
