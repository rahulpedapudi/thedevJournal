import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { LoadingSpinner } from "../LoadingSpinner";
import { NoteEditorMeta, type EditorViewMode } from "./NoteEditorMeta";
import { NotionEditor } from "./NotionEditor";
import { PolishedNoteViewer } from "./PolishedNoteViewer";
import { AgentChatPanel } from "../agent/AgentChatPanel";

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
  isAgentOpen?: boolean;

  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTypeChange: (type: string) => void;
  onProjectChange: (projectId: string) => void;
  onViewChange: (view: EditorViewMode) => void;
  onPolish: () => void;
  onDelete: () => void;
  onToggleAgent?: () => void;
}

/**
 * Modern Obsidian-grade editor pane with integrated AI Agent Chat Panel.
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
  isAgentOpen: externalIsAgentOpen,
  onTitleChange,
  onContentChange,
  onTypeChange,
  onProjectChange,
  onViewChange,
  onPolish,
  onDelete,
  onToggleAgent,
}: NoteEditorProps) {
  const isProcessing = isPolishing || activeNote.aiStatus === "processing";
  const [internalIsAgentOpen, setInternalIsAgentOpen] = useState(false);

  const isAgentOpen = externalIsAgentOpen ?? internalIsAgentOpen;
  const handleToggleAgent = () => {
    if (onToggleAgent) {
      onToggleAgent();
    } else {
      setInternalIsAgentOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-0 overflow-hidden relative font-sans items-stretch">
      {/* ── Left Panel: Main Note View (Independent Scrollbar) ───────────────── */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-28 font-sans">
        {/* Top Metadata Control Bar */}
        <NoteEditorMeta
          activeNote={activeNote}
          projects={projects}
          localNoteType={localNoteType}
          localProjectId={localProjectId}
          aiView={aiView}
          isAgentOpen={isAgentOpen}
          onTypeChange={onTypeChange}
          onProjectChange={onProjectChange}
          onViewChange={onViewChange}
          onToggleAgent={handleToggleAgent}
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
      </div>

      {/* ── Right Panel: Fixed Agent Chat Column (Independent Scrollbar) ──────── */}
      {isAgentOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            onClick={handleToggleAgent}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[1040] animate-in fade-in duration-200"
          />

          {/* Fixed Right Panel Column */}
          <div className="fixed inset-y-0 right-0 z-[1050] w-full sm:w-[380px] lg:static lg:z-auto lg:h-full lg:w-[380px] xl:w-[420px] shrink-0 border-l border-border-subtle bg-bg-surface flex flex-col min-h-0 animate-in slide-in-from-right duration-200">
            <AgentChatPanel
              activeNote={activeNote}
              noteTitle={localTitle}
              noteContent={localRawContent}
              isOpen={isAgentOpen}
              onClose={handleToggleAgent}
            />
          </div>
        </>
      )}
    </div>
  );
}

