import { useState } from 'react'
import type { HappyItem } from '../../types/index'
import { HappyItemCard } from './HappyItemCard'
import { AddHappyItemForm } from './AddHappyItemForm'

interface HappyListProps {
  items: HappyItem[]
  onAdd: (item: Omit<HappyItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function HappyList({ items, onAdd, onRemove }: HappyListProps) {
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async (item: { title: string; description: string | null; energyLevel: number; prepLevel: number }) => {
    await onAdd(item)
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Things That Make Me Happy</h3>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              padding: '6px 14px',
              background: 'var(--color-primary, #4f8a6e)',
              color: 'var(--color-primary-contrast, #fff)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            + Add item
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '12px' }}>
          <AddHappyItemForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          No items yet. Add something that makes you happy!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <HappyItemCard key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
