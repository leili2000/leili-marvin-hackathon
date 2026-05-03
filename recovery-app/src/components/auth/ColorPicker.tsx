import { isValidHex } from '../../lib/theme'

const LIGHT_PRESETS = [
  { hex: '#4f8a6e', label: 'Sage Green' },
  { hex: '#5b8fb9', label: 'Calm Blue' },
  { hex: '#7b68ae', label: 'Soft Purple' },
  { hex: '#b07d62', label: 'Warm Terracotta' },
  { hex: '#6a9e8f', label: 'Teal' },
  { hex: '#8e7cc3', label: 'Lavender' },
  { hex: '#c27c5e', label: 'Peach' },
  { hex: '#5c8a4d', label: 'Forest Green' },
  { hex: '#6b8fad', label: 'Steel Blue' },
  { hex: '#a0785a', label: 'Warm Brown' },
]

const DARK_PRESETS = [
  { hex: '#1a3a2a', label: 'Dark Forest' },
  { hex: '#1a2a3a', label: 'Dark Navy' },
  { hex: '#2a1a3a', label: 'Dark Plum' },
  { hex: '#3a2a1a', label: 'Dark Espresso' },
  { hex: '#1a3a3a', label: 'Dark Teal' },
  { hex: '#2d2d3d', label: 'Dark Slate' },
  { hex: '#1e1e2e', label: 'Midnight' },
  { hex: '#2a1a2a', label: 'Dark Berry' },
]

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const isCustomValid = isValidHex(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Light themes */}
      <div>
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '6px' }}>Light themes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {LIGHT_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              aria-label={`Select color ${preset.label}`}
              title={preset.label}
              onClick={() => onChange(preset.hex)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: preset.hex,
                border: value === preset.hex ? '3px solid #333' : '2px solid #ccc',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Dark themes */}
      <div>
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '6px' }}>Dark themes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DARK_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              aria-label={`Select color ${preset.label}`}
              title={preset.label}
              onClick={() => onChange(preset.hex)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: preset.hex,
                border: value === preset.hex ? '3px solid #fff' : '2px solid #555',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom hex input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="custom-hex">Custom:</label>
        <input
          id="custom-hex"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#4f8a6e"
          maxLength={7}
          style={{
            width: '100px',
            padding: '4px 8px',
            border: `1px solid ${isCustomValid || value === '' ? '#ccc' : '#e74c3c'}`,
            borderRadius: '4px',
          }}
        />
        {value && !isCustomValid && (
          <span style={{ color: '#e74c3c', fontSize: '0.85em' }}>
            Invalid hex format
          </span>
        )}
        {isCustomValid && (
          <span
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: value,
              border: '1px solid #ccc',
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>
    </div>
  )
}
