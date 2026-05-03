import { describe, it, expect } from 'vitest'
import { predictNumerical, weightedAverage, kMeans2, isBimodal } from './predictRelapse'
import type { CheckIn } from '../types/index'

// Helper to create a minimal CheckIn
function makeCheckIn(date: string, status: 'clean' | 'relapse'): CheckIn {
  return {
    id: crypto.randomUUID(),
    userId: 'user-1',
    date,
    status,
    note: null,
    relapseReason: null,
  }
}

describe('predictNumerical', () => {
  it('returns low confidence and null predictedDate with fewer than 2 relapses', () => {
    const checkIns = [makeCheckIn('2024-01-01', 'relapse')]
    const result = predictNumerical(checkIns, '2024-06-01')

    expect(result.confidence).toBe('low')
    expect(result.predictedDate).toBeNull()
    expect(result.daysUntilPredicted).toBeNull()
    expect(result.averageInterval).toBe(0)
    expect(result.intervalHistory).toEqual([])
    expect(result.distributionMode).toBe('unimodal')
    expect(result.clusters).toEqual([])
    expect(result.nearestPredictedDate).toBeNull()
    expect(result.nearestDaysUntil).toBeNull()
  })

  it('returns low confidence with zero relapses', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean'),
      makeCheckIn('2024-01-02', 'clean'),
    ]
    const result = predictNumerical(checkIns, '2024-06-01')
    expect(result.confidence).toBe('low')
    expect(result.predictedDate).toBeNull()
  })

  it('returns medium confidence with 2-4 relapses', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-11', 'relapse'),
      makeCheckIn('2024-01-21', 'relapse'),
    ]
    const result = predictNumerical(checkIns, '2024-01-25')
    expect(result.confidence).toBe('medium')
    expect(result.predictedDate).not.toBeNull()
  })

  it('returns high confidence with 5+ relapses', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-11', 'relapse'),
      makeCheckIn('2024-01-21', 'relapse'),
      makeCheckIn('2024-02-01', 'relapse'),
      makeCheckIn('2024-02-11', 'relapse'),
    ]
    const result = predictNumerical(checkIns, '2024-02-15')
    expect(result.confidence).toBe('high')
  })

  it('computes correct interval history', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-06', 'relapse'), // 5 days
      makeCheckIn('2024-01-16', 'relapse'), // 10 days
    ]
    const result = predictNumerical(checkIns, '2024-01-20')
    expect(result.intervalHistory).toEqual([5, 10])
  })

  it('computes weighted average correctly', () => {
    // intervals: [5, 10]
    // weights: [1, 2]
    // weighted avg = (5*1 + 10*2) / (1+2) = 25/3 ≈ 8
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-06', 'relapse'),
      makeCheckIn('2024-01-16', 'relapse'),
    ]
    const result = predictNumerical(checkIns, '2024-01-20')
    expect(result.averageInterval).toBe(8) // round(25/3) = 8
  })

  it('clamps predicted date to today when prediction is in the past', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-06', 'relapse'), // interval: 5
    ]
    // Weighted avg = 5, last relapse = Jan 6, predicted = Jan 11
    // today = Feb 1 → clamp to Feb 1
    const result = predictNumerical(checkIns, '2024-02-01')
    expect(result.predictedDate).toBe('2024-02-01')
    expect(result.daysUntilPredicted).toBe(0)
  })

  it('returns future predicted date when prediction is after today', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-11', 'relapse'), // interval: 10
    ]
    // Weighted avg = 10, last relapse = Jan 11, predicted = Jan 21
    // today = Jan 15 → Jan 21 is in the future
    const result = predictNumerical(checkIns, '2024-01-15')
    expect(result.predictedDate).toBe('2024-01-21')
    expect(result.daysUntilPredicted).toBe(6)
  })

  it('filters out clean check-ins and only uses relapses', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-02', 'clean'),
      makeCheckIn('2024-01-03', 'clean'),
      makeCheckIn('2024-01-11', 'relapse'),
    ]
    const result = predictNumerical(checkIns, '2024-01-15')
    expect(result.intervalHistory).toEqual([10])
    expect(result.confidence).toBe('medium')
  })

  it('returns unimodal for fewer than 6 intervals', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-11', 'relapse'),
      makeCheckIn('2024-01-21', 'relapse'),
    ]
    const result = predictNumerical(checkIns, '2024-02-01')
    expect(result.distributionMode).toBe('unimodal')
    expect(result.clusters).toEqual([])
    expect(result.nearestPredictedDate).toBe(result.predictedDate)
  })

  it('detects bimodal distribution with clearly separated intervals', () => {
    // Create 7 relapses with alternating short (5-day) and long (30-day) intervals
    // This gives 6 intervals: [5, 30, 5, 30, 5, 30]
    const checkIns = [
      makeCheckIn('2024-01-01', 'relapse'),
      makeCheckIn('2024-01-06', 'relapse'),  // +5
      makeCheckIn('2024-02-05', 'relapse'),  // +30
      makeCheckIn('2024-02-10', 'relapse'),  // +5
      makeCheckIn('2024-03-11', 'relapse'),  // +30
      makeCheckIn('2024-03-16', 'relapse'),  // +5
      makeCheckIn('2024-04-15', 'relapse'),  // +30
    ]
    const result = predictNumerical(checkIns, '2024-04-20')
    expect(result.distributionMode).toBe('bimodal')
    expect(result.clusters).toHaveLength(2)
    expect(result.clusters[0].members.length).toBeGreaterThan(0)
    expect(result.clusters[1].members.length).toBeGreaterThan(0)
    // Cluster weights should sum to 1
    const totalWeight = result.clusters.reduce((s, c) => s + c.weight, 0)
    expect(totalWeight).toBeCloseTo(1.0)
    // nearestPredictedDate should be set
    expect(result.nearestPredictedDate).not.toBeNull()
    expect(result.nearestDaysUntil).not.toBeNull()
  })
})

describe('weightedAverage', () => {
  it('returns 0 for empty array', () => {
    expect(weightedAverage([])).toBe(0)
  })

  it('returns the single value for one element', () => {
    expect(weightedAverage([10])).toBe(10)
  })

  it('weights recent intervals more heavily', () => {
    // [5, 10]: weights [1, 2] → (5+20)/3 = 8.33 → 8
    expect(weightedAverage([5, 10])).toBe(8)
    // [10, 5]: weights [1, 2] → (10+10)/3 = 6.67 → 7
    expect(weightedAverage([10, 5])).toBe(7)
  })
})

describe('kMeans2', () => {
  it('separates clearly distinct groups', () => {
    const values = [1, 2, 3, 100, 101, 102]
    const result = kMeans2(values)
    expect(result.clusters[0].sort()).toEqual([1, 2, 3])
    expect(result.clusters[1].sort()).toEqual([100, 101, 102])
  })

  it('handles single value', () => {
    const result = kMeans2([5])
    expect(result.centroids).toEqual([5, 5])
    expect(result.clusters[0]).toEqual([5])
  })
})

describe('isBimodal', () => {
  it('returns false for fewer than 6 intervals', () => {
    expect(isBimodal([5, 10, 15, 20, 25]).bimodal).toBe(false)
  })

  it('returns true for clearly bimodal data', () => {
    const intervals = [5, 5, 5, 30, 30, 30]
    expect(isBimodal(intervals).bimodal).toBe(true)
  })

  it('returns false for uniform data', () => {
    const intervals = [10, 10, 10, 10, 10, 10]
    expect(isBimodal(intervals).bimodal).toBe(false)
  })
})
