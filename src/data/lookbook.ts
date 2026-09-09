export const lookbookFilters = [
  { id: 'all', label: 'Alle' },
  { id: 'haircut', label: 'Haircut' },
  { id: 'baard', label: 'Baard' },
  { id: 'kids', label: 'Kids' },
] as const

export type LookbookFilterId = (typeof lookbookFilters)[number]['id']

export const lookbookImages = [
  {
    src: '/lookbook/01.jpg',
    alt: 'Look — fade en baard',
    tags: ['haircut', 'baard'],
  },
  {
    src: '/lookbook/05.png',
    alt: 'Look — in de stoel',
    tags: ['haircut'],
  },
  {
    src: '/lookbook/02.jpg',
    alt: 'Look — classic cut',
    tags: ['haircut'],
  },
  {
    src: '/lookbook/06.png',
    alt: 'Look — shopfloor',
    tags: ['haircut'],
  },
  {
    src: '/lookbook/03.jpg',
    alt: 'Look — finish',
    tags: ['baard'],
  },
  {
    src: '/lookbook/04.jpg',
    alt: 'Look — detail',
    tags: ['haircut', 'baard'],
  },
] as const
