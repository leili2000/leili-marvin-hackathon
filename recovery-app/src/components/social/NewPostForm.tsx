import React, { useState } from 'react'
import type { PostType } from '../../types'

interface NewPostFormProps {
  onSubmit: (type: PostType, content: string) => void
  onCancel: () => void
}

const POST_TYPES: { value: PostType; label: string; description: string }[] = [
  {
    value: 'milestone',
    label: '🏆 Milestone',
    description: 'Share a win — big or small. Days clean, a goal reached, a moment of pride.',
  },
  {
    value: 'happy',
    label: '☀️ Something Good',
    description: 'Something that made you smile, feel grateful, or just a little lighter today.',
  },
  {
    value: 'vent',
    label: '💬 Vent',
    description: 'A hard day, a struggle, or a relapse. This is a safe space — no judgment here.',
  },
]

export const NewPostForm: React.FC<NewPostFormProps> = ({ onSubmit, onCancel }) => {
  const [selectedType, setSelectedType] = useState<PostType | null>(null)
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (!selectedType || !content.trim()) return
    onSubmit(selectedType, content.trim())
  }

  return (
    <div className="new-post-form">
      <h3 className="new-post-form__title">What would you like to share?</h3>
      <p className="new-post-form__note">
        Your post will be shown with an anonymous name. Replies come directly to you — privately.
      </p>

      <div className="new-post-form__types">
        {POST_TYPES.map((pt) => (
          <button
            key={pt.value}
            className={`post-type-btn ${selectedType === pt.value ? 'post-type-btn--selected' : ''}`}
            onClick={() => setSelectedType(pt.value)}
          >
            <span className="post-type-btn__label">{pt.label}</span>
            <span className="post-type-btn__desc">{pt.description}</span>
          </button>
        ))}
      </div>

      {selectedType && (
        <>
          <textarea
            className="textarea"
            rows={5}
            placeholder={
              selectedType === 'milestone'
                ? 'Tell us about your milestone...'
                : selectedType === 'happy'
                ? 'What made today a little better?'
                : 'This is your space. Say what you need to say.'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="new-post-form__actions">
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              Post anonymously
            </button>
            <button className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      {!selectedType && (
        <div className="new-post-form__actions">
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
