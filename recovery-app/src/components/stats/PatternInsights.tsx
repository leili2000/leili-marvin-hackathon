import type { RelapsePattern, RelapseRiskAssessment } from '../../types/index'

interface PatternInsightsProps {
  patterns: RelapsePattern[]
  totalCleanDays: number
  totalDays: number
  relapseCount: number
  riskAssessment?: RelapseRiskAssessment
}

export function PatternInsights({
  patterns,
  totalCleanDays,
  totalDays,
  relapseCount,
  riskAssessment,
}: PatternInsightsProps) {
  const regressionPatterns = patterns.filter((p) => p.side === 'regression')
  const protectivePatterns = patterns.filter((p) => p.side === 'protective')

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Pattern Insights</h3>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '100px',
            padding: '12px',
            background: '#e8f8f0',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#27ae60' }}>
            {totalCleanDays}
          </div>
          <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>Clean Days</div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: '100px',
            padding: '12px',
            background: 'var(--color-surface-hover)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{totalDays}</div>
          <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>Total Days</div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: '100px',
            padding: '12px',
            background: '#fdecea',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#e74c3c' }}>
            {relapseCount}
          </div>
          <div style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>Relapses</div>
        </div>
      </div>

      {/* Regression Patterns */}
      {regressionPatterns.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px', color: '#e74c3c' }}>Regression Patterns</h4>
          {regressionPatterns.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '8px 12px',
                marginBottom: '6px',
                border: '1px solid #f5c6cb',
                borderRadius: '6px',
                background: 'var(--color-surface)',
              }}
            >
              <strong>{p.patternType}</strong>
              <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                ×{p.frequency}
              </span>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>{p.description}</div>
              {p.tags.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        marginRight: '4px',
                        borderRadius: '10px',
                        background: 'var(--color-surface-hover)',
                        fontSize: '0.75em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Protective Patterns */}
      {protectivePatterns.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px', color: '#27ae60' }}>Protective Patterns</h4>
          {protectivePatterns.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '8px 12px',
                marginBottom: '6px',
                border: '1px solid #c3e6cb',
                borderRadius: '6px',
                background: 'var(--color-surface)',
              }}
            >
              <strong>{p.patternType}</strong>
              <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                ×{p.frequency}
              </span>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>{p.description}</div>
              {p.tags.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        marginRight: '4px',
                        borderRadius: '10px',
                        background: 'var(--color-surface-hover)',
                        fontSize: '0.75em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {patterns.length === 0 && (
        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          No patterns detected yet. Keep logging check-ins to build insights.
        </p>
      )}
    </div>
  )
}
