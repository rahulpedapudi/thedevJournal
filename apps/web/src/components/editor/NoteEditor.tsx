import { Sparkles, Trash2 } from "lucide-react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { LoadingSpinner } from "../LoadingSpinner";
import { NoteEditorMeta } from "./NoteEditorMeta";
import { parseMarkdown } from "../../lib/markdown";

interface NoteEditorProps {
  activeNote: DevNote;
  projects: Project[];

  // Local (optimistic) state — owned by the page, passed down
  localTitle: string;
  localRawContent: string;
  localNoteType: string;
  localProjectId: string;
  aiView: "raw" | "polished";

  // Mutation state
  isPolishing: boolean;
  isDeleting: boolean;

  // Callbacks
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: "raw" | "polished") => void;
  onPolish: () => void;
  onDelete: () => void;
}

/**
 * The main note editing panel.
 * Renders the meta bar, title input, and either the raw textarea or the
 * AI-polished HTML render — depending on `aiView`.
 */
export function NoteEditor({
  activeNote,
  projects,
  localTitle,
  localRawContent,
  localNoteType,
  localProjectId,
  aiView,
  isPolishing,
  isDeleting,
  onTitleChange,
  onContentChange,
  onTypeChange,
  onProjectChange,
  onViewChange,
  onPolish,
  onDelete,
}: NoteEditorProps) {
  const isProcessing =
    isPolishing || activeNote.aiStatus === "processing";

  return (
    <div className="note-editor">
      {/* Meta controls */}
      <NoteEditorMeta
        activeNote={activeNote}
        projects={projects}
        localNoteType={localNoteType}
        localProjectId={localProjectId}
        aiView={aiView}
        onTypeChange={onTypeChange}
        onProjectChange={onProjectChange}
        onViewChange={onViewChange}
      />

      {/* Title */}
      <input
        type="text"
        className="note-title-input"
        placeholder="Untitled Note"
        value={localTitle}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      {/* Body — raw textarea or polished render */}
      {aiView === "raw" ? (
        <div className="note-textarea-wrapper">
          <textarea
            className="note-textarea"
            placeholder="// Write raw scratchpad code / notes here..."
            value={localRawContent}
            onChange={(e) => onContentChange(e.target.value)}
          />

          <div className="flex-between">
            {/* Polish CTA */}
            <button
              onClick={onPolish}
              className="btn btn-primary"
              disabled={isProcessing || !localRawContent.trim()}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner
                    style={{
                      borderColor: "rgba(255,255,255,0.2)",
                      borderLeftColor: "#fff",
                    }}
                  />
                  <span>Polishing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Polish Note</span>
                </>
              )}
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="btn btn-danger-ghost"
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="ai-polished-render"
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(activeNote.enrichedContent ?? ""),
          }}
        />
      )}
    </div>
  );
}
