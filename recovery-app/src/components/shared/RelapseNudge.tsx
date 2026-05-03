import type { RelapseRiskAssessment } from '../../types/index'

interface RelapseNudgeProps {
  assessment: RelapseRiskAssessment | null
  onDismiss: () => void
  onLogMilestone: () => void
}

export function RelapseNudge({ assessment, onDismiss, onLogMilestone }: RelapseNudgeProps) {
  if (!assessment || !assessment.suggestedAction) return null

  const { suggestedAction } = assessment

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '14px 16px',
        background: 'var(--color-primary-light, #a8d5ba)',
        borderTop: '2px solid var(--color-primary, #4f8a6e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <p style={{ margin: 0, fontSize: '0.95em', color: 'var(--color-primary-dark, #3a6b52)' }}>
          {suggestedAction.message}
        </p>
        {suggestedAction.type === 'happy_item_suggestion' &&
          suggestedAction.askIfDoneRecently && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.85em',
                color: 'var(--color-primary-dark, #3a6b52)',
                fontStyle: 'italic',
              }}
            >
              Have you been able to do that recently?
            </p>
          )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {suggestedAction.type === 'milestone_prompt' && (
          <button
            type="button"
            onClick={onLogMilestone}
            style={{
              padding: '6px 14px',
              background: 'var(--color-primary, #4f8a6e)',
              color: 'var(--color-primary-contrast, #ffffff)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: 500,
            }}
          >
            Log milestone
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            color: 'var(--color-primary-dark, #3a6b52)',
            border: '1px solid var(--color-primary, #4f8a6e)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
