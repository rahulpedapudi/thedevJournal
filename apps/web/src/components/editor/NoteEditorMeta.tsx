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

interface NoteEditorMetaProps {
  activeNote: DevNote;
  projects: Project[];
  localNoteType: string;
  localProjectId: string;
  aiView: "raw" | "polished";
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: "raw" | "polished") => void;
}

/** Derives the status-chip CSS class from the note's AI state. */
function resolveStatusClass(note: DevNote): string {
  if (note.aiStatus === "completed" && note.enrichedContent) return "completed";
  if (note.aiStatus === "processing") return "pending";
  return "draft";
}

/**
 * The meta bar at the top of the editor:
 *   [Project selector] [Type selector] [Status chip]  |  [raw · polished]
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
  const statusClass = resolveStatusClass(activeNote);
  const statusLabel =
    activeNote.aiStatus === "completed" && activeNote.enrichedContent
      ? "polished"
      : activeNote.aiStatus;

  return (
    <div className="note-editor-meta">
      <div className="flex-align-center gap-12">
        {/* Project Selector */}
        <select
          className="select-input"
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
          className="select-input"
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
        <span className={`status-chip ${statusClass}`}>{statusLabel}</span>
      </div>

      {/* Raw / Polished Toggle */}
      <div className="toggle-tabs-container">
        <button
          onClick={() => onViewChange("raw")}
          className={`toggle-tab ${aiView === "raw" ? "active" : ""}`}
        >
          raw
        </button>
        <span className="toggle-tab-separator">·</span>
        <button
          onClick={() => {
            if (activeNote.enrichedContent) onViewChange("polished");
          }}
          className={`toggle-tab ${aiView === "polished" ? "active" : ""}`}
          disabled={!activeNote.enrichedContent}
          style={{
            cursor: activeNote.enrichedContent ? "pointer" : "not-allowed",
            opacity: activeNote.enrichedContent ? 1 : 0.4,
          }}
          title={
            !activeNote.enrichedContent
              ? "Polish this note first to view the polished article"
              : ""
          }
        >
          polished
        </button>
      </div>
    </div>
  );
}
