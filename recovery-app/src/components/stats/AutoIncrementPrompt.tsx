import React, { useState } from 'react'

interface AutoIncrementPromptProps {
  cleanDays?: number
  lastPromptDate: string | null
  onConfirm: (note: string) => void
  onRelapse: (reason: string) => void
}

export const AutoIncrementPrompt: React.FC<AutoIncrementPromptProps> = ({
  lastPromptDate,
  onConfirm,
  onRelapse,
}) => {
  const [mode, setMode] = useState<'prompt' | 'relapse-form' | 'done'>('prompt')
  const [note, setNote] = useState('')
  const [relapseReason, setRelapseReason] = useState('')

  const today = new Date('2026-05-02').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const alreadyPromptedToday = lastPromptDate === '2026-05-02'

  if (alreadyPromptedToday || mode === 'done') {
    return (
      <div className="auto-prompt auto-prompt--done">
        <div className="auto-prompt__icon">🌱</div>
        <p>You've already checked in today. See you tomorrow.</p>
      </div>
    )
  }

  if (mode === 'relapse-form') {
    return (
      <div className="auto-prompt auto-prompt--relapse">
        <div className="auto-prompt__icon">💙</div>
        <h3>Thank you for telling us</h3>
        <p>
          It takes real strength to be honest about this. Recovery isn't a straight line —
          and you're still here, which means everything.
        </p>

        <label className="form-label">
          What was going on? <span className="optional">(optional)</span>
        </label>
        <textarea
          className="textarea"
          rows={4}
          placeholder="Anything you want to share — stress, a trigger, a feeling. This is just for you."
          value={relapseReason}
          onChange={(e) => setRelapseReason(e.target.value)}
        />
        <p className="auto-prompt__pattern-note">
          Over time, we'll gently reflect patterns back to you — not to judge, but to help you
          understand what leads to hard days and what helps you keep going.
        </p>

        <div className="auto-prompt__actions">
          <button
            className="btn btn--primary"
            onClick={() => { onRelapse(relapseReason); setMode('done') }}
          >
            Log it and keep going
          </button>
          <button className="btn btn--ghost" onClick={() => setMode('prompt')}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auto-prompt">
      <div className="auto-prompt__icon">🌅</div>
      <h3 className="auto-prompt__title">Good to see you today</h3>
      <p className="auto-prompt__date">{today}</p>
      <p className="auto-prompt__body">
        How are things going? We're assuming yesterday was a good day — just let us know
        if anything changed.
      </p>

      <label className="form-label">
        Anything on your mind today? <span className="optional">(optional)</span>
      </label>
      <textarea
        className="textarea"
        rows={3}
        placeholder="A win, a struggle, something you noticed..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="auto-prompt__actions">
        <button
          className="btn btn--primary"
          onClick={() => { onConfirm(note); setMode('done') }}
        >
          All good — keep my streak going
        </button>
        <button
          className="btn btn--ghost auto-prompt__relapse-btn"
          onClick={() => setMode('relapse-form')}
        >
          I need to log a relapse
        </button>
      </div>
    </div>
  )
}
