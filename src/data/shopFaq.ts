export const SHOP_FAQ_ITEMS = [
  {
    q: 'Hoe maak ik een afspraak?',
    a: 'Boek online via Salonhub. Kies een behandeling, kapper en tijd. Je krijgt een bevestiging per mail.',
    tag: 'afspraak' as const,
  },
  {
    q: 'Kan ik annuleren of verzetten?',
    a: 'Laat het zo vroeg mogelijk weten, bij voorkeur 24 uur van tevoren, via de bevestiging of telefonisch.',
    tag: 'afspraak' as const,
  },
  {
    q: 'Wat als ik te laat ben?',
    a: 'Geef een seintje. Bij meer dan 10 minuten te laat kan de behandeling worden ingekort of verzet.',
    tag: 'afspraak' as const,
  },
  {
    q: 'Moet ik met gewassen haar komen?',
    a: 'Niet verplicht. Haircut + wassen zit in het menu. Kom gerust zoals je bent.',
    tag: 'salon' as const,
  },
  {
    q: 'Koop ik producten in de zaak?',
    a: 'Ja. Haar- en baardverzorging liggen in de lounge. Assortiment wisselt — vraag ernaar aan de balie.',
    tag: 'salon' as const,
  },
  {
    q: 'Knippen jullie ook kinderen?',
    a: 'Ja, kinderen t/m 11 jaar. Zelfde precisie, rustiger tempo. Boek de kids-behandeling in Salonhub.',
    tag: 'kids' as const,
  },
] as const

export const SHOP_FAQ_FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'afspraak', label: 'Afspraak' },
  { id: 'salon', label: 'In de zaak' },
  { id: 'kids', label: 'Kids' },
] as const

export const SHOP_FAQ_TITLE = 'Vragen'
export const SHOP_FAQ_INTRO =
  'Boeken, te laat, kids — de rest regel je aan de balie.'
