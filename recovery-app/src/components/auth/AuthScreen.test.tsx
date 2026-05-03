import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthScreen } from './AuthScreen'

const defaultProps = {
  onSignIn: vi.fn().mockResolvedValue(undefined),
  onSignUp: vi.fn().mockResolvedValue(undefined),
  error: null,
}

describe('AuthScreen', () => {
  it('renders sign-in form by default', () => {
    render(<AuthScreen {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('toggles to sign-up form', async () => {
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/recovery start date/i)).toBeInTheDocument()
  })

  it('toggles back to sign-in form', async () => {
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onSignIn with username and password', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<AuthScreen {...defaultProps} onSignIn={onSignIn} />)

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    expect(onSignIn).toHaveBeenCalledWith('testuser', 'secret123')
  })

  it('displays error message on sign-in form', () => {
    render(<AuthScreen {...defaultProps} error="Invalid username or password" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password')
  })

  describe('SignUpForm', () => {
    it('calls onSignUp with all fields', async () => {
      const onSignUp = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} onSignUp={onSignUp} />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'pass1234')

      await user.click(screen.getByRole('button', { name: /sign up$/i }))

      expect(onSignUp).toHaveBeenCalledWith(
        'testuser',
        'pass1234',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        '#4f8a6e'
      )
    })

    it('rejects invalid hex color on submit', async () => {
      const onSignUp = vi.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} onSignUp={onSignUp} />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'pass1234')

      const hexInput = screen.getByLabelText(/custom/i)
      await user.clear(hexInput)
      await user.type(hexInput, 'notahex')

      await user.click(screen.getByRole('button', { name: /sign up$/i }))

      expect(onSignUp).not.toHaveBeenCalled()
      expect(screen.getByText(/valid hex color/i)).toBeInTheDocument()
    })

    it('displays error from props on sign-up form', async () => {
      const user = userEvent.setup()
      render(<AuthScreen {...defaultProps} error="Username already taken" />)

      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Username already taken')
    })
  })
})
