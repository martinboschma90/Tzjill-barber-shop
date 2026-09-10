import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { listBtnClass } from '@/cms/editors/listBtn'
import { AdminListCard } from '@/cms/editors/AdminListCard'
import { TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

function newTeamId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `t-${Date.now()}`
}

export function TeamEditor() {
  const { content, setSite, setTeam } = useCms()
  const { site, team } = content
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <p className="text-sm text-neutral-600">Team op de site</p>
        <button
          type="button"
          onClick={() =>
            setSite((s) => ({ ...s, teamVisible: site.teamVisible === false }))
          }
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            site.teamVisible !== false
              ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700'
              : 'border-neutral-200 text-neutral-500'
          }`}
        >
          {site.teamVisible !== false ? 'Zichtbaar' : 'Verborgen'}
        </button>
      </div>
      {team.map((member, index) => (
        <AdminListCard
          key={member.id}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
          thumbnail={
            member.imageUrl ? (
              <img src={member.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : null
          }
          title={member.name || `Kapper ${index + 1}`}
          meta={member.role || 'Barber'}
          actions={
            <button
              type="button"
              className={listBtnClass}
              onClick={() => setTeam((list) => list.filter((_, i) => i !== index))}
            >
              Verwijder
            </button>
          }
        >
          <TextInput
            label="Naam"
            value={member.name}
            onChange={(name) =>
              setTeam((list) =>
                list.map((m, i) => (i === index ? { ...m, name } : m)),
              )
            }
          />
          <TextInput
            label="Rol"
            value={member.role}
            onChange={(role) =>
              setTeam((list) =>
                list.map((m, i) => (i === index ? { ...m, role } : m)),
              )
            }
          />
          <MediaUrlField
            label="Foto"
            kind="image"
            value={member.imageUrl}
            onChange={(imageUrl) =>
              setTeam((list) =>
                list.map((m, i) => (i === index ? { ...m, imageUrl } : m)),
              )
            }
          />
        </AdminListCard>
      ))}
      <button
        type="button"
        className={listBtnClass}
        onClick={() =>
          setTeam((list) => [
            ...list,
            { id: newTeamId(), name: '', role: 'Barber', imageUrl: '' },
          ])
        }
      >
        + Kapper
      </button>
    </div>
  )
}
