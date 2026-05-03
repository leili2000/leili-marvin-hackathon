import type { TrackingMode } from '../../types/index'

interface TrackingModeSelectorProps {
  currentMode: TrackingMode
  onChange: (mode: TrackingMode) => void
}

const modes: { value: TrackingMode; label: string; description: string }[] = [
  {
    value: 'daily_checkin',
    label: 'Daily Check-In',
    description: 'Manually log your status each day with optional notes.',
  },
  {
    value: 'auto_increment',
    label: 'Auto-Increment',
    description: 'Days count automatically. Just confirm or log a relapse when needed.',
  },
]

export function TrackingModeSelector({ currentMode, onChange }: TrackingModeSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0 }}>Tracking Mode</h3>
      {modes.map((mode) => {
        const isSelected = currentMode === mode.value
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '14px',
              border: isSelected ? '2px solid var(--color-primary, #4f8a6e)' : '2px solid #ddd',
              borderRadius: '8px',
              background: isSelected ? 'var(--color-primary-light, #e8f5e9)' : '#fff',
              cursor: 'pointer',
            }}
          >
            <strong>{mode.label}</strong>
            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
              {mode.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
