export type MenuItem = {
  name: string
  price: string
  minutes?: number
}

export type MenuGroup = {
  title: string
  items: MenuItem[]
}

export type MenuCategory = {
  id: 'heren' | 'kinderen'
  label: string
  groups: MenuGroup[]
}

export const shopMenu: MenuCategory[] = [
  {
    id: 'heren',
    label: 'Heren',
    groups: [
      {
        title: 'Haircut',
        items: [
          { name: 'Haircut', price: '€30', minutes: 30 },
          { name: 'Haircut + wassen', price: '€33', minutes: 35 },
          { name: 'Haircut + baard trimmen', price: '€40', minutes: 40 },
        ],
      },
      {
        title: 'Scheren',
        items: [
          { name: '1 stand scheren', price: '€19', minutes: 20 },
          { name: '1 stand scheren + baard trimmen', price: '€32', minutes: 30 },
          { name: 'Contouren', price: '€15', minutes: 10 },
          { name: 'Baard (alleen lijnen)', price: '€8,50', minutes: 10 },
          { name: 'Baard trimmen', price: '€20', minutes: 20 },
        ],
      },
    ],
  },
  {
    id: 'kinderen',
    label: 'Kinderen',
    groups: [
      {
        title: 'Haircut',
        items: [{ name: 'Kinderen t/m 11 jaar', price: '€22', minutes: 30 }],
      },
    ],
  },
]
