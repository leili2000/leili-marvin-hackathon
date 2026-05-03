import { describe, it, expect } from 'vitest'
import { transitionBarrier, initialBarrierState } from './ventBarrier'
import type { BarrierState } from '../types/index'

function stateWith(overrides: Partial<BarrierState>): BarrierState {
  return { ...initialBarrierState, ...overrides }
}

describe('transitionBarrier — START', () => {
  it('transitions to intro from initial state', () => {
    expect(transitionBarrier(initialBarrierState, { type: 'START' }).step).toBe('intro')
  })
  it('transitions to intro from any step', () => {
    const state = stateWith({ step: 'check2', barrierPassed: true })
    expect(transitionBarrier(state, { type: 'START' }).step).toBe('intro')
  })
})

describe('transitionBarrier — ANSWER', () => {
  it('updates check1 answer', () => {
    const result = transitionBarrier(initialBarrierState, { type: 'ANSWER', step: 'check1', value: 'yes' })
    expect(result.answers.check1).toBe('yes')
    expect(result.answers.check2).toBe('')
  })
  it('updates check2 without affecting others', () => {
    const state = stateWith({ answers: { check1: 'yes', check2: '', check3: '' } })
    const result = transitionBarrier(state, { type: 'ANSWER', step: 'check2', value: 'okay' })
    expect(result.answers.check1).toBe('yes')
    expect(result.answers.check2).toBe('okay')
  })
})

describe('transitionBarrier — NEXT', () => {
  it('advances intro → check1', () => {
    expect(transitionBarrier(stateWith({ step: 'intro' }), { type: 'NEXT' }).step).toBe('check1')
  })
  it('advances check1 → check2', () => {
    expect(transitionBarrier(stateWith({ step: 'check1' }), { type: 'NEXT' }).step).toBe('check2')
  })
  it('advances check2 → check3', () => {
    expect(transitionBarrier(stateWith({ step: 'check2' }), { type: 'NEXT' }).step).toBe('check3')
  })
  it('advances check3 → ready', () => {
    expect(transitionBarrier(stateWith({ step: 'check3' }), { type: 'NEXT' }).step).toBe('ready')
  })
  it('stays at ready', () => {
    expect(transitionBarrier(stateWith({ step: 'ready' }), { type: 'NEXT' }).step).toBe('ready')
  })
})

describe('transitionBarrier — PASS', () => {
  it('sets step to ready and barrierPassed to true', () => {
    const result = transitionBarrier(stateWith({ step: 'check3' }), { type: 'PASS' })
    expect(result.step).toBe('ready')
    expect(result.barrierPassed).toBe(true)
  })
})

describe('transitionBarrier — DECLINE', () => {
  it('resets everything to initial state', () => {
    const state: BarrierState = {
      step: 'check2',
      answers: { check1: 'yes', check2: 'okay', check3: '' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    expect(transitionBarrier(state, { type: 'DECLINE' })).toEqual(initialBarrierState)
  })
})

describe('transitionBarrier — POST_VIEWED', () => {
  it('increments ventPostsViewed', () => {
    expect(transitionBarrier(initialBarrierState, { type: 'POST_VIEWED' }).ventPostsViewed).toBe(1)
  })
  it('resets barrier when ventPostsViewed reaches 3', () => {
    const state: BarrierState = {
      step: 'ready',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    expect(transitionBarrier(state, { type: 'POST_VIEWED' })).toEqual(initialBarrierState)
  })
})

describe('transitionBarrier — RESET', () => {
  it('resets everything to initial state', () => {
    const state: BarrierState = {
      step: 'ready',
      answers: { check1: 'yes', check2: 'okay', check3: 'yes' },
      ventPostsViewed: 2,
      barrierPassed: true,
    }
    expect(transitionBarrier(state, { type: 'RESET' })).toEqual(initialBarrierState)
  })
})
