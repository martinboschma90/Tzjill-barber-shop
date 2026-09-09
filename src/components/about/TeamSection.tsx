import type { TeamMember } from '@/types/artist'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'

type TeamSectionProps = {
  members: TeamMember[]
}

export function TeamSection({ members }: TeamSectionProps) {
  return (
    <section aria-label="Team">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {members.map((member) => (
          <article key={member.id}>
            <div className="group aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
              <ResolvedImg
                src={member.imageUrl}
                alt={member.name}
                className="wf-media-zoom h-full w-full object-cover"
                loading="lazy"
                fetchPriority="low"
                size="team"
                sizes="(max-width: 640px) 100vw, 30vw"
              />
            </div>
            <p className="type-subhead mt-4 text-white">{member.name}</p>
            <p className="type-label mt-1 text-white/40">{member.role}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
