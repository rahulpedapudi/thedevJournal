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

  localTitle: string;
  localRawContent: string;
  localNoteType: string;
  localProjectId: string;
  aiView: EditorViewMode;

  isPolishing: boolean;
  isDeleting: boolean;

  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: EditorViewMode) => void;
  onPolish: () => void;
  onDelete: () => void;
}

/**
 * Modern Obsidian-grade editor pane.
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
  const isProcessing = isPolishing || activeNote.aiStatus === "processing";

  return (
    <div className="flex flex-col flex-1 h-full max-w-4xl mx-auto w-full">
      {/* Top Metadata Control Bar */}
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

      {/* Note Title Input */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full text-2xl font-bold tracking-tight text-text-primary bg-transparent border-none outline-none p-0 placeholder:text-text-muted/40 font-sans"
          placeholder="Untitled Note..."
          value={localTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      {/* Editor Body */}
      {aiView === "notion" ? (
        <div className="flex flex-col flex-1">
          <NotionEditor content={localRawContent} onChange={onContentChange} />

          {/* Action Footer */}
          <div className="flex items-center justify-between mt-6 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onPolish}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              disabled={isProcessing || !localRawContent.trim()}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner
                    style={{
                      borderColor: "rgba(0,0,0,0.2)",
                      borderLeftColor: "#000",
                    }}
                  />
                  <span>Polishing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Transform with AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded text-xs font-medium bg-transparent text-red-400 border border-border-subtle hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : aiView === "raw" ? (
        <div className="flex flex-col flex-1 relative w-full">
          <textarea
            className="w-full min-h-90 flex-1 bg-bg-surface border border-border-subtle focus:border-border-strong rounded p-3 text-text-primary font-mono text-xs leading-relaxed outline-none transition-colors resize-y"
            placeholder="// Write markdown scratchpad or code notes..."
            value={localRawContent}
            onChange={(e) => onContentChange(e.target.value)}
          />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onPolish}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              disabled={isProcessing || !localRawContent.trim()}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner
                    style={{
                      borderColor: "rgba(0,0,0,0.2)",
                      borderLeftColor: "#000",
                    }}
                  />
                  <span>Polishing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Transform with AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded text-xs font-medium bg-transparent text-red-400 border border-border-subtle hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <PolishedNoteViewer
          activeNote={activeNote}
          projects={projects}
          onBackToEditor={() => onViewChange("notion")}
        />
      )}
    </div>
  );
}
