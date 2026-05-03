import type { CheckIn, NumericalPrediction, IntervalCluster, DistributionMode } from '../types/index'

const MS_PER_DAY = 86_400_000

/**
 * Compute the number of days between two YYYY-MM-DD date strings.
 */
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY)
}

/**
 * Format a Date object as YYYY-MM-DD.
 */
function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Add a number of days to a YYYY-MM-DD string and return a new YYYY-MM-DD string.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

// ─── K-Means Clustering ───────────────────────────────────────────────────────

export interface KMeansResult {
  centroids: [number, number]
  assignments: number[] // 0 or 1 for each interval
  clusters: [number[], number[]]
}

/**
 * Run k-means clustering with k=2 on a 1D array of numbers.
 * Returns the two centroids, assignments, and cluster members.
 *
 * Initialization: pick the min and max values as initial centroids.
 * Convergence: stops when assignments don't change or after maxIter iterations.
 */
export function kMeans2(values: number[], maxIter = 50): KMeansResult {
  if (values.length < 2) {
    return {
      centroids: [values[0] ?? 0, values[0] ?? 0],
      assignments: values.map(() => 0),
      clusters: [values.slice(), []],
    }
  }

  // Initialize centroids to min and max
  let c0 = Math.min(...values)
  let c1 = Math.max(...values)

  let assignments = values.map(() => 0)

  for (let iter = 0; iter < maxIter; iter++) {
    // Assignment step: assign each value to the nearest centroid
    const newAssignments = values.map(v =>
      Math.abs(v - c0) <= Math.abs(v - c1) ? 0 : 1
    )

    // Check convergence
    const changed = newAssignments.some((a, i) => a !== assignments[i])
    assignments = newAssignments

    // Update step: recompute centroids
    const cluster0 = values.filter((_, i) => assignments[i] === 0)
    const cluster1 = values.filter((_, i) => assignments[i] === 1)

    if (cluster0.length > 0) {
      c0 = cluster0.reduce((s, v) => s + v, 0) / cluster0.length
    }
    if (cluster1.length > 0) {
      c1 = cluster1.reduce((s, v) => s + v, 0) / cluster1.length
    }

    if (!changed) break
  }

  // Ensure c0 <= c1 for consistent ordering
  if (c0 > c1) {
    const tmp = c0
    c0 = c1
    c1 = tmp
    assignments = assignments.map(a => (a === 0 ? 1 : 0))
  }

  const clusters: [number[], number[]] = [
    values.filter((_, i) => assignments[i] === 0),
    values.filter((_, i) => assignments[i] === 1),
  ]

  return { centroids: [c0, c1], assignments, clusters }
}

/**
 * Determine if the intervals exhibit a bimodal distribution.
 *
 * Criteria:
 *   - At least 6 intervals
 *   - Run k-means with k=2
 *   - The gap between centroids must be > 50% of the overall mean
 *   - Both clusters must have at least 1 member
 */
export function isBimodal(intervals: number[]): { bimodal: boolean; result: KMeansResult } {
  if (intervals.length < 6) {
    return {
      bimodal: false,
      result: { centroids: [0, 0], assignments: [], clusters: [[], []] },
    }
  }

  const result = kMeans2(intervals)
  const overallMean = intervals.reduce((s, v) => s + v, 0) / intervals.length
  const gap = Math.abs(result.centroids[1] - result.centroids[0])

  const bothNonEmpty = result.clusters[0].length > 0 && result.clusters[1].length > 0
  const sufficientlySeparated = overallMean > 0 && gap > 0.5 * overallMean

  return {
    bimodal: bothNonEmpty && sufficientlySeparated,
    result,
  }
}

// ─── Weighted Average ─────────────────────────────────────────────────────────

/**
 * Compute the weighted average of intervals where weight[i] = i + 1.
 * Most recent interval (highest index) gets the highest weight.
 */
export function weightedAverage(intervals: number[]): number {
  if (intervals.length === 0) return 0
  let weightedSum = 0
  let totalWeight = 0
  intervals.forEach((interval, i) => {
    const weight = i + 1
    weightedSum += interval * weight
    totalWeight += weight
  })
  return Math.round(weightedSum / totalWeight)
}

