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
import { useProjects } from "../hooks/useProjects";
import { Sidebar } from "../components/sidebar/Sidebar";
import { NoteEditor } from "../components/editor/NoteEditor";
import { EmptyState } from "../components/editor/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";

/**
 * JournalWorkspace — the main two-panel page.
 *
 * Data flow:
 *  1. URL params (noteId, projectId) drive which note is "active".
 *  2. Server state lives in React Query (useNotes, useActiveNote, useProjects).
 *  3. Local editor state (title, content) mirrors the active note and is the
 *     source of truth while the user types.
 *  4. A debounced effect auto-saves local state to the server after 1 s of
 *     inactivity.  `isTypingRef` prevents the server response from
 *     overwriting in-flight edits.
 *  5. Dropdown changes (type, project) bypass the debounce and save
 *     immediately via `useUpdateNote`.
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
  const [aiView, setAiView] = useState<"raw" | "polished">("raw");

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
      setAiView(activeNote.enrichedContent ? "polished" : "raw");
    } else if (!noteId) {
      setLocalTitle("");
      setLocalRawContent("");
      setLocalNoteType("note");
      setLocalProjectId("");
      setAiView("raw");
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
    <div className="app-layout">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn btn-ghost"
          style={{ padding: "6px", height: "32px", width: "32px", border: "none" }}
          aria-label="Open Sidebar"
        >
          <Menu size={18} />
        </button>
        <span className="mobile-header-title">
          {projectId
            ? (projects.find((p) => p.id === projectId)?.name || "Project")
            : "thedevjournal"}
        </span>
        <button
          onClick={handleNewNote}
          className="btn btn-ghost"
          style={{ padding: "6px", height: "32px", width: "32px", border: "none" }}
          disabled={createNote.isPending}
          aria-label="New Note"
        >
          {createNote.isPending ? (
            <LoadingSpinner />
          ) : (
            <Plus size={18} />
          )}
        </button>
      </header>

      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
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

      <main className="content-area dots-grid-bg">
        <div className="content-inner">
          {!noteId ? (
            <EmptyState onCreateNote={handleNewNote} />
          ) : loadingActiveNote || !activeNote ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px" }}>
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
    </div>
  );
}
