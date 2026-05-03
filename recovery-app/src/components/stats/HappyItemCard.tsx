import type { HappyItem } from '../../types/index'

interface HappyItemCardProps {
  item: HappyItem
  onRemove: (id: string) => void
}

function LevelBadge({ label, level }: { label: string; level: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8em',
        background: '#f0f0f0',
        color: '#555',
        marginRight: '6px',
      }}
    >
      {label}: {level}/5
    </span>
  )
}

export function HappyItemCard({ item, onRemove }: HappyItemCardProps) {
  return (
    <div
      style={{
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <strong>{item.title}</strong>
        {item.description && (
          <p style={{ margin: '4px 0 8px', fontSize: '0.9em', color: '#555' }}>
            {item.description}
          </p>
        )}
        <div>
          <LevelBadge label="Energy" level={item.energyLevel} />
          <LevelBadge label="Prep" level={item.prepLevel} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        title="Remove item"
        style={{
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          fontSize: '1.2em',
          padding: '4px',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
