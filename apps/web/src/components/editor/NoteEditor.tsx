import { Sparkles, Trash2 } from "lucide-react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { LoadingSpinner } from "../LoadingSpinner";
import { NoteEditorMeta, type EditorViewMode } from "./NoteEditorMeta";
import { NotionEditor } from "./NotionEditor";
import { PolishedNoteViewer } from "./PolishedNoteViewer";

interface NoteEditorProps {
  activeNote: DevNote;
  projects: Project[];

  // Local (optimistic) state — owned by the page, passed down
  localTitle: string;
  localRawContent: string;
  localNoteType: string;
  localProjectId: string;
  aiView: EditorViewMode;

  // Mutation state
  isPolishing: boolean;
  isDeleting: boolean;

  // Callbacks
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: EditorViewMode) => void;
  onPolish: () => void;
  onDelete: () => void;
}

/**
 * The main note editing panel.
 * Renders the meta bar, title input, and either the Notion WYSIWYG editor,
 * raw textarea, or AI-polished HTML render.
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
    <div className="flex flex-col h-full">
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
        className="w-full text-2xl font-medium font-sans text-text-primary bg-transparent border-none outline-none mb-6 p-0 tracking-tight placeholder:text-border-subtle"
        placeholder="Untitled Note"
        value={localTitle}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      {/* Body — Notion WYSIWYG Editor, Raw Textarea, or Polished Render */}
      {aiView === "notion" ? (
        <div className="flex flex-col flex-1">
          <NotionEditor
            content={localRawContent}
            onChange={onContentChange}
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
            {/* Polish CTA */}
            <button
              type="button"
              onClick={onPolish}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
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
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-medium bg-transparent text-red-500 border border-border-subtle hover:bg-red-500/10 hover:border-red-400 transition-all cursor-pointer disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      ) : aiView === "raw" ? (
        <div className="flex flex-col flex-1 relative w-full">
          <textarea
            className="w-full h-100 min-h-75 border-b border-transparent focus:border-border-subtle bg-transparent text-text-primary font-mono text-sm leading-relaxed resize-y outline-none p-0 mb-6 transition-colors"
            placeholder="// Write raw scratchpad code / notes here..."
            value={localRawContent}
            onChange={(e) => onContentChange(e.target.value)}
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
            {/* Polish CTA */}
            <button
              type="button"
              onClick={onPolish}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
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
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-medium bg-transparent text-red-500 border border-border-subtle hover:bg-red-500/10 hover:border-red-400 transition-all cursor-pointer disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      ) : (
        <PolishedNoteViewer
          activeNote={activeNote}
          projects={projects}
          onBackToEditor={() => onViewChange("notion")}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
