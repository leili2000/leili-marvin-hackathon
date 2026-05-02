import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NewPostForm } from '../components/social/NewPostForm'

describe('NewPostForm', () => {
  it('renders all three post type options', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/Milestone/i)).toBeInTheDocument()
    expect(screen.getByText(/Something Good/i)).toBeInTheDocument()
    expect(screen.getByText(/Vent/i)).toBeInTheDocument()
  })

  it('does not show textarea until a type is selected', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows textarea after selecting milestone', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Milestone/i))
    expect(screen.getByPlaceholderText(/Tell us about your milestone/i)).toBeInTheDocument()
  })

  it('shows textarea after selecting happy', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Something Good/i))
    expect(screen.getByPlaceholderText(/What made today a little better/i)).toBeInTheDocument()
  })

  it('shows vent-specific placeholder after selecting vent', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Vent/i))
    expect(screen.getByPlaceholderText(/This is your space/i)).toBeInTheDocument()
  })

  it('submit button is disabled when content is empty', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Milestone/i))
    expect(screen.getByText('Post anonymously')).toBeDisabled()
  })

  it('submit button is enabled when content is filled', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Milestone/i))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '30 days!' } })
    expect(screen.getByText('Post anonymously')).not.toBeDisabled()
  })

  it('calls onSubmit with correct type and content', () => {
    const onSubmit = vi.fn()
    render(<NewPostForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Milestone/i))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '30 days clean!' } })
    fireEvent.click(screen.getByText('Post anonymously'))
    expect(onSubmit).toHaveBeenCalledWith('milestone', '30 days clean!')
  })

  it('trims whitespace from content before submitting', () => {
    const onSubmit = vi.fn()
    render(<NewPostForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText(/Something Good/i))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Great day!  ' } })
    fireEvent.click(screen.getByText('Post anonymously'))
    expect(onSubmit).toHaveBeenCalledWith('happy', 'Great day!')
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<NewPostForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows anonymous posting note', () => {
    render(<NewPostForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/anonymous name/i)).toBeInTheDocument()
  })
})