// ─── Main Prediction Function ─────────────────────────────────────────────────

/**
 * predictNumerical
 *
 * Preconditions:
 *   - checkIns may be in any order (will be filtered and sorted internally)
 *   - today is a YYYY-MM-DD string
 *
 * Postconditions:
 *   - Returns NumericalPrediction
 *   - If fewer than 2 relapses: confidence = 'low', predictedDate = null
 *   - If 2–4 relapses: confidence = 'medium'
 *   - If 5+ relapses: confidence = 'high'
 *   - predictedDate is always >= today
 *   - averageInterval is the weighted mean of intervalHistory
 *   - distributionMode is 'bimodal' when intervals show two distinct clusters
 */
export function predictNumerical(
  checkIns: CheckIn[],
  today: string
): NumericalPrediction {
  // 1. Extract relapse dates in ascending order
  const relapseDates = checkIns
    .filter(c => c.status === 'relapse')
    .map(c => c.date)
    .sort()

  // Insufficient data case
  if (relapseDates.length < 2) {
    return {
      distributionMode: 'unimodal',
      predictedDate: null,
      daysUntilPredicted: null,
      averageInterval: 0,
      intervalHistory: [],
      confidence: 'low',
      clusters: [],
      nearestPredictedDate: null,
      nearestDaysUntil: null,
    }
  }

  // 2. Compute intervals between consecutive relapses
  const intervals: number[] = []
  for (let i = 1; i < relapseDates.length; i++) {
    intervals.push(daysBetween(relapseDates[i - 1], relapseDates[i]))
  }

  // 3. Weighted average — recent intervals count more
  const avgInterval = weightedAverage(intervals)

  // 4. Predict from last relapse date + weighted average interval
  const lastRelapseDate = relapseDates[relapseDates.length - 1]
  const rawPredicted = addDays(lastRelapseDate, avgInterval)

  // 5. Clamp to today or future
  const predictedDate = rawPredicted < today ? today : rawPredicted
  const daysUntilPredicted = daysBetween(today, predictedDate)

  // 6. Determine confidence
  const confidence: NumericalPrediction['confidence'] =
    relapseDates.length >= 5 ? 'high' :
    relapseDates.length >= 2 ? 'medium' : 'low'

  // 7. Bimodal detection
  const { bimodal, result: kmeansResult } = isBimodal(intervals)

  let distributionMode: DistributionMode = 'unimodal'
  let clusters: IntervalCluster[] = []
  let nearestPredictedDate: string | null = predictedDate
  let nearestDaysUntil: number | null = daysUntilPredicted

  if (bimodal) {
    distributionMode = 'bimodal'

    clusters = kmeansResult.clusters.map((members, idx) => {
      const centroid = kmeansResult.centroids[idx]
      const weight = members.length / intervals.length

      // Predict from last relapse + this cluster's centroid
      const clusterRawPredicted = addDays(lastRelapseDate, Math.round(centroid))
      const clusterPredicted = clusterRawPredicted < today ? today : clusterRawPredicted
      const clusterDaysUntil = daysBetween(today, clusterPredicted)

      return {
        centroid,
        members,
        weight,
        predictedDate: clusterPredicted,
        daysUntilPredicted: clusterDaysUntil,
      }
    })

    // Find the nearest predicted date across clusters (closest to today, but >= today)
    const validClusters = clusters.filter(c => c.predictedDate !== null)
    if (validClusters.length > 0) {
      const nearest = validClusters.reduce((a, b) =>
        (a.daysUntilPredicted ?? Infinity) <= (b.daysUntilPredicted ?? Infinity) ? a : b
      )
      nearestPredictedDate = nearest.predictedDate
      nearestDaysUntil = nearest.daysUntilPredicted
    }
  }

  return {
    distributionMode,
    predictedDate,
    daysUntilPredicted,
    averageInterval: avgInterval,
    intervalHistory: intervals,
    confidence,
    clusters,
    nearestPredictedDate,
    nearestDaysUntil,
  }
}
