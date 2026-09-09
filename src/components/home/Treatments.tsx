import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'

const items = [
  {
    title: 'Haircut',
    text: 'Strak, classic of fade — altijd in verhouding met je gezicht.',
    image: '/lookbook/01.jpg',
  },
  {
    title: 'Baard',
    text: 'Trimmen, lijnen of hot towel straight razor.',
    image: '/lookbook/03.jpg',
  },
  {
    title: 'Kids',
    text: 'Kinderen t/m 11. Dezelfde precisie, rustiger tempo.',
    image: '/lookbook/02.jpg',
  },
]

export function Treatments() {
  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-8 section-y sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="type-label inline-flex items-center justify-center gap-2 text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
            Behandelingen
          </p>
          <h2 className="type-headline mt-5">
            Alles wat je
            <br />
            in de stoel nodig hebt
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            Knippen, baard, kids — dezelfde precisie, altijd in verhouding met
            je gezicht.
          </p>
        </div>
        <ul className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-5">
          {items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={0.08 + index * 0.1}>
                <Link to="/prijzen" className="group block">
                  <MediaReveal
                    delay={0.08 + index * 0.08}
                    className="relative overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
                  >
                    <div className="relative aspect-[3/4]">
                      <img
                        src={item.image}
                        alt=""
                        className="wf-media-zoom h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="type-ui absolute bottom-4 left-4 text-white/80">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </MediaReveal>
                  <h3 className="type-subhead mt-5 text-white">{item.title}</h3>
                  <p className="type-lead mt-2 text-white/50">{item.text}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
