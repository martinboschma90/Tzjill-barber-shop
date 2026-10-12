export const SHOP_FAQ_ITEMS = [
  {
    q: 'Waar zit Tzjill?',
    a: 'Tzjill Barber & Lounge zit aan de Voorstreek 18, 8911 JP Leeuwarden, in de binnenstad. Maandag tot woensdag 10:00–18:00, donderdag tot zaterdag 09:00–20:00. Zondag is de zaak dicht.',
    tag: 'salon' as const,
  },
  {
    q: 'Hoe maak ik een afspraak?',
    a: 'Via Afspraak maken kies je een behandeling, kapper en tijd. Je krijgt een bevestiging per mail. Bellen kan op 058 844 7025.',
    tag: 'afspraak' as const,
  },
  {
    q: 'Wat kost een knipbeurt?',
    a: 'Een haircut bij Tzjill kost €30. Alle tarieven, inclusief baard en kids, staan op de prijzenpagina.',
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
  'Waar we zitten, hoe je boekt, en wat een knipbeurt kost.'
