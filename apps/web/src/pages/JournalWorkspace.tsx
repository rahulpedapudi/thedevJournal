import { useState, useEffect, useRef } from "react";
import { diff_match_patch } from "diff-match-patch";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, HardDrive } from "lucide-react";
import { apiFetch } from "../lib/api";
import {
  useNotes,
  useActiveNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  usePolishNote,
  useDiffPatch,
} from "../hooks/useNotes";
import { useProjects, useCreateProject } from "../hooks/useProjects";
import { NoteEditor } from "../components/editor/NoteEditor";
import { DriveDashboard } from "../components/dashboard/Dashboard";
import { AgentChatPanel } from "../components/agent/AgentChatPanel";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FloatingActionBar } from "../components/navigation/FloatingActionBar";

/**
 * JournalWorkspace — Full-width top navbar architecture (No Sidebar).
 */
export function JournalWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { noteId, projectId } = useParams<{
    noteId?: string;
    projectId?: string;
  }>();

  // ── Server state ────────────────────────────────────────────────────────
  const { data: projects = [] } = useProjects();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: activeNote, isLoading: loadingActiveNote } =
    useActiveNote(noteId);

  // ── Mutations ────────────────────────────────────────────────────────────
  const createNote = useCreateNote();
  const createProject = useCreateProject();
  const updateNote = useUpdateNote(noteId);
  const diffPatch = useDiffPatch(noteId);
  const deleteNote = useDeleteNote();
  const polishNote = usePolishNote(noteId);

  // ── Local editor state ───────────────────────────────────────────────────
  const [localTitle, setLocalTitle] = useState("");
  const [localRawContent, setLocalRawContent] = useState("");
  const [localNoteType, setLocalNoteType] = useState<string>("note");
  const [localProjectId, setLocalProjectId] = useState("");
  const [aiView, setAiView] = useState<"notion" | "raw" | "polished">("notion");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("chat") === "1") {
      setIsAgentOpen(true);
      searchParams.delete("chat");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const currentNoteIdRef = useRef<string | null>(null);

  // ── Sync local state when active note changes ────────────────────────────
  useEffect(() => {
    if (activeNote && noteId) {
      const isNoteSwitch = currentNoteIdRef.current !== noteId;
      if (isNoteSwitch) {
        currentNoteIdRef.current = noteId;
        setLocalTitle(activeNote.title ?? "");
        setLocalRawContent(activeNote.rawContent ?? "");
      }
      setLocalNoteType(activeNote.noteType ?? "note");
      setLocalProjectId(activeNote.projectId ?? "");
      if (aiView === "polished" && !activeNote.enrichedContent) {
        setAiView("notion");
      }
    } else if (!noteId) {
      currentNoteIdRef.current = null;
      setLocalTitle("");
      setLocalRawContent("");
      setLocalNoteType("note");
      setLocalProjectId("");
      setAiView("notion");
    }
  }, [noteId, activeNote]);

  // ── Debounced auto-save: title (and other metadata) ──────────────────────
  useEffect(() => {
    if (!noteId || !activeNote) return;
    const hasTitleDiff = localTitle !== (activeNote.title ?? "");
    if (!hasTitleDiff) return;

    const timer = setTimeout(() => {
      updateNote.mutate({ title: localTitle });
    }, 1000);

    return () => clearTimeout(timer);
  }, [localTitle]);

  // ── Debounced auto-save: rawContent via diff patch ────────────────────────
  useEffect(() => {
    if (!noteId || !activeNote) return;
    const hasContentDiff = localRawContent !== (activeNote.rawContent ?? "");
    if (!hasContentDiff) return;

    const timer = setTimeout(() => {
      const dmp = new diff_match_patch();
      const patches = dmp.patch_make(
        activeNote.rawContent ?? "",
        localRawContent,
      );
      const patchStr = dmp.patch_toText(patches);

      diffPatch.mutate({ patchStr, baseRevision: activeNote.revision });
    }, 1000);

    return () => clearTimeout(timer);
  }, [localRawContent]);

  const handleNewNote = async (options?: {
    title?: string;
    projectId?: string;
    noteType?: string;
  }) => {
    const resData = await createNote.mutateAsync(undefined as any);
    const created = Array.isArray(resData) ? resData[0] : resData;
    const newNote = created as { id: string } | null | undefined;
    if (!newNote || !newNote.id) return;

    const targetProjectId = options?.projectId || projectId || null;
    const patchBody: Record<string, any> = {};
    if (options?.title) patchBody.title = options.title;
    if (targetProjectId) patchBody.projectId = targetProjectId;
    if (options?.noteType) patchBody.noteType = options.noteType;

    if (Object.keys(patchBody).length > 0) {
      await apiFetch(`/api/devnote/${newNote.id}`, {
        method: "PATCH",
        body: JSON.stringify(patchBody),
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }

    if (targetProjectId) {
      navigate(`/projects/${targetProjectId}/notes/${newNote.id}`);
    } else {
      navigate(`/notes/${newNote.id}`);
    }
  };

  const handleTypeChange = (newType: string) => {
    setLocalNoteType(newType);
    if (noteId) updateNote.mutate({ noteType: newType });
  };

  const handleProjectChange = (projId: string) => {
    setLocalProjectId(projId);
    if (noteId) updateNote.mutate({ projectId: projId === "" ? null : projId });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    deleteNote.mutate(activeNote!.id, {
      onSuccess: () => {
        navigate(projectId ? `/projects/${projectId}` : "/");
      },
    });
  };

  const handlePolish = () => {
    polishNote.mutate(activeNote!.id, {
      onSuccess: () => setAiView("polished"),
    });
  };

  const currentProjectName = projectId
    ? projects.find((p) => p.id === projectId)?.name
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-screen max-h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* ── Global Desktop & Mobile Top Navigation Header (No Sidebar) ─────────────── */}
      <header className="sticky top-0 z-1000 h-13 px-4 md:px-8 bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between select-none shrink-0">
        {/* Left: Brand Mark & Breadcrumbs */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-6 h-6 rounded bg-text-primary text-bg-surface flex items-center justify-center font-mono font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              {">_"}
            </div>
            <span className="text-xs font-bold tracking-tight text-text-primary group-hover:text-white transition-colors font-mono hidden sm:inline-block">
              thedevjournal
            </span>
          </div>

          <div className="h-4 w-px bg-border-subtle shrink-0" />

          {/* Breadcrumb Path Navigation */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted truncate">
            <span
              onClick={() => navigate("/")}
              className="hover:text-text-primary cursor-pointer flex items-center gap-1 shrink-0"
            >
              <HardDrive size={13} />
              <span>workspace</span>
            </span>

            {currentProjectName && (
              <>
                <ChevronRight
                  size={12}
                  className="text-text-muted/60 shrink-0"
                />
                <span
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="hover:text-text-primary cursor-pointer text-text-secondary truncate max-w-35"
                >
                  {currentProjectName}
                </span>
              </>
            )}

            {noteId && activeNote && (
              <>
                <ChevronRight
                  size={12}
                  className="text-text-muted/60 shrink-0"
                />
                <span className="text-text-primary font-medium truncate max-w-40">
                  {activeNote.title || "Untitled"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Auto-save Sync Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted px-2 py-1 rounded bg-bg-primary border border-border-subtle/60">
            {updateNote.isPending || diffPatch.isPending ? (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Synced</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body ────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative w-full">
        {!noteId ? (
          <div className="flex-1 flex overflow-hidden w-full relative min-h-0">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 w-full">
              <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
                <DriveDashboard
                  notes={notes}
                  projects={projects}
                  notesLoading={notesLoading}
                  activeProjectId={projectId}
                  onCreateNote={handleNewNote}
                  onCreateProject={(name) => createProject.mutate(name)}
                  onDeleteNote={(id) => deleteNote.mutate(id)}
                  onPolishNote={(id) => polishNote.mutate(id)}
                  isCreatingNote={createNote.isPending}
                  onToggleAgent={() => setIsAgentOpen((prev) => !prev)}
                  isAgentOpen={isAgentOpen}
                />
              </div>
            </div>

            {/* Dashboard Agent Chat Sidebar */}
            {isAgentOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  onClick={() => setIsAgentOpen(false)}
                  className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[1040] animate-in fade-in duration-200"
                />

                <div className="fixed inset-y-0 right-0 z-[1050] w-full sm:w-[380px] lg:static lg:z-auto lg:h-full lg:w-[380px] xl:w-[420px] shrink-0 border-l border-border-subtle bg-bg-surface flex flex-col min-h-0 animate-in slide-in-from-right duration-200">
                  <AgentChatPanel
                    isOpen={isAgentOpen}
                    onClose={() => setIsAgentOpen(false)}
                    projectId={projectId}
                  />
                </div>
              </>
            )}
          </div>
        ) : loadingActiveNote || !activeNote ? (
          <div className="flex justify-center items-center flex-1 p-16">
            <LoadingSpinner />
          </div>
        ) : (
          <NoteEditor
            activeNote={activeNote}
            projects={projects}
            localTitle={localTitle}
            localRawContent={localRawContent}
            localNoteType={localNoteType}
            localProjectId={localProjectId}
            aiView={aiView}
            isPolishing={polishNote.isPending}
            isDeleting={deleteNote.isPending}
            isAgentOpen={isAgentOpen}
            onToggleAgent={() => setIsAgentOpen((prev) => !prev)}
            onTitleChange={setLocalTitle}
            onContentChange={setLocalRawContent}
            onTypeChange={handleTypeChange}
            onProjectChange={handleProjectChange}
            onViewChange={setAiView}
            onPolish={handlePolish}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* ── Floating Action Bar ──────────────────────────────────────────── */}
      <FloatingActionBar
        onNewNote={handleNewNote}
        isCreatingNote={createNote.isPending}
        onPolishNote={activeNote ? handlePolish : undefined}
        isPolishing={polishNote.isPending}
        activeNoteId={activeNote?.id}
        isAgentOpen={isAgentOpen}
        onToggleAgent={() => setIsAgentOpen((prev) => !prev)}
      />
    </div>
  );
}
