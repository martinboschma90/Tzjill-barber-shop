/**
 * Shared CMS UI primitives. Neutral, premium, editorial-leaning.
 * CMS-only — does not affect the public website.
 */
import * as React from "react";

export const inputCls =
  "w-full min-h-11 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[15px] text-[#111214] placeholder:text-[#8a8a86] outline-none hover:border-[#d4d4d0] focus:border-[#111214] focus:ring-[3px] focus:ring-[#111214]/8";

/** Editor (wider) + live preview. Editor used to be 2fr vs 3fr preview, which
 *  crushed media cards and made buttons unclickable in the left column. */
export const EDITOR_PREVIEW_SPLIT =
  "grid gap-6 xl:grid-cols-[minmax(28rem,1.2fr)_minmax(22rem,0.8fr)] lg:grid-cols-1";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  /** Kept for call sites; location is already clear from the section + preview. */
  where?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[13px] leading-relaxed text-[#6b6b66]">{hint}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
  id,
  onFocusCapture,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
  onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      id={id}
      onFocusCapture={onFocusCapture}
      className={`rounded-[12px] border border-[#e5e5e5] bg-white ${
        hover ? "hover:bg-[#fafafa]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
          {title}
        </h4>
        {description && <p className="text-[13px] text-[#6b6b66]">{description}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`cms-primary-action inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#111214] px-4 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-45 ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`cms-secondary-action inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 text-[13px] font-semibold text-[#111214] hover:bg-[#fafafa] disabled:opacity-45 ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`cms-ghost-action inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-[#6b6b66] hover:bg-[#fafafa] hover:text-[#111214] disabled:opacity-45 ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50/80 p-1">
      {tabs.map((t) => {
        const active = t.key === value;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
                active
                  ? "bg-white text-[#111214] shadow-[inset_0_0_0_1px_#e5e5e5]"
                  : "text-[#6b6b66] hover:text-[#111214]"
              }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Modal({
  children,
  onClose,
  title,
  size = "md",
  footer,
  bodyClassName = "",
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: "md" | "lg" | "xl" | "fit";
  footer?: React.ReactNode;
  bodyClassName?: string;
}) {
  const widthCls =
    size === "fit"
      ? "max-w-[1180px]"
      : size === "xl"
      ? "max-w-6xl"
      : size === "lg"
      ? "max-w-4xl"
      : "max-w-2xl";


  // Lock background scroll while modal is open.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-900/50 p-3 backdrop-blur-sm sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex w-full ${widthCls} max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[88vh]`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-3.5 sm:px-6 sm:py-4">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 ${bodyClassName}`}
        >
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-neutral-100 bg-white/95 px-5 py-3 backdrop-blur sm:px-6 sm:py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


