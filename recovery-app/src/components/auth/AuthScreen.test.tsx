import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthScreen } from './AuthScreen'

const defaultProps = {
  onSignIn: vi.fn().mockResolvedValue(undefined),
  onSignUp: vi.fn().mockResolvedValue(undefined),
  error: null,
  loading: false,
}

describe('AuthScreen', () => {
  it('renders sign-in form by default', () => {
    render(<AuthScreen {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('toggles to sign-up form', async () => {
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/recovery start date/i)).toBeInTheDocument()
  })

  it('toggles back to sign-in form', async () => {
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onSignIn with email and password', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} onSignIn={onSignIn} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    expect(onSignIn).toHaveBeenCalledWith('test@example.com', 'secret123')
  })

  it('displays error message on sign-in form', () => {
    render(<AuthScreen {...defaultProps} error="Invalid email or password" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('disables submit button when loading', () => {
    render(<AuthScreen {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  describe('SignUpForm', () => {
    it('calls onSignUp with all fields', async () => {
      const onSignUp = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} onSignUp={onSignUp} />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await user.type(screen.getByLabelText(/email/i), 'new@example.com')
      await user.type(screen.getByLabelText(/password/i), 'pass1234')
      await user.type(screen.getByLabelText(/username/i), 'testuser')

      // Default color is #4f8a6e, default date is today
      await user.click(screen.getByRole('button', { name: /sign up$/i }))

      expect(onSignUp).toHaveBeenCalledWith(
        'new@example.com',
        'pass1234',
        'testuser',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        '#4f8a6e'
      )
    })

    it('rejects invalid hex color on submit', async () => {
      const onSignUp = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} onSignUp={onSignUp} />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await user.type(screen.getByLabelText(/email/i), 'new@example.com')
      await user.type(screen.getByLabelText(/password/i), 'pass1234')
      await user.type(screen.getByLabelText(/username/i), 'testuser')

      // Clear default color and type invalid one
      const hexInput = screen.getByLabelText(/custom/i)
      await user.clear(hexInput)
      await user.type(hexInput, 'notahex')

      await user.click(screen.getByRole('button', { name: /sign up$/i }))

      expect(onSignUp).not.toHaveBeenCalled()
      expect(screen.getByText(/valid hex color/i)).toBeInTheDocument()
    })

    it('allows selecting a preset color', async () => {
      const onSignUp = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} onSignUp={onSignUp} />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await user.type(screen.getByLabelText(/email/i), 'new@example.com')
      await user.type(screen.getByLabelText(/password/i), 'pass1234')
      await user.type(screen.getByLabelText(/username/i), 'testuser')

      // Click a preset color swatch
      await user.click(screen.getByLabelText('Select color #5b8fb9'))

      await user.click(screen.getByRole('button', { name: /sign up$/i }))

      expect(onSignUp).toHaveBeenCalledWith(
        'new@example.com',
        'pass1234',
        'testuser',
        expect.any(String),
        '#5b8fb9'
      )
    })

    it('displays error from props on sign-up form', async () => {
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} error="Email already taken" />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Email already taken')
    })
  })
})
