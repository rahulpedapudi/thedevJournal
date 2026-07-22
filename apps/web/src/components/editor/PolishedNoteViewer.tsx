import { useMemo } from "react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { parseMarkdown } from "../../lib/markdown";

interface PolishedNoteViewerProps {
  activeNote: DevNote;
  projects: Project[];
  onBackToEditor: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function PolishedNoteViewer({
  activeNote,

}: PolishedNoteViewerProps) {
  const enrichedHtml = useMemo(
    () => parseMarkdown(activeNote.enrichedContent ?? ""),
    [activeNote.enrichedContent]
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">

      {/* ── Main Notion Article Canvas Card ─────────────────────────────── */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 md:p-10 shadow-sm">
        <article className="ai-polished-render max-w-none">
          <div dangerouslySetInnerHTML={{ __html: enrichedHtml }} />
        </article>
      </div>
    </div>
  );
}
