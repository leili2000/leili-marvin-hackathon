import { describe, it, expect } from 'vitest'
import {
  transitionBarrier,
  initialBarrierState,
} from './ventBarrier'
import type { BarrierState } from '../types/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stateWith(overrides: Partial<BarrierState>): BarrierState {
  return { ...initialBarrierState, ...overrides }
}

// ─── START ────────────────────────────────────────────────────────────────────

describe('transitionBarrier — START', () => {
  it('transitions to intro from initial state', () => {
    const result = transitionBarrier(initialBarrierState, { type: 'START' })
    expect(result.step).toBe('intro')
  })

  it('transitions to intro from any step', () => {
    const state = stateWith({ step: 'check2', barrierPassed: true })
    const result = transitionBarrier(state, { type: 'START' })
    expect(result.step).toBe('intro')
  })
})

// ─── ANSWER ───────────────────────────────────────────────────────────────────

describe('transitionBarrier — ANSWER', () => {
  it('updates check1 answer', () => {
    const result = transitionBarrier(initialBarrierState, {
      type: 'ANSWER',
      step: 'check1',
      value: 'yes',
    })
    expect(result.answers.check1).toBe('yes')
    expect(result.answers.check2).toBe('')
    expect(result.answers.check3).toBe('')
  })

  it('updates check2 answer without affecting others', () => {
    const state = stateWith({
      answers: { check1: 'yes', check2: '', check3: '' },
    })
    const result = transitionBarrier(state, {
      type: 'ANSWER',
      step: 'check2',
      value: 'okay',
    })
    expect(result.answers.check1).toBe('yes')
    expect(result.answers.check2).toBe('okay')
    expect(result.answers.check3).toBe('')
  })

  it('updates check3 answer', () => {
    const result = transitionBarrier(initialBarrierState, {
      type: 'ANSWER',
      step: 'check3',
      value: 'no',
    })
    expect(result.answers.check3).toBe('no')
  })
})

// ─── NEXT ─────────────────────────────────────────────────────────────────────

describe('transitionBarrier — NEXT', () => {
  it('advances from intro to check1', () => {
    const result = transitionBarrier(stateWith({ step: 'intro' }), { type: 'NEXT' })
    expect(result.step).toBe('check1')
  })

  it('advances from check1 to check2', () => {
    const result = transitionBarrier(stateWith({ step: 'check1' }), { type: 'NEXT' })
    expect(result.step).toBe('check2')
  })

  it('advances from check2 to check3', () => {
    const result = transitionBarrier(stateWith({ step: 'check2' }), { type: 'NEXT' })
    expect(result.step).toBe('check3')
  })

  it('advances from check3 to ready', () => {
    const result = transitionBarrier(stateWith({ step: 'check3' }), { type: 'NEXT' })
    expect(result.step).toBe('ready')
  })

  it('stays at ready when already at ready', () => {
    const result = transitionBarrier(stateWith({ step: 'ready' }), { type: 'NEXT' })
    expect(result.step).toBe('ready')
  })
})

// ─── PASS ─────────────────────────────────────────────────────────────────────

describe('transitionBarrier — PASS', () => {
  it('sets step to ready and barrierPassed to true', () => {
    const result = transitionBarrier(stateWith({ step: 'check3' }), { type: 'PASS' })
    expect(result.step).toBe('ready')
    expect(result.barrierPassed).toBe(true)
  })

  it('preserves existing answers', () => {
    const state = stateWith({
      step: 'check3',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
    })
    const result = transitionBarrier(state, { type: 'PASS' })
    expect(result.answers).toEqual({ check1: 'yes', check2: 'okay', check3: 'yes' })
  })
})

// ─── DECLINE ──────────────────────────────────────────────────────────────────

describe('transitionBarrier — DECLINE', () => {
  it('resets everything to initial state', () => {
    const state: BarrierState = {
      step: 'check2',
      answers: { check1: 'yes', check2: 'okay', check3: '' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    const result = transitionBarrier(state, { type: 'DECLINE' })
    expect(result).toEqual(initialBarrierState)
  })

  it('resets from ready step', () => {
    const state = stateWith({ step: 'ready', barrierPassed: true })
    const result = transitionBarrier(state, { type: 'DECLINE' })
    expect(result.step).toBe('intro')
    expect(result.barrierPassed).toBe(false)
    expect(result.ventPostsViewed).toBe(0)
    expect(result.answers).toEqual({ check1: '', check2: '', check3: '' })
  })
})

// ─── POST_VIEWED ──────────────────────────────────────────────────────────────

describe('transitionBarrier — POST_VIEWED', () => {
  it('increments ventPostsViewed from 0 to 1', () => {
    const result = transitionBarrier(initialBarrierState, { type: 'POST_VIEWED' })
    expect(result.ventPostsViewed).toBe(1)
  })

  it('increments ventPostsViewed from 1 to 2', () => {
    const state = stateWith({ ventPostsViewed: 1 })
    const result = transitionBarrier(state, { type: 'POST_VIEWED' })
    expect(result.ventPostsViewed).toBe(2)
  })

  it('resets the barrier when ventPostsViewed reaches 3', () => {
    const state: BarrierState = {
      step: 'ready',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    const result = transitionBarrier(state, { type: 'POST_VIEWED' })
    expect(result).toEqual(initialBarrierState)
  })

  it('preserves other state when not yet at 3', () => {
    const state: BarrierState = {
      step: 'ready',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
      ventPostsViewed: 1,
      barrierPassed: true,
    }
    const result = transitionBarrier(state, { type: 'POST_VIEWED' })
    expect(result.ventPostsViewed).toBe(2)
    expect(result.step).toBe('ready')
    expect(result.barrierPassed).toBe(true)
    expect(result.answers).toEqual({ check1: 'yes', check2: 'okay', check3: 'yes' })
  })
})

// ─── RESET ────────────────────────────────────────────────────────────────────

describe('transitionBarrier — RESET', () => {
  it('resets everything to initial state', () => {
    const state: BarrierState = {
      step: 'ready',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    const result = transitionBarrier(state, { type: 'RESET' })
    expect(result).toEqual(initialBarrierState)
  })

  it('is idempotent on initial state', () => {
    const result = transitionBarrier(initialBarrierState, { type: 'RESET' })
    expect(result).toEqual(initialBarrierState)
  })
})
