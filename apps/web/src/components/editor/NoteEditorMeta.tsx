import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { Folder, Tag, Sparkles, FileText, Code2, Bot } from "lucide-react";

const NOTE_TYPES = [
  "note",
  "learning",
  "problem",
  "solution",
  "idea",
  "decision",
  "experiment",
  "question",
  "progress",
] as const;

export type EditorViewMode = "notion" | "raw" | "polished";

interface NoteEditorMetaProps {
  activeNote: DevNote;
  projects: Project[];
  localNoteType: string;
  localProjectId: string;
  aiView: EditorViewMode;
  isAgentOpen?: boolean;
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: EditorViewMode) => void;
  onToggleAgent?: () => void;
}

/**
 * Modern metadata toolbar (Linear x Obsidian).
 */
export function NoteEditorMeta({
  activeNote,
  projects,
  localNoteType,
  localProjectId,
  aiView,
  isAgentOpen = false,
  onTypeChange,
  onProjectChange,
  onViewChange,
  onToggleAgent,
}: NoteEditorMetaProps) {
  const isPolished = activeNote.aiStatus === "completed" && activeNote.enrichedContent;
  const isProcessing = activeNote.aiStatus === "processing";

  // Calculate approximate word count & reading time
  const wordCount = (activeNote.rawContent || "").trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border-subtle pb-3 mb-5 gap-3">
      {/* Controls & Metadata Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Project Selector */}
        <div className="relative flex items-center">
          <select
            className="h-7 pl-2.5 pr-6 bg-bg-surface border border-border-subtle hover:border-border-strong rounded text-text-primary font-mono text-[11px] outline-none transition-colors cursor-pointer appearance-none"
            value={localProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">No Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Folder size={11} className="absolute right-2 text-text-muted pointer-events-none" />
        </div>

        {/* Note Type Selector */}
        <div className="relative flex items-center">
          <select
            className="h-7 pl-2.5 pr-6 bg-bg-surface border border-border-subtle hover:border-border-strong rounded text-text-primary font-mono text-[11px] uppercase outline-none transition-colors cursor-pointer appearance-none"
            value={localNoteType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Tag size={11} className="absolute right-2 text-text-muted pointer-events-none" />
        </div>

        {/* Status Badge */}
        <span
          className={`h-7 px-2 inline-flex items-center gap-1.5 rounded font-mono text-[10px] font-semibold border ${
            isPolished
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : isProcessing
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-bg-elevated text-text-muted border-border-subtle"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPolished
                ? "bg-emerald-400"
                : isProcessing
                ? "bg-amber-400 animate-pulse"
                : "bg-zinc-600"
            }`}
          />
          <span className="uppercase">{isPolished ? "polished" : isProcessing ? "processing" : "draft"}</span>
        </span>

        {/* Word count badge */}
        <span className="hidden md:inline-flex text-[10px] font-mono text-text-muted px-2 py-1 rounded bg-bg-elevated/40 border border-border-subtle/50">
          {wordCount} words · {readTime} min read
        </span>
      </div>

      {/* Right Controls: View Mode & Agent Assistant Toggle */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {/* Agent Panel Toggle Button */}
        {onToggleAgent && (
          <button
            type="button"
            onClick={onToggleAgent}
            className={`h-7 px-2.5 rounded inline-flex items-center gap-1.5 font-mono text-[11px] font-medium transition-all cursor-pointer border ${
              isAgentOpen
                ? "bg-accent/15 text-accent border-accent/40 shadow-xs"
                : "bg-bg-surface text-text-muted hover:text-text-primary border-border-subtle hover:border-border-strong"
            }`}
            title="Toggle Agent Chat Sidebar"
          >
            <Bot size={13} className={isAgentOpen ? "text-accent" : ""} />
            <span>Agent Chat</span>
            {isAgentOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        )}

        {/* View Mode Segmented Controls */}
        <div className="flex items-center bg-bg-primary border border-border-subtle rounded p-0.5 font-mono text-[11px]">
          <button
            onClick={() => onViewChange("notion")}
            className={`h-6 px-2.5 rounded inline-flex items-center gap-1 transition-all cursor-pointer ${
              aiView === "notion"
                ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            }`}
            title="Visual Editor"
          >
            <FileText size={12} />
            <span>Editor</span>
          </button>

          <button
            onClick={() => onViewChange("raw")}
            className={`h-6 px-2.5 rounded inline-flex items-center gap-1 transition-all cursor-pointer ${
              aiView === "raw"
                ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            }`}
            title="Raw Markdown Scratchpad"
          >
            <Code2 size={12} />
            <span>Raw</span>
          </button>

          <button
            onClick={() => {
              if (activeNote.enrichedContent) onViewChange("polished");
            }}
            disabled={!activeNote.enrichedContent}
            className={`h-6 px-2.5 rounded inline-flex items-center gap-1 transition-all ${
              aiView === "polished"
                ? "bg-bg-elevated text-emerald-400 font-semibold border border-border-strong"
                : "text-text-muted hover:text-text-primary"
            } ${!activeNote.enrichedContent ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            title={!activeNote.enrichedContent ? "Polish note with AI first" : "Polished Article"}
          >
            <Sparkles size={12} className={isPolished ? "text-emerald-400" : ""} />
            <span>Polished</span>
          </button>
        </div>
      </div>
    </div>
  );
}

