import type { HappyItem, NudgeAction } from '../types/index'

/**
 * buildNudgeAction
 *
 * Selects a non-obtrusive suggestion based on risk level and available happy items.
 * Randomly returns null ~40% of the time for non-high risk to avoid being annoying.
 *
 * Preconditions:
 *   - risk is 'low' | 'medium' | 'high'
 *   - happyItems may be empty
 *
 * Postconditions:
 *   - Returns null with probability 0.4 when risk !== 'high' (random suppression)
 *   - For 'low': suggests a low-energy happy item (energyLevel <= 2)
 *   - For 'medium': 50% chance suggest any happy item, 50% chance milestone prompt
 *   - For 'high': always returns a suggestion
 *   - askIfDoneRecently = true when suggested item has energyLevel >= 4
 */
export function buildNudgeAction(
  risk: 'low' | 'medium' | 'high',
  happyItems: HappyItem[]
): NudgeAction | null {
  // Random suppression — must not be obtrusive
  if (risk !== 'high' && Math.random() < 0.4) return null

  const lowEnergyItems = happyItems.filter(i => i.energyLevel <= 2)
  const anyItems = happyItems

  if (risk === 'low') {
    if (lowEnergyItems.length === 0) return null
    const item = lowEnergyItems[Math.floor(Math.random() * lowEnergyItems.length)]
    return {
      type: 'happy_item_suggestion',
      message: `Something small that might help: ${item.title}`,
      happyItem: item,
      askIfDoneRecently: item.energyLevel >= 4,
    }
  }

  if (risk === 'medium') {
    const roll = Math.random()
    if (roll < 0.5 && anyItems.length > 0) {
      const item = anyItems[Math.floor(Math.random() * anyItems.length)]
      return {
        type: 'happy_item_suggestion',
        message: `You've got this. Maybe try: ${item.title}`,
        happyItem: item,
        askIfDoneRecently: item.energyLevel >= 4,
      }
    }
    return {
      type: 'milestone_prompt',
      message: "You've come a long way. Feel like logging a milestone?",
    }
  }

  // high risk — always suggest
  if (anyItems.length > 0) {
    const item = anyItems[Math.floor(Math.random() * anyItems.length)]
    return {
      type: 'happy_item_suggestion',
      message: `Hey — ${item.title} is on your list. Have you been able to do that recently?`,
      happyItem: item,
      askIfDoneRecently: true,
    }
  }
  return {
    type: 'milestone_prompt',
    message: "You've come a long way. Feel like logging a milestone?",
  }
}
