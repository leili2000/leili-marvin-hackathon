import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VentBarrier } from '../components/social/VentBarrier'

describe('VentBarrier', () => {
  it('renders the intro step first', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    expect(screen.getByText(/A moment before you continue/i)).toBeInTheDocument()
  })

  it('shows context about vent posts on intro', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    expect(screen.getByText(/difficult experiences/i)).toBeInTheDocument()
  })

  it('calls onDecline when "Not right now" is clicked on intro', () => {
    const onDecline = vi.fn()
    render(<VentBarrier onPass={onDecline} onDecline={onDecline} />)
    fireEvent.click(screen.getByText('Not right now'))
    expect(onDecline).toHaveBeenCalled()
  })

  it('advances to step 1 after clicking ready', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    expect(screen.getByText(/How are you feeling right now/i)).toBeInTheDocument()
  })

  it('shows step indicator on check steps', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('continue button is disabled until an option is selected on step 1', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    expect(screen.getByText('Continue')).toBeDisabled()
  })

  it('shows redirect message when user says they are struggling on step 1', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/I'm struggling right now/i))
    expect(screen.getByText(/Take me back/i)).toBeInTheDocument()
  })

  it('calls onDecline when redirected from step 1', () => {
    const onDecline = vi.fn()
    render(<VentBarrier onPass={vi.fn()} onDecline={onDecline} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/I'm struggling right now/i))
    fireEvent.click(screen.getByText('Take me back'))
    expect(onDecline).toHaveBeenCalled()
  })

  it('advances to step 2 after a positive answer on step 1', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
    expect(screen.getByText(/Do you have support available/i)).toBeInTheDocument()
  })

  it('shows SAMHSA helpline when user has no support on step 2', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/Not really/i))
    expect(screen.getByText(/1-800-662-4357/)).toBeInTheDocument()
  })

  it('advances to step 3 after positive answer on step 2', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/Yes, I have people/i))
    fireEvent.click(screen.getByText('Continue'))
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
  })

  it('reaches the ready screen after all three positive answers', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    // Intro
    fireEvent.click(screen.getByText("I'm ready to check in"))
    // Step 1
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    // Step 2
    fireEvent.click(screen.getByText(/Yes, I have people/i))
    fireEvent.click(screen.getByText('Continue'))
    // Step 3
    fireEvent.click(screen.getByText(/To support others/i))
    fireEvent.click(screen.getByText('Continue'))
    // Ready
    expect(screen.getByText("You're all set")).toBeInTheDocument()
  })

  it('calls onPass when user clicks continue on the ready screen', () => {
    const onPass = vi.fn()
    render(<VentBarrier onPass={onPass} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/Yes, I have people/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/To support others/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText('Continue to posts'))
    expect(onPass).toHaveBeenCalled()
  })

  it('shows 3-post limit info on the ready screen', () => {
    render(<VentBarrier onPass={vi.fn()} onDecline={vi.fn()} />)
    fireEvent.click(screen.getByText("I'm ready to check in"))
    fireEvent.click(screen.getByText(/Pretty stable/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/Yes, I have people/i))
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.click(screen.getByText(/To support others/i))
    fireEvent.click(screen.getByText('Continue'))
    expect(screen.getByText(/up to 3 posts/i)).toBeInTheDocument()
  })
})
