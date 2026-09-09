import type { TeamMember } from '@/types/artist'

export const PHONE_DISPLAY = '058 844 7025'
export const PHONE_TEL = '+31588447025'

export const openingHours = [
  { day: 'Maandag', time: '10:00 – 18:00' },
  { day: 'Dinsdag', time: '10:00 – 18:00' },
  { day: 'Woensdag', time: '10:00 – 18:00' },
  { day: 'Donderdag', time: '09:00 – 20:00' },
  { day: 'Vrijdag', time: '09:00 – 20:00' },
  { day: 'Zaterdag', time: '09:00 – 20:00' },
  { day: 'Zondag', time: 'Gesloten' },
] as const
export const INSTAGRAM_URL = 'https://www.instagram.com/tzjill.barber.lounge/'
export const INSTAGRAM_HANDLE = '@tzjill.barber.lounge'

/** Live appointment widget (Salonhub). */
export const SALONHUB_BOOKING_URL =
  'https://widget.salonhub.nl/a/tzjill/tzjill/link.html'

export const LOCATION_ADDRESS = 'Voorstreek 18, 8911 JP Leeuwarden'
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(LOCATION_ADDRESS)}&hl=nl&z=16&output=embed`
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(LOCATION_ADDRESS)}`

export const site = {
  name: 'Tzjill',
  fullName: 'Tzjill Barber & Lounge',
  tagline: 'A man’s world.\nTrendy haircuts · Hot towel shaves',
  instagram: INSTAGRAM_URL,
  year: 2026,
  contact: [
    {
      label: 'Email',
      email: 'info@tzjill.nl',
    },
  ],
  legal: {
    company: 'Tzjill Barber & Lounge',
    vat: '',
    addressLines: ['Voorstreek 18', '8911 JP Leeuwarden'],
  },
  about: [
    'Specialized in trendy haircuts and hot towel straight razor shaves.',
    'Elke coupe is maatwerk: knippen, scheren en baard — traditioneel barbierwerk, met de technieken van nu. Tag ons met #tzjill.',
    'Wij geven je de look die past bij persoonlijkheid, stijl en gezichtsvorm. Ook de verzorging van haar, baard en gezicht.',
  ],
  photoCredits: '',
  legalLinks: [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Cookies', href: '#cookies' },
  ],
} as const

export const team: TeamMember[] = [
  {
    id: 't1',
    name: 'Niels',
    role: 'Senior barber',
    imageUrl: '/lookbook/01.jpg',
  },
  {
    id: 't2',
    name: 'Daan',
    role: 'Barber',
    imageUrl: '/lookbook/02.jpg',
  },
  {
    id: 't3',
    name: 'Sem',
    role: 'Barber',
    imageUrl: '/lookbook/03.jpg',
  },
]
