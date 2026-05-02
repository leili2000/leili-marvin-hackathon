import React, { useState } from 'react'
import type { CheckIn } from '../../types'

interface DailyCheckInProps {
  todayCheckIn: CheckIn | null
  onSubmit: (status: 'clean' | 'relapse', note: string, relapseReason: string) => void
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ todayCheckIn, onSubmit }) => {
  const [status, setStatus] = useState<'clean' | 'relapse' | null>(
    todayCheckIn?.status ?? null
  )
  const [note, setNote] = useState(todayCheckIn?.note ?? '')
  const [relapseReason, setRelapseReason] = useState(todayCheckIn?.relapseReason ?? '')
  const [submitted, setSubmitted] = useState(!!todayCheckIn)

  const handleSubmit = () => {
    if (!status) return
    onSubmit(status, note, relapseReason)
    setSubmitted(true)
  }

  if (submitted && todayCheckIn) {
    return (
      <div className="daily-checkin daily-checkin--done">
        <div className="daily-checkin__icon">
          {todayCheckIn.status === 'clean' ? '✅' : '💙'}
        </div>
        <h3>Today's check-in is logged</h3>
        <p>
          {todayCheckIn.status === 'clean'
            ? 'You marked today as a clean day. Keep going.'
            : 'You logged a relapse today. That took courage. Recovery is not linear.'}
        </p>
        <button className="btn btn--ghost btn--sm" onClick={() => setSubmitted(false)}>
          Edit today's entry
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="daily-checkin daily-checkin--done">
        <div className="daily-checkin__icon">
          {status === 'clean' ? '✅' : '💙'}
        </div>
        <h3>Logged</h3>
        <p>
          {status === 'clean'
            ? 'Today is marked as a clean day.'
            : 'Today is logged. You showed up — that matters.'}
        </p>
      </div>
    )
  }

  return (
    <div className="daily-checkin">
      <h3 className="daily-checkin__title">How did today go?</h3>
      <p className="daily-checkin__subtitle">
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric',
        })}
      </p>

      <div className="daily-checkin__options">
        <button
          className={`checkin-btn checkin-btn--clean ${status === 'clean' ? 'checkin-btn--selected' : ''}`}
          onClick={() => setStatus('clean')}
        >
          <span className="checkin-btn__icon">✅</span>
          <span className="checkin-btn__label">Clean day</span>
          <span className="checkin-btn__desc">I stayed on track today</span>
        </button>

        <button
          className={`checkin-btn checkin-btn--relapse ${status === 'relapse' ? 'checkin-btn--selected' : ''}`}
          onClick={() => setStatus('relapse')}
        >
          <span className="checkin-btn__icon">💙</span>
          <span className="checkin-btn__label">Had a relapse</span>
          <span className="checkin-btn__desc">It happened — and I'm still here</span>
        </button>
      </div>

      {status && (
        <div className="daily-checkin__details">
          <label className="form-label">
            Anything you want to note about today? <span className="optional">(optional)</span>
          </label>
          <textarea
            className="textarea"
            rows={3}
            placeholder={
              status === 'clean'
                ? 'What helped you stay clean today? (e.g. went for a run, called my sponsor, kept busy) — we use this to find your patterns'
                : 'What was going on? No judgment — just for you.'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {status === 'relapse' && (
            <>
              <label className="form-label">
                What do you think led to it? <span className="optional">(optional — helps us find patterns)</span>
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Stress, a person, a place, a feeling... whatever comes to mind."
                value={relapseReason}
                onChange={(e) => setRelapseReason(e.target.value)}
              />
              <p className="daily-checkin__pattern-note">
                We use this to gently surface patterns over time — not to judge, just to help you understand yourself better.
              </p>
            </>
          )}

          <button className="btn btn--primary" onClick={handleSubmit}>
            Log today
          </button>
        </div>
      )}
    </div>
  )
}
