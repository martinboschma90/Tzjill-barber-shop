/**
 * SectionAccordionToolbar — tiny "X of Y open" strip with Alles openen /
 * Alles sluiten buttons. Renders above the list of section cards in every
 * CMS page editor.
 */
import { PencilLine } from "lucide-react";

export function SectionAccordionToolbar({
  openCount,
  total,
  allOpen,
  allClosed,
  onExpandAll,
  onCollapseAll,
  onQuickEdit,
}: {
  openCount: number;
  total: number;
  allOpen: boolean;
  allClosed: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onQuickEdit?: () => void;
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="text-[11px] text-[#8a8a86]">
        {openCount}/{total}
      </span>
      <div className="flex items-center gap-3">
        {onQuickEdit && (
          <button
            type="button"
            onClick={onQuickEdit}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b6b66] hover:text-[#111214]"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Snel
          </button>
        )}
        <button
          type="button"
          onClick={onExpandAll}
          disabled={allOpen}
          className="text-[12px] font-medium text-[#6b6b66] hover:text-[#111214] disabled:opacity-40"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          disabled={allClosed}
          className="text-[12px] font-medium text-[#6b6b66] hover:text-[#111214] disabled:opacity-40"
        >
          Dicht
        </button>
      </div>
    </div>
  );
}
