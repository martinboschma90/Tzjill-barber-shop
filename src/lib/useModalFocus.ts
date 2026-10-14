import { useEffect, useRef } from 'react'

const focusable = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'

export function useModalFocus(open: boolean, close?: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !ref.current) return
    const dialog = ref.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const elements = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusable)).filter((element) => !element.hidden && element.getClientRects().length > 0)
    const frame = requestAnimationFrame(() => (elements()[0] ?? dialog).focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && close) { event.preventDefault(); close() }
      if (event.key !== 'Tab') return
      const items = elements()
      const first = items[0]
      const last = items.at(-1)
      if (!first || !last) { event.preventDefault(); dialog.focus(); return }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) (elements()[0] ?? dialog).focus()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
      if (previous?.isConnected) previous.focus()
    }
  }, [open, close])
  return ref
}
