import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";

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
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: EditorViewMode) => void;
}

function resolveStatusStyle(note: DevNote): string {
  if (note.aiStatus === "completed" && note.enrichedContent) return "bg-status-completed-bg text-status-completed-text";
  if (note.aiStatus === "processing") return "bg-status-pending-bg text-status-pending-text";
  return "bg-status-draft-bg text-status-draft-text";
}

/**
 * The meta bar at the top of the editor:
 *   [Project selector] [Type selector] [Status chip]  |  [notion · raw · polished]
 */
export function NoteEditorMeta({
  activeNote,
  projects,
  localNoteType,
  localProjectId,
  aiView,
  onTypeChange,
  onProjectChange,
  onViewChange,
}: NoteEditorMetaProps) {
  const statusStyle = resolveStatusStyle(activeNote);
  const statusLabel =
    activeNote.aiStatus === "completed" && activeNote.enrichedContent
      ? "polished"
      : activeNote.aiStatus;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border-subtle pb-3 sm:pb-4 mb-6 gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project Selector */}
        <select
          className="h-8.5 px-2.5 bg-bg-surface border border-border-subtle rounded-md text-text-primary text-xs font-medium outline-none focus:border-text-primary transition-colors cursor-pointer"
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

        {/* Note Type Selector */}
        <select
          className="h-8.5 px-2.5 bg-bg-surface border border-border-subtle rounded-md text-text-primary text-xs font-medium outline-none focus:border-text-primary transition-colors cursor-pointer"
          value={localNoteType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {NOTE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* AI Status Chip */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-tight ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      {/* View Toggle Segmented Control */}
      <div className="flex items-center bg-bg-primary border border-border-subtle rounded-lg p-0.5 self-start sm:self-auto">
        <button
          onClick={() => onViewChange("notion")}
          className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${
            aiView === "notion"
              ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary bg-transparent"
          }`}
          title="Notion WYSIWYG live editor"
        >
          Notion
        </button>
        <button
          onClick={() => onViewChange("raw")}
          className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${
            aiView === "raw"
              ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary bg-transparent"
          }`}
          title="Raw markdown editor"
        >
          Raw
        </button>
        <button
          onClick={() => {
            if (activeNote.enrichedContent) onViewChange("polished");
          }}
          className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all border-none ${
            aiView === "polished"
              ? "bg-bg-surface text-text-primary shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary bg-transparent"
          } ${!activeNote.enrichedContent ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"}`}
          disabled={!activeNote.enrichedContent}
          title={
            !activeNote.enrichedContent
              ? "Polish this note first to view the polished article"
              : "AI Polished View"
          }
        >
          Polished
        </button>
      </div>
    </div>
  );
}
