import { feed } from '@/data/feed'

export const lookbookFilters = [
  { id: 'all', label: 'Alle' },
  { id: 'haircut', label: 'Haircut' },
  { id: 'baard', label: 'Baard' },
  { id: 'kids', label: 'Kids' },
] as const

export type LookbookFilterId = (typeof lookbookFilters)[number]['id']

export const lookbookImages = [
  {
    src: feed.dsc00016,
    alt: 'Look uit de stoel',
    tags: ['haircut', 'baard'],
  },
  {
    src: feed.dsc00030,
    alt: 'In de zaak',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00035,
    alt: 'Aan het werk',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00053,
    alt: 'Baard en lijn',
    tags: ['baard'],
  },
  {
    src: feed.dsc00062,
    alt: 'Classic cut',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00064,
    alt: 'Finish',
    tags: ['haircut', 'baard'],
  },
  {
    src: feed.dsc00067,
    alt: 'Detail',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00078,
    alt: 'In de spiegel',
    tags: ['haircut', 'baard'],
  },
  {
    src: feed.dsc00080,
    alt: 'De stoel',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00085,
    alt: 'Lounge',
    tags: ['haircut'],
  },
  {
    src: feed.dsc00112,
    alt: 'Shopfloor',
    tags: ['haircut'],
  },
  {
    src: feed.dsc09968,
    alt: 'Close',
    tags: ['baard'],
  },
  {
    src: feed.dsc09971,
    alt: 'De coupe',
    tags: ['haircut', 'baard'],
  },
] as const
