import React, { useState } from 'react'
import type { CheckIn, DayStatus } from '../../types'

interface CalendarWidgetProps {
  checkIns: CheckIn[]
  onDayUpdate: (date: string, status: DayStatus) => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ checkIns, onDayUpdate }) => {
  const today = new Date('2026-05-02')
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const checkInMap = new Map<string, DayStatus>()
  checkIns.forEach((c) => checkInMap.set(c.date, c.status))

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handleDayClick = (dateStr: string) => {
    const d = new Date(dateStr)
    if (d > today) return // Can't mark future days

    const current = checkInMap.get(dateStr) ?? null
    // Single click = clean, double click = relapse, third click = clear
    // We track click count via a simple cycle
    let next: DayStatus
    if (current === null) next = 'clean'
    else if (current === 'clean') next = 'relapse'
    else next = null

    onDayUpdate(dateStr, next)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const getDayStyle = (dateStr: string, _day: number) => {
    const d = new Date(dateStr)
    const isFuture = d > today
    const status = checkInMap.get(dateStr)

    if (isFuture) return 'calendar-day--future'
    if (status === 'clean') return 'calendar-day--clean'
    if (status === 'relapse') return 'calendar-day--relapse'
    return 'calendar-day--empty'
  }

  const isToday = (dateStr: string) => dateStr === today.toISOString().split('T')[0]

  return (
    <div className="calendar-widget">
      <div className="calendar-widget__nav">
        <button className="btn btn--ghost btn--sm" onClick={prevMonth}>←</button>
        <span className="calendar-widget__month-label">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className="btn btn--ghost btn--sm" onClick={nextMonth}>→</button>
      </div>

      <div className="calendar-widget__grid">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="calendar-day calendar-day--null" />

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const styleClass = getDayStyle(dateStr, day)
          const todayClass = isToday(dateStr) ? 'calendar-day--today' : ''

          return (
            <button
              key={dateStr}
              className={`calendar-day ${styleClass} ${todayClass}`}
              onClick={() => handleDayClick(dateStr)}
              title={
                styleClass.includes('future')
                  ? 'Future date'
                  : 'Click: clean · Click again: relapse · Click again: clear'
              }
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="calendar-widget__legend">
        <span className="legend-item legend-item--clean">Clean day</span>
        <span className="legend-item legend-item--relapse">Relapse</span>
        <span className="legend-item legend-item--empty">Not logged</span>
      </div>

      <p className="calendar-widget__hint">
        Click once to mark clean · Click again to mark relapse · Click a third time to clear
      </p>
    </div>
  )
}
