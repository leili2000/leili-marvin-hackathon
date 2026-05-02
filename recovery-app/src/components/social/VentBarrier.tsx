import React, { useState } from 'react'

interface VentBarrierProps {
  onPass: () => void
  onDecline: () => void
}

type BarrierStep = 'intro' | 'check1' | 'check2' | 'check3' | 'ready'

const BARRIER_STEPS: BarrierStep[] = ['intro', 'check1', 'check2', 'check3', 'ready']

export const VentBarrier: React.FC<VentBarrierProps> = ({ onPass, onDecline }) => {
  const [step, setStep] = useState<BarrierStep>('intro')
  const [answers, setAnswers] = useState({ check1: '', check2: '', check3: '' })

  const next = () => {
    const idx = BARRIER_STEPS.indexOf(step)
    setStep(BARRIER_STEPS[idx + 1])
  }

  const handleCheck = (key: 'check1' | 'check2' | 'check3', value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const canProceedCheck1 = answers.check1 !== ''
  const canProceedCheck2 = answers.check2 !== ''
  const canProceedCheck3 = answers.check3 !== ''

  if (step === 'intro') {
    return (
      <div className="barrier">
        <div className="barrier__icon">🌿</div>
        <h2 className="barrier__title">A moment before you continue</h2>
        <p className="barrier__body">
          Some posts in this section share difficult experiences — relapses, hard days, and
          raw feelings. They're shared with courage, and reading them can stir up a lot.
        </p>
        <p className="barrier__body">
          We want to make sure you're in a good place to hold space for others right now.
          This will only take a moment.
        </p>
        <div className="barrier__actions">
          <button className="btn btn--primary" onClick={next}>
            I'm ready to check in
          </button>
          <button className="btn btn--ghost" onClick={onDecline}>
            Not right now
          </button>
        </div>
      </div>
    )
  }

  if (step === 'check1') {
    return (
      <div className="barrier">
        <div className="barrier__step">1 of 3</div>
        <h2 className="barrier__title">How are you feeling right now?</h2>
        <p className="barrier__body">
          Be honest with yourself — there's no wrong answer here.
        </p>
        <div className="barrier__options">
          {[
            { value: 'yes', label: 'Pretty stable. I feel grounded today.' },
            { value: 'okay', label: 'Okay. Not great, but I can handle it.' },
            { value: 'no', label: 'Honestly, I\'m struggling right now.' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`barrier__option ${answers.check1 === opt.value ? 'barrier__option--selected' : ''}`}
              onClick={() => handleCheck('check1', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {answers.check1 === 'no' && (
          <div className="barrier__redirect">
            <p>
              That's okay — and it matters that you know that about yourself right now.
              Reading heavy content when you're already struggling can make things harder.
            </p>
            <p>
              Consider reaching out to your support network, or come back to this section
              when you're feeling more steady.
            </p>
          </div>
        )}
        <div className="barrier__actions">
          {answers.check1 !== 'no' && (
            <button className="btn btn--primary" onClick={next} disabled={!canProceedCheck1}>
              Continue
            </button>
          )}
          {answers.check1 === 'no' && (
            <button className="btn btn--ghost" onClick={onDecline}>
              Take me back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'check2') {
    return (
      <div className="barrier">
        <div className="barrier__step">2 of 3</div>
        <h2 className="barrier__title">Do you have support available if you need it?</h2>
        <p className="barrier__body">
          Someone you can reach out to — a friend, sponsor, therapist, or crisis line.
        </p>
        <div className="barrier__options">
          {[
            { value: 'yes', label: 'Yes, I have people I can reach out to.' },
            { value: 'okay', label: 'Sort of — I have some resources.' },
            { value: 'no', label: 'Not really, I\'m on my own right now.' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`barrier__option ${answers.check2 === opt.value ? 'barrier__option--selected' : ''}`}
              onClick={() => handleCheck('check2', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {answers.check2 === 'no' && (
          <div className="barrier__redirect">
            <p>
              You don't have to go through this alone. SAMHSA's helpline is free, confidential,
              and available 24/7: <strong>1-800-662-4357</strong>
            </p>
            <p>
              Reading difficult posts without a support net can feel isolating. We'd rather
              you reach out first.
            </p>
          </div>
        )}
        <div className="barrier__actions">
          {answers.check2 !== 'no' && (
            <button className="btn btn--primary" onClick={next} disabled={!canProceedCheck2}>
              Continue
            </button>
          )}
          {answers.check2 === 'no' && (
            <button className="btn btn--ghost" onClick={onDecline}>
              Take me back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'check3') {
    return (
      <div className="barrier">
        <div className="barrier__step">3 of 3</div>
        <h2 className="barrier__title">Are you reading to support others, or to feel less alone?</h2>
        <p className="barrier__body">
          Both are valid — we just want you to be aware of your intention.
        </p>
        <div className="barrier__options">
          {[
            { value: 'yes', label: 'To support others and show them they\'re not alone.' },
            { value: 'okay', label: 'A bit of both, honestly.' },
            { value: 'no', label: 'I\'m not sure — I just feel drawn to it.' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`barrier__option ${answers.check3 === opt.value ? 'barrier__option--selected' : ''}`}
              onClick={() => handleCheck('check3', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {answers.check3 === 'no' && (
          <div className="barrier__redirect">
            <p>
              That pull toward difficult content when you're uncertain can sometimes be a sign
              that you need care yourself right now, not just to witness others' pain.
            </p>
            <p>
              It's okay to step back. Your wellbeing comes first.
            </p>
          </div>
        )}
        <div className="barrier__actions">
          {answers.check3 !== 'no' && (
            <button className="btn btn--primary" onClick={next} disabled={!canProceedCheck3}>
              Continue
            </button>
          )}
          {answers.check3 === 'no' && (
            <button className="btn btn--ghost" onClick={onDecline}>
              Take me back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'ready') {
    return (
      <div className="barrier">
        <div className="barrier__icon">💙</div>
        <h2 className="barrier__title">You're all set</h2>
        <p className="barrier__body">
          Thank you for taking that moment. The people who shared these posts did so with
          vulnerability and trust. Your presence here matters.
        </p>
        <p className="barrier__body">
          You'll see up to 3 posts at a time. After that, we'll check in with you again.
        </p>
        <div className="barrier__actions">
          <button className="btn btn--primary" onClick={onPass}>
            Continue to posts
          </button>
        </div>
      </div>
    )
  }

  return null
}
