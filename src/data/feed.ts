/**
 * Real chair stills from the Tzjill feed (web JPGs, 1280×1920).
 * Crops stay in CSS so the full frame is still the file on disk.
 */
export const feed = {
  dsc00016: '/feed/DSC00016.jpg',
  dsc00030: '/feed/DSC00030.jpg',
  dsc00035: '/feed/DSC00035.jpg',
  dsc00053: '/feed/DSC00053.jpg',
  dsc00062: '/feed/DSC00062.jpg',
  dsc00064: '/feed/DSC00064.jpg',
  dsc00067: '/feed/DSC00067.jpg',
  dsc00078: '/feed/DSC00078.jpg',
  dsc00080: '/feed/DSC00080.jpg',
  dsc00085: '/feed/DSC00085.jpg',
  dsc00112: '/feed/DSC00112.jpg',
  dsc09968: '/feed/DSC09968.jpg',
  dsc09971: '/feed/DSC09971.jpg',
} as const

/** Still behind the homepage film, and the welcome back plate. */
export const HERO_POSTER = feed.dsc00064

/**
 * 2:3 still in a 3:4 or 4:5 frame.
 * 38% keeps the head and trims a little floor.
 */
export const feedFrameClass = 'object-cover object-[center_38%]'

/**
 * 2:3 still in a wide strip.
 * 24% sits on the upper third instead of the torso.
 */
export const feedWideClass = 'object-cover object-[center_24%]'
