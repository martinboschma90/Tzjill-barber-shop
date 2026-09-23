import { feed } from '@/data/feed'

/** Chair still for haircut rows. Same frame as the homepage Haircut card. */
const CHAIR = feed.dsc00016

/** Beard still. Lookbook tags this frame as baard only. Same as the homepage Baard card. */
const BEARD = feed.dsc00053

export type TreatmentStill =
  | { kind: 'photo'; src: string; focus: 'chair' | 'beard' }
  | { kind: 'kids' }

/**
 * Map a Salonhub treatment onto a real feed still.
 * The lookbook kids filter has no tagged frame, so kinder rows use a Kids
 * mark instead of an adult face.
 */
export function treatmentStill(item: {
  name: string
  group: string
  groupId: string
  section: string
}): TreatmentStill {
  const who = `${item.groupId} ${item.group} ${item.name}`.toLowerCase()
  if (item.groupId === 'child' || /\b(kinderen|kinder|kids|child)\b/.test(who)) {
    return { kind: 'kids' }
  }
  const work = `${item.section} ${item.name}`.toLowerCase()
  if (/baard|scheren|contour|shave|beard/.test(work)) {
    return { kind: 'photo', src: BEARD, focus: 'beard' }
  }
  return { kind: 'photo', src: CHAIR, focus: 'chair' }
}
