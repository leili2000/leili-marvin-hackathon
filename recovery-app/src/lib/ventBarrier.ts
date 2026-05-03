import type { BarrierState, BarrierStep, BarrierAnswer } from '../types/index'

export type BarrierAction =
  | { type: 'START' }
  | { type: 'ANSWER'; step: 'check1' | 'check2' | 'check3'; value: BarrierAnswer }
  | { type: 'NEXT' }
  | { type: 'PASS' }
  | { type: 'DECLINE' }
  | { type: 'POST_VIEWED' }
  | { type: 'RESET' }

export const initialBarrierState: BarrierState = {
  step: 'intro',
  answers: { check1: '', check2: '', check3: '' },
  ventPostsViewed: 0,
  barrierPassed: false,
}

/**
 * transitionBarrier — pure state machine for the vent barrier.
 * No side effects. Returns a new BarrierState for every action.
 */
export function transitionBarrier(
  state: BarrierState,
  action: BarrierAction,
): BarrierState {
  switch (action.type) {
    case 'START':
      return { ...state, step: 'intro' }

    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.step]: action.value },
      }

    case 'NEXT': {
      const order: BarrierStep[] = ['intro', 'check1', 'check2', 'check3', 'ready']
      const idx = order.indexOf(state.step)
      return { ...state, step: order[Math.min(idx + 1, order.length - 1)] }
    }

    case 'PASS':
      return { ...state, step: 'ready', barrierPassed: true }

    case 'DECLINE':
      return {
        step: 'intro',
        answers: { check1: '', check2: '', check3: '' },
        ventPostsViewed: 0,
        barrierPassed: false,
      }

    case 'POST_VIEWED': {
      const viewed = state.ventPostsViewed + 1
      if (viewed >= 3) {
        return {
          step: 'intro',
          answers: { check1: '', check2: '', check3: '' },
          ventPostsViewed: 0,
          barrierPassed: false,
        }
      }
      return { ...state, ventPostsViewed: viewed }
    }

    case 'RESET':
      return {
        step: 'intro',
        answers: { check1: '', check2: '', check3: '' },
        ventPostsViewed: 0,
        barrierPassed: false,
      }

    default:
      return state
  }
}
