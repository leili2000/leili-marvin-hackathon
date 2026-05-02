import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyCheckIn } from '../components/stats/DailyCheckIn'
import type { CheckIn } from '../types'

const existingCleanCheckIn: CheckIn = {
  id: 'c1',
  userId: 'user-001',
  date: '2026-05-02',
  status: 'clean',
  note: 'Good day',
  relapseReason: null,
}

const existingRelapseCheckIn: CheckIn = {
  id: 'c2',
  userId: 'user-001',
  date: '2026-05-02',
  status: 'relapse',
  note: null,
  relapseReason: 'Stress at work',
}

describe('DailyCheckIn', () => {
  it('renders the check-in prompt when no check-in exists', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    expect(screen.getByText(/How did today go/i)).toBeInTheDocument()
  })

  it('shows both clean and relapse options', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    expect(screen.getByText('Clean day')).toBeInTheDocument()
    expect(screen.getByText('Had a relapse')).toBeInTheDocument()
  })

  it('shows note textarea after selecting clean', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByText('Clean day'))
    expect(screen.getByPlaceholderText(/What helped today/i)).toBeInTheDocument()
  })

  it('shows relapse reason textarea after selecting relapse', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByText('Had a relapse'))
    expect(screen.getByPlaceholderText(/Stress, a person, a place/i)).toBeInTheDocument()
  })

  it('shows pattern note when relapse is selected', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByText('Had a relapse'))
    expect(screen.getByText(/patterns over time/i)).toBeInTheDocument()
  })

  it('calls onSubmit with clean status and note', () => {
    const onSubmit = vi.fn()
    render(<DailyCheckIn todayCheckIn={null} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('Clean day'))
    fireEvent.change(screen.getByPlaceholderText(/What helped today/i), {
      target: { value: 'Went for a walk' },
    })
    fireEvent.click(screen.getByText('Log today'))
    expect(onSubmit).toHaveBeenCalledWith('clean', 'Went for a walk', '')
  })

  it('calls onSubmit with relapse status and reason', () => {
    const onSubmit = vi.fn()
    render(<DailyCheckIn todayCheckIn={null} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('Had a relapse'))
    fireEvent.change(screen.getByPlaceholderText(/Stress, a person, a place/i), {
      target: { value: 'Work stress' },
    })
    fireEvent.click(screen.getByText('Log today'))
    expect(onSubmit).toHaveBeenCalledWith('relapse', '', 'Work stress')
  })

  it('shows done state when a clean check-in already exists', () => {
    render(<DailyCheckIn todayCheckIn={existingCleanCheckIn} onSubmit={vi.fn()} />)
    expect(screen.getByText(/Today's check-in is logged/i)).toBeInTheDocument()
    expect(screen.getByText(/clean day/i)).toBeInTheDocument()
  })

  it('shows done state when a relapse check-in already exists', () => {
    render(<DailyCheckIn todayCheckIn={existingRelapseCheckIn} onSubmit={vi.fn()} />)
    expect(screen.getByText(/Today's check-in is logged/i)).toBeInTheDocument()
    expect(screen.getByText(/That took courage/i)).toBeInTheDocument()
  })

  it('allows editing an existing check-in', () => {
    render(<DailyCheckIn todayCheckIn={existingCleanCheckIn} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByText("Edit today's entry"))
    expect(screen.getByText(/How did today go/i)).toBeInTheDocument()
  })

  it('shows no shame messaging for relapse', () => {
    render(<DailyCheckIn todayCheckIn={null} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByText('Had a relapse'))
    expect(screen.getByText(/I'm still here/i)).toBeInTheDocument()
  })
})
