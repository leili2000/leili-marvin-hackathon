import { useReducer } from 'react'
import { transitionBarrier, initialBarrierState } from '../../lib/ventBarrier'
import type { BarrierAnswer } from '../../types/index'

interface VentBarrierProps {
  onComplete: () => void
  onDecline: () => void
}

interface CheckQuestion {
  step: 'check1' | 'check2' | 'check3'
  question: string
  options: { label: string; value: BarrierAnswer; passes: boolean }[]
}

const CHECK_QUESTIONS: CheckQuestion[] = [
  {
    step: 'check1',
    question: 'How are you feeling right now?',
    options: [
      { label: 'Stable', value: 'yes', passes: true },
      { label: 'Okay', value: 'okay', passes: true },
      { label: 'Struggling', value: 'no', passes: false },
    ],
  },
  {
    step: 'check2',
    question: 'Do you have support available?',
    options: [
      { label: 'Yes', value: 'yes', passes: true },
      { label: 'Sort of', value: 'okay', passes: true },
      { label: 'Not really', value: 'no', passes: false },
    ],
  },
  {
    step: 'check3',
    question: 'Are you reading to support others or to feel less alone?',
    options: [
      { label: 'To support others', value: 'yes', passes: true },
      { label: 'Both', value: 'okay', passes: true },
      { label: 'Unsure', value: 'no', passes: false },
    ],
  },
]

export function VentBarrier({ onComplete, onDecline }: VentBarrierProps) {
  const [state, dispatch] = useReducer(transitionBarrier, initialBarrierState)

  const handleDecline = () => {
    dispatch({ type: 'DECLINE' })
    onDecline()
  }

  // Intro screen
  if (state.step === 'intro') {
    return (
      <div style={containerStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.1em', color: 'var(--color-text)' }}>
          Before you continue…
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.9em', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Vent posts can contain heavy content. We want to make sure you're in a good
          headspace before reading them. This quick check-in takes about 30 seconds.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => dispatch({ type: 'NEXT' })}
            style={primaryBtnStyle}
          >
            I'm ready to check in
          </button>
          <button
            type="button"
            onClick={handleDecline}
            style={secondaryBtnStyle}
          >
            Not right now
          </button>
        </div>
      </div>
    )
  }

  // Check questions (check1, check2, check3)
  const currentCheck = CHECK_QUESTIONS.find((q) => q.step === state.step)
  if (currentCheck) {
    const currentAnswer = state.answers[currentCheck.step]

    const handleAnswer = (value: BarrierAnswer) => {
      dispatch({ type: 'ANSWER', step: currentCheck.step, value })
    }

    const handleContinue = () => {
      const selected = currentCheck.options.find((o) => o.value === currentAnswer)
      if (!selected) return

      if (!selected.passes) {
        // "no" answer → decline
        handleDecline()
        return
      }

      // Advance to next step
      dispatch({ type: 'NEXT' })

      // If this was the last check, also mark as passed
      if (currentCheck.step === 'check3') {
        dispatch({ type: 'PASS' })
      }
    }

    const stepNumber = currentCheck.step === 'check1' ? 1 : currentCheck.step === 'check2' ? 2 : 3

    return (
      <div style={containerStyle}>
        <p style={{ margin: '0 0 4px', fontSize: '0.75em', color: 'var(--color-text-secondary)' }}>
          Step {stepNumber} of 3
        </p>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.05em', color: 'var(--color-text)' }}>
          {currentCheck.question}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {currentCheck.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleAnswer(opt.value)}
              style={{
                padding: '10px 16px',
                border: currentAnswer === opt.value
                  ? '2px solid var(--color-primary, #4f8a6e)'
                  : '1px solid var(--color-border)',
                borderRadius: '8px',
                background: currentAnswer === opt.value
                  ? 'var(--color-primary, #4f8a6e)' + '15'
                  : 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '0.9em',
                textAlign: 'left',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!currentAnswer}
            style={{
              ...primaryBtnStyle,
              opacity: currentAnswer ? 1 : 0.5,
              cursor: currentAnswer ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={handleDecline}
            style={secondaryBtnStyle}
          >
            Take me back
          </button>
        </div>
      </div>
    )
  }

  // Ready screen
  if (state.step === 'ready') {
    return (
      <div style={containerStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.1em', color: 'var(--color-text)' }}>
          You're all set
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.9em', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Remember, you can step away at any time. Take care of yourself first.
        </p>
        <button
          type="button"
          onClick={onComplete}
          style={primaryBtnStyle}
        >
          Continue to posts
        </button>
      </div>
    )
  }

  return null
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: '24px',
  background: 'var(--color-surface)',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  marginBottom: '16px',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--color-primary, #4f8a6e)',
  color: 'var(--color-primary-contrast, #fff)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9em',
  fontWeight: 'bold',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9em',
}
