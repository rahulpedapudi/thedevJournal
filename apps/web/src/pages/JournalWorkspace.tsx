import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Plus } from "lucide-react";
import { authClient } from "../lib/auth-client";
import { apiFetch } from "../lib/api";
import {
  useNotes,
  useActiveNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  usePolishNote,
} from "../hooks/useNotes";
import { useProjects, useCreateProject } from "../hooks/useProjects";
import { Sidebar } from "../components/sidebar/Sidebar";
import { NoteEditor } from "../components/editor/NoteEditor";
import { DriveDashboard } from "../components/dashboard/DriveDashboard";
// import { MobileBottomBar } from "../components/mobile/MobileBottomBar";
import { LoadingSpinner } from "../components/LoadingSpinner";

/**
 * JournalWorkspace — the main full-stack workspace page.
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
  const deleteNote = useDeleteNote();
  const polishNote = usePolishNote(noteId);

  // ── Mobile layout state ──────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Local editor state ───────────────────────────────────────────────────
  const [localTitle, setLocalTitle] = useState("");
  const [localRawContent, setLocalRawContent] = useState("");
  const [localNoteType, setLocalNoteType] = useState<string>("note");
  const [localProjectId, setLocalProjectId] = useState("");
  const [aiView, setAiView] = useState<"notion" | "raw" | "polished">("notion");

  // Tracks whether the user is actively typing to prevent server responses
  // from clobbering in-flight edits.
  const isTypingRef = useRef(false);

  // Close sidebar drawer when changing notes or projects on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [noteId, projectId]);

  // ── Sync local state when active note changes ────────────────────────────
  useEffect(() => {
    if (activeNote && noteId) {
      if (!isTypingRef.current) {
        setLocalTitle(activeNote.title ?? "");
        setLocalRawContent(activeNote.rawContent ?? "");
      }
      setLocalNoteType(activeNote.noteType ?? "note");
      setLocalProjectId(activeNote.projectId ?? "");
      if (aiView === "polished" && !activeNote.enrichedContent) {
        setAiView("notion");
      }
    } else if (!noteId) {
      setLocalTitle("");
      setLocalRawContent("");
      setLocalNoteType("note");
      setLocalProjectId("");
      setAiView("notion");
    }
  }, [noteId, activeNote]);

  // ── Debounced auto-save (title + content) ────────────────────────────────
  useEffect(() => {
    if (!noteId || !activeNote) return;

    const hasTitleDiff = localTitle !== (activeNote.title ?? "");
    const hasContentDiff = localRawContent !== (activeNote.rawContent ?? "");
    if (!hasTitleDiff && !hasContentDiff) return;

    isTypingRef.current = true;
    const timer = setTimeout(() => {
      updateNote.mutate(
        { title: localTitle, rawContent: localRawContent },
        { onSettled: () => { isTypingRef.current = false; } }
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [localTitle, localRawContent]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleNewNote = async () => {
    const resData = await createNote.mutateAsync(undefined as any);
    const newNote = resData?.[0];
    if (!newNote) return;

    if (projectId) {
      // Associate with the current project immediately
      await apiFetch(`/api/devnote/${newNote.id}`, {
        method: "PATCH",
        body: JSON.stringify({ projectId }),
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(`/projects/${projectId}/notes/${newNote.id}`);
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
    if (noteId)
      updateNote.mutate({ projectId: projId === "" ? null : projId });
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

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate("/login");
  };

  // ── Filtered notes (sidebar respects project filter) ─────────────────────
  const filteredNotes = projectId
    ? notes.filter((n) => n.projectId === projectId)
    : notes;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full min-h-screen bg-bg-primary">
      {/* Mobile Top Header */}
      <header className="flex md:hidden fixed top-0 left-0 right-0 h-14 bg-bg-surface border-b border-border-subtle items-center justify-between px-4 z-1000 shadow-xs">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-primary hover:bg-black/5 border-none cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>

        <span
          onClick={() => navigate("/")}
          className="text-sm font-bold tracking-tight text-text-primary cursor-pointer"
        >
          {projectId
            ? (projects.find((p) => p.id === projectId)?.name || "Project")
            : "thedevjournal"}
        </span>

        <button
          onClick={handleNewNote}
          className="p-1.5 h-9 w-9 inline-flex items-center justify-center rounded-lg bg-text-primary text-bg-surface hover:bg-[#282827] border-none cursor-pointer shadow-xs disabled:opacity-50"
          disabled={createNote.isPending}
          aria-label="New Note"
        >
          {createNote.isPending ? (
            <LoadingSpinner
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                borderLeftColor: "#fff",
              }}
            />
          ) : (
            <Plus size={18} />
          )}
        </button>
      </header>

      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed md:hidden inset-0 bg-primary/40 backdrop-blur-[2px] z-1005 animate-in fade-in duration-150"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        projects={projects}
        notes={filteredNotes}
        notesLoading={notesLoading}
        activeProjectId={projectId}
        activeNoteId={noteId}
        onNewNote={handleNewNote}
        newNoteIsPending={createNote.isPending}
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex justify-center p-4 pt-20 pb-20 md:p-8 md:pt-8 md:pb-8 overflow-y-auto h-screen bg-[radial-gradient(var(--color-border-subtle)_1px,transparent_1px)] bg-size-[16px_16px]">
        <div className={`w-full flex flex-col ${!noteId ? "max-w-260" : "max-w-200"}`}>
          {!noteId ? (
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
            />
          ) : loadingActiveNote || !activeNote ? (
            <div className="flex justify-center p-16">
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
              onTitleChange={setLocalTitle}
              onContentChange={setLocalRawContent}
              onTypeChange={handleTypeChange}
              onProjectChange={handleProjectChange}
              onViewChange={setAiView}
              onPolish={handlePolish}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar & FAB */}
      {/* <MobileBottomBar
        onNewNote={handleNewNote}
        isCreatingNote={createNote.isPending}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onSignOut={handleSignOut}
      /> */}
    </div>
  );
}
