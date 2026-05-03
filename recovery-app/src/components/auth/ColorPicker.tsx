import { isValidHex } from '../../lib/theme'

const PRESET_COLORS = [
  '#4f8a6e', // sage green
  '#5b8fb9', // calm blue
  '#7b68ae', // soft purple
  '#b07d62', // warm terracotta
  '#6a9e8f', // teal
  '#8e7cc3', // lavender
  '#c27c5e', // peach
  '#5c8a4d', // forest green
  '#6b8fad', // steel blue
  '#a0785a', // warm brown
]

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const isCustomValid = isValidHex(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Select color ${color}`}
            onClick={() => onChange(color)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: color,
              border: value === color ? '3px solid #333' : '2px solid #ccc',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
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
