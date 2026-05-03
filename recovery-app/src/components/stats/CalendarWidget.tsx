import { useState, useMemo } from 'react'
import type { CheckIn, DayStatus } from '../../types/index'

interface CalendarWidgetProps {
  checkIns: CheckIn[]
  recoveryStartDate: string
  onDayUpdate: (date: string, status: DayStatus) => void
  onDaySelect: (date: string) => void
  onStartDateChange?: (newDate: string) => void
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarWidget({ checkIns, recoveryStartDate, onDayUpdate, onDaySelect, onStartDateChange }: CalendarWidgetProps) {
  const today = new Date()
  const todayStr = toDateStr(today)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [startDatePrompt, setStartDatePrompt] = useState<string | null>(null)

  const checkInMap = useMemo(() => {
    const map = new Map<string, DayStatus>()
    for (const ci of checkIns) {
      map.set(ci.date, ci.status)
    }
    return map
  }, [checkIns])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleDayClick = (dateStr: string) => {
    // Future guard
    if (dateStr > todayStr) return

    // Start-date guard
    if (dateStr < recoveryStartDate) {
      setStartDatePrompt(dateStr)
      return
    }

    // Click-to-cycle: null → clean → relapse → null
    const current = checkInMap.get(dateStr) ?? null
    const next: DayStatus =
      current === null ? 'clean' :
      current === 'clean' ? 'relapse' : null
    onDayUpdate(dateStr, next)
  }

  const getDayStyle = (dateStr: string, isFuture: boolean, isBeforeStart: boolean): React.CSSProperties => {
    const status = checkInMap.get(dateStr) ?? null
    const isToday = dateStr === todayStr

    let background = 'var(--color-surface)'
    let color = 'var(--color-text)'
    let border = '1px solid transparent'
    let opacity = 1
    let cursor: React.CSSProperties['cursor'] = 'pointer'

    if (isFuture) {
      background = 'var(--color-surface-hover)'
      color = '#bbb'
      cursor = 'default'
      opacity = 0.6
    } else if (isBeforeStart) {
      background = 'var(--color-surface-hover)'
      color = '#ccc'
      cursor = 'pointer'
    } else if (status === 'clean') {
      background = '#d4edda'
      color = '#155724'
    } else if (status === 'relapse') {
      background = '#f8d7da'
      color = '#721c24'
    } else {
      background = 'var(--color-surface-hover)'
      color = 'var(--color-text-secondary)'
    }

    if (isToday) {
      border = '2px solid var(--color-primary, #4f8a6e)'
    }

    return {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      background,
      color,
      border,
      opacity,
      cursor,
      fontSize: '0.85em',
      fontWeight: isToday ? 'bold' : 'normal',
    }
  }

  // Build grid cells
  const cells: React.ReactNode[] = []

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} style={{ width: '36px', height: '36px' }} />)
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
    const isFuture = dateStr > todayStr
    const isBeforeStart = dateStr < recoveryStartDate

    cells.push(
      <div key={dateStr} style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => handleDayClick(dateStr)}
          onDoubleClick={() => {
            if (!isFuture && dateStr >= recoveryStartDate) {
              onDaySelect(dateStr)
            }
          }}
          disabled={isFuture}
          title={
            isFuture ? 'Future date' :
            isBeforeStart ? 'Before recovery start date' :
            (checkInMap.get(dateStr) ?? 'unlogged')
          }
          style={{
            ...getDayStyle(dateStr, isFuture, isBeforeStart),
            padding: 0,
          }}
        >
          {day}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <strong>
          {MONTH_NAMES[month]} {year}
        </strong>
        <button
          type="button"
          onClick={handleNext}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          textAlign: 'center',
          marginBottom: '4px',
        }}
      >
        {DAY_HEADERS.map((d) => (
          <div key={d} style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}
      >
        {cells}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '12px',
          fontSize: '0.8em',
          color: 'var(--color-text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <span>🟢 Clean</span>
        <span>🔴 Relapse</span>
        <span>⚪ Unlogged</span>
        <span>🔵 Today</span>
      </div>

      {/* Start-date prompt */}
      {startDatePrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setStartDatePrompt(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '10px',
              padding: '24px',
              maxWidth: '360px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: '0 0 8px' }}>Before Recovery Start Date</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
              This date ({startDatePrompt}) is before your recovery start date ({recoveryStartDate}).
              Would you like to update your start date?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setStartDatePrompt(null)}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                No, go back
              </button>
              {onStartDateChange && (
                <button
                  type="button"
                  onClick={() => {
                    onStartDateChange(startDatePrompt!)
                    setStartDatePrompt(null)
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-primary, #4f8a6e)',
                    color: 'var(--color-primary-contrast, #fff)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Yes, update start date
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
