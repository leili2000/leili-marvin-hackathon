import { useState, type FormEvent } from 'react'

interface AddHappyItemFormProps {
  onSubmit: (item: { title: string; description: string | null; energyLevel: number; prepLevel: number }) => Promise<void>
  onCancel: () => void
}

export function AddHappyItemForm({ onSubmit, onCancel }: AddHappyItemFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [energyLevel, setEnergyLevel] = useState(2)
  const [prepLevel, setPrepLevel] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (energyLevel < 1 || energyLevel > 5) {
      setError('Energy level must be between 1 and 5')
      return
    }
    if (prepLevel < 1 || prepLevel > 5) {
      setError('Prep level must be between 1 and 5')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        energyLevel,
        prepLevel,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <h4 style={{ margin: 0 }}>Add Happy Item</h4>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em' }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="happy-title" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
          Title *
        </label>
        <input
          id="happy-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div>
        <label htmlFor="happy-desc" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
          Description (optional)
        </label>
        <textarea
          id="happy-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ width: '100%', padding: '8px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="happy-energy" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            Energy Level (1–5)
          </label>
          <select
            id="happy-energy"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            style={{ width: '100%', padding: '8px' }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="happy-prep" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            Prep Level (1–5)
          </label>
          <select
            id="happy-prep"
            value={prepLevel}
            onChange={(e) => setPrepLevel(Number(e.target.value))}
            style={{ width: '100%', padding: '8px' }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '8px 16px',
            background: 'var(--color-primary, #4f8a6e)',
            color: 'var(--color-primary-contrast, #fff)',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  )
}
