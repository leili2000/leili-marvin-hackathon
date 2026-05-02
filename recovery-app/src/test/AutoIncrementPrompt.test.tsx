import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AutoIncrementPrompt } from '../components/stats/AutoIncrementPrompt'

describe('AutoIncrementPrompt', () => {
  it('renders the daily prompt when not yet prompted today', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    expect(screen.getByText(/Good to see you today/i)).toBeInTheDocument()
  })

  it('shows done state when already prompted today', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate="2026-05-02"
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    expect(screen.getByText(/already checked in today/i)).toBeInTheDocument()
  })

  it('shows the confirm button to keep streak going', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    expect(screen.getByText(/keep my streak going/i)).toBeInTheDocument()
  })

  it('shows the relapse logging option', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    expect(screen.getByText(/log a relapse/i)).toBeInTheDocument()
  })

  it('calls onConfirm with note when confirmed', () => {
    const onConfirm = vi.fn()
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={onConfirm}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Feeling good' } })
    fireEvent.click(screen.getByText(/keep my streak going/i))
    expect(onConfirm).toHaveBeenCalledWith('Feeling good')
  })

  it('calls onConfirm with empty string when no note entered', () => {
    const onConfirm = vi.fn()
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={onConfirm}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/keep my streak going/i))
    expect(onConfirm).toHaveBeenCalledWith('')
  })

  it('shows relapse form when relapse button is clicked', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/log a relapse/i))
    expect(screen.getByText(/Thank you for telling us/i)).toBeInTheDocument()
  })

  it('shows compassionate messaging on relapse form', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/log a relapse/i))
    expect(screen.getByText(/real strength/i)).toBeInTheDocument()
  })

  it('shows pattern note on relapse form', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/log a relapse/i))
    expect(screen.getByText(/patterns/i)).toBeInTheDocument()
  })

  it('calls onRelapse with reason when relapse is logged', () => {
    const onRelapse = vi.fn()
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={onRelapse}
      />
    )
    fireEvent.click(screen.getByText(/log a relapse/i))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Stress' } })
    fireEvent.click(screen.getByText(/Log it and keep going/i))
    expect(onRelapse).toHaveBeenCalledWith('Stress')
  })

  it('can go back from relapse form to main prompt', () => {
    render(
      <AutoIncrementPrompt
        lastPromptDate={null}
        onConfirm={vi.fn()}
        onRelapse={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText(/log a relapse/i))
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText(/Good to see you today/i)).toBeInTheDocument()
  })
})
