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

  const wordCount = useMemo(() => {
    return (activeNote.enrichedContent || "").trim().split(/\s+/).filter(Boolean).length;
  }, [activeNote.enrichedContent]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopy = () => {
    if (activeNote.enrichedContent) {
      navigator.clipboard.writeText(activeNote.enrichedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".code-copy-btn") as HTMLButtonElement | null;
    if (btn) {
      const codeToCopy = btn.getAttribute("data-code");
      if (codeToCopy) {
        navigator.clipboard.writeText(codeToCopy);
        const textSpan = btn.querySelector(".copy-text");
        if (textSpan) {
          const origText = textSpan.textContent;
          textSpan.textContent = "Copied!";
          btn.classList.add("text-emerald-400");
          setTimeout(() => {
            if (textSpan) textSpan.textContent = origText;
            btn.classList.remove("text-emerald-400");
          }, 2000);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-150">
      {/* Article Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-2 border-b border-border-subtle text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-xs">
            <Sparkles size={11} className="animate-pulse" />
            AI Synthesized Document
          </span>
          <span className="text-[11px] font-mono text-text-muted px-2 py-0.5 rounded bg-bg-elevated/60 border border-border-subtle/60">
            {wordCount} words · {readTime} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded text-[11px] font-mono font-medium bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-elevated hover:border-border-strong cursor-pointer transition-all active:scale-95"
            title="Copy entire markdown content"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>
          <button
            onClick={onBackToEditor}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded text-[11px] font-mono font-medium bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-elevated hover:border-border-strong cursor-pointer transition-all active:scale-95"
            title="Switch to original editor view"
          >
            <Edit3 size={12} />
            <span>Edit Original</span>
          </button>
        </div>
      </div>

      {/* Main Polished Canvas */}
      <div
        onClick={handleContainerClick}
        className="relative bg-bg-surface border border-border-subtle border-t-emerald-500/30 rounded-xl p-6 md:p-10 shadow-2xl transition-all"
      >
        <article className="ai-polished-render max-w-none">
          <div dangerouslySetInnerHTML={{ __html: enrichedHtml }} />
        </article>
      </div>
    </div>
  );
}

