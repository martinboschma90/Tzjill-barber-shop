import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react'
import { Tabs, inputCls } from '@/cms/flow-mates/cms-ui'
import { useEditorAccordion } from '@/cms/flow-mates/EditorAccordionScope'

type FieldProps = {
  label: string
  controlId?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, controlId, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={controlId} className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
        {label}
      </label>
      {children}
      {hint ? <p id={controlId ? `${controlId}-hint` : undefined} className="text-[13px] leading-relaxed text-[#6b6b66]">{hint}</p> : null}
    </div>
  )
}

export const controlClass = inputCls
export const controlStyle = undefined

export function CompactInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="text"
      className={`${inputCls} ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  )
}

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  placeholder?: string
}

export function TextInput({ label, value, onChange, hint, placeholder }: TextInputProps) {
  const id = useId()
  return (
    <Field label={label} controlId={id} hint={hint}>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        type="text"
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </Field>
  )
}

type TextAreaProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  rows?: number
  placeholder?: string
}

export function TextArea({ label, value, onChange, hint, rows = 4, placeholder }: TextAreaProps) {
  const id = useId()
  return (
    <Field label={label} controlId={id} hint={hint}>
      <textarea
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputCls} min-h-[6rem] resize-y`}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
    </Field>
  )
}

type SectionTab = {
  id: string
  label: string
  children: ReactNode
}

type EditorSectionProps = {
  title: string
  description?: string
  children?: ReactNode
  tabs?: SectionTab[]
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultTabId?: string
  badge?: string
  sectionKey?: string
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  thumbnail?: string | null
}

function tabIcon(id: string) {
  if (id === 'media') return ImageIcon
  if (id === 'settings') return Sliders
  return FileText
}

export function EditorSection({
  title,
  description,
  children,
  tabs,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  defaultTabId,
  badge,
  sectionKey,
  visible = true,
  onVisibleChange,
  thumbnail,
}: EditorSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const generatedId = useId().replaceAll(':', '')
  const accordion = useEditorAccordion()
  const accordionRegister = accordion?.register
  const accordionUnregister = accordion?.unregister
  const id = sectionKey ?? generatedId
  const accordionOpen =
    accordion && accordion.hasSection(id) ? accordion.isOpen(id) : defaultOpen
  const open = openProp ?? (accordion ? accordionOpen : uncontrolledOpen)

  useEffect(() => {
    accordionRegister?.(id, defaultOpen)
    return () => accordionUnregister?.(id)
  }, [accordionRegister, accordionUnregister, defaultOpen, id])

  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      if (accordion) accordion.setOpen(id, next)
      else setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
  }
  const [tabId, setTabId] = useState(defaultTabId ?? tabs?.[0]?.id ?? 'content')
  const panelId = useId()
  const activeTab = tabs?.find((t) => t.id === tabId) ?? tabs?.[0]
  const body = tabs ? activeTab?.children : children

  const openMedia = () => {
    if (!open) setOpen(true)
    if (tabs?.some((t) => t.id === 'media')) setTabId('media')
  }

  return (
    <section
      id={`cms-editor-section-${id}`}
      onFocusCapture={() => window.dispatchEvent(new CustomEvent('cms-preview-section', { detail: id }))}
      className="border-b border-[#e5e5e5] py-1"
    >
      <div className="flex min-h-10 items-center gap-2">
        {thumbnail ? (
          <button
            type="button"
            onClick={openMedia}
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]"
            title="Media wijzigen"
            aria-label={`Media van ${title} wijzigen`}
          >
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
            {title}
          </span>
          {badge ? <span className="text-[11px] text-[#8a8a86]">{badge}</span> : null}
          {!visible ? <span className="text-[11px] text-[#8a8a86]">verborgen</span> : null}
        </button>
        {onVisibleChange ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onVisibleChange(!visible)
            }}
            title={visible ? 'Sectie verbergen' : 'Sectie tonen'}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b6b66] hover:text-[#111214]"
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {visible ? 'Aan' : 'Uit'}
          </button>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="pb-4 pt-1">
          {description ? <p className="mb-3 text-[13px] text-[#6b6b66]">{description}</p> : null}
          {tabs && tabs.length > 0 ? (
            <div className="mb-3">
              <Tabs
                tabs={tabs.map((t) => ({
                  key: t.id,
                  label: t.label,
                  icon: tabIcon(t.id),
                }))}
                value={tabId}
                onChange={setTabId}
              />
            </div>
          ) : null}
          <div className="space-y-3">{body}</div>
        </div>
      ) : null}
    </section>
  )
}
