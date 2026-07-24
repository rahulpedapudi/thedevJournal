import { useMemo, useState } from "react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { parseMarkdown } from "../../lib/markdown";
import { Sparkles, Copy, Check, Edit3 } from "lucide-react";

interface PolishedNoteViewerProps {
  activeNote: DevNote;
  projects?: Project[];
  onBackToEditor: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function PolishedNoteViewer({
  activeNote,
  onBackToEditor,
}: PolishedNoteViewerProps) {
  const [copied, setCopied] = useState(false);

  const enrichedHtml = useMemo(
    () => parseMarkdown(activeNote.enrichedContent ?? ""),
    [activeNote.enrichedContent]
  );

  const handleCopy = () => {
    if (activeNote.enrichedContent) {
      navigator.clipboard.writeText(activeNote.enrichedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-150">
      {/* Article Meta Bar */}
      <div className="flex items-center justify-between px-1 py-1.5 border-b border-border-subtle text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Sparkles size={11} />
            AI Synthesized Document
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded text-[11px] font-mono font-medium bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>
          <button
            onClick={onBackToEditor}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded text-[11px] font-mono font-medium bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
          >
            <Edit3 size={12} />
            <span>Edit Original</span>
          </button>
        </div>
      </div>

      {/* Main Polished Canvas */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 md:p-8 shadow-2xl">
        <article className="ai-polished-render max-w-none">
          <div dangerouslySetInnerHTML={{ __html: enrichedHtml }} />
        </article>
      </div>
    </div>
  );
}
