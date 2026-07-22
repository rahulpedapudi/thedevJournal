import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Folder,
  FolderPlus,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  ArrowRight,
  Filter,
  Clock,
  BookOpen,
} from "lucide-react";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { LoadingSpinner } from "../LoadingSpinner";

interface DriveDashboardProps {
  notes: DevNote[];
  projects: Project[];
  notesLoading: boolean;
  activeProjectId?: string;
  onCreateNote: () => void;
  onCreateProject: (name: string) => void;
  onDeleteNote: (id: string) => void;
  onPolishNote: (id: string) => void;
  isCreatingNote?: boolean;
}

export function DriveDashboard({
  notes,
  projects,
  notesLoading,
  activeProjectId,
  onCreateNote,
  onCreateProject,
  onDeleteNote,
  isCreatingNote,
}: DriveDashboardProps) {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  // ── Filtering Logic ──────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search query matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.rawContent?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      // Project filter
      if (activeProjectId && note.projectId !== activeProjectId) {
        return false;
      }

      // AI Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "polished" && (!note.enrichedContent || note.aiStatus !== "completed")) {
          return false;
        }
        if (statusFilter === "draft" && (note.enrichedContent || note.aiStatus === "processing")) {
          return false;
        }
        if (statusFilter === "processing" && note.aiStatus !== "processing") {
          return false;
        }
      }

      // Note Type filter
      if (typeFilter !== "all" && note.noteType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [notes, searchQuery, activeProjectId, statusFilter, typeFilter]);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName("");
      setShowNewProjectModal(false);
    }
  };

  const cleanSnippet = (text?: string) => {
    if (!text) return "No content yet...";
    return text.replace(/[#*`~>-]/g, " ").trim().slice(0, 140) || "No content yet...";
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent-light px-2.5 py-0.5 rounded-full">
              Workspace Drive
            </span>
            {activeProject && (
              <span className="text-xs text-text-secondary font-medium">
                / {activeProject.name}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            {activeProject ? activeProject.name : "All Notes & Projects"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium bg-bg-surface text-text-primary border border-border-subtle hover:bg-black/5 transition-all cursor-pointer"
          >
            <FolderPlus size={15} />
            <span>New Project</span>
          </button>
          <button
            onClick={onCreateNote}
            disabled={isCreatingNote}
            className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold bg-text-primary text-bg-surface hover:bg-[#282827] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {isCreatingNote ? (
              <LoadingSpinner
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  borderLeftColor: "#fff",
                }}
              />
            ) : (
              <Plus size={16} />
            )}
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-3 md:p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full h-9 pl-9 pr-3 text-xs md:text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-secondary outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-bg-primary border border-border-subtle rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-7 px-2.5 inline-flex items-center gap-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-bg-surface text-text-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-7 px-2.5 inline-flex items-center gap-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-bg-surface text-text-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                aria-label="List View"
              >
                <ListIcon size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-text-secondary flex items-center gap-1 font-medium shrink-0 pr-1">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              statusFilter === "all"
                ? "bg-text-primary text-bg-surface"
                : "bg-bg-primary text-text-secondary border border-border-subtle hover:text-text-primary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("polished")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer inline-flex items-center gap-1 ${
              statusFilter === "polished"
                ? "bg-status-completed-bg text-status-completed-text font-semibold border border-emerald-300"
                : "bg-bg-primary text-text-secondary border border-border-subtle hover:text-text-primary"
            }`}
          >
            <Sparkles size={11} /> Polished
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              statusFilter === "draft"
                ? "bg-status-draft-bg text-status-draft-text font-semibold border border-slate-300"
                : "bg-bg-primary text-text-secondary border border-border-subtle hover:text-text-primary"
            }`}
          >
            Drafts
          </button>

          <div className="h-4 w-px bg-border-subtle shrink-0 mx-1" />

          {["all", "note", "journal", "snippet", "scratchpad"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all shrink-0 cursor-pointer ${
                typeFilter === type
                  ? "bg-accent text-white"
                  : "bg-bg-primary text-text-secondary border border-border-subtle hover:text-text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects / Folders Section ─────────────────────────────────────── */}
      {!activeProjectId && projects.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Folder size={14} className="text-accent" />
              Project Folders ({projects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projects.map((project) => {
              const projectNotesCount = notes.filter((n) => n.projectId === project.id).length;
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-accent hover:shadow-subtle transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center shrink-0 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <Folder size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-text-secondary">
                        {projectNotesCount} {projectNotesCount === 1 ? "note" : "notes"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Notes / Files Section ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <FileText size={14} className="text-text-primary" />
            Notes & Files ({filteredNotes.length})
          </h2>
        </div>

        {notesLoading ? (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-bg-surface border border-dashed border-border-subtle rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center text-text-secondary mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              No notes found
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4">
              {searchQuery
                ? `No notes match "${searchQuery}". Try adjusting your search query or filters.`
                : "You don't have any notes in this view yet."}
            </p>
            <button
              onClick={onCreateNote}
              className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium bg-text-primary text-bg-surface hover:bg-[#282827] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create your first note</span>
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredNotes.map((note) => {
              const noteProject = projects.find((p) => p.id === note.projectId);
              const isPolished = note.enrichedContent && note.aiStatus === "completed";
              const isProcessing = note.aiStatus === "processing";

              return (
                <div
                  key={note.id}
                  onClick={() =>
                    navigate(
                      note.projectId
                        ? `/projects/${note.projectId}/notes/${note.id}`
                        : `/notes/${note.id}`
                    )
                  }
                  className="bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-accent hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between group relative h-45"
                >
                  <div>
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
                        {note.title || "Untitled Note"}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-none ${
                          isPolished
                            ? "bg-status-completed-bg text-status-completed-text"
                            : isProcessing
                            ? "bg-status-pending-bg text-status-pending-text"
                            : "bg-status-draft-bg text-status-draft-text"
                        }`}
                      >
                        {isPolished ? (
                          <>
                            <Sparkles size={10} /> Polished
                          </>
                        ) : isProcessing ? (
                          <>
                            <Clock size={10} /> Processing
                          </>
                        ) : (
                          "Draft"
                        )}
                      </span>
                    </div>

                    {/* Content Snippet */}
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-3">
                      {cleanSnippet(note.rawContent)}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-secondary">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {noteProject ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-light text-accent text-[10px] font-medium truncate">
                          <Folder size={10} /> {noteProject.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary">
                          <BookOpen size={10} /> Quick Note
                        </span>
                      )}
                    </div>

                    <span className="shrink-0 text-[10px]">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-primary text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Created</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {filteredNotes.map((note) => {
                    const noteProject = projects.find((p) => p.id === note.projectId);
                    const isPolished = note.enrichedContent && note.aiStatus === "completed";
                    const isProcessing = note.aiStatus === "processing";

                    return (
                      <tr
                        key={note.id}
                        onClick={() =>
                          navigate(
                            note.projectId
                              ? `/projects/${note.projectId}/notes/${note.id}`
                              : `/notes/${note.id}`
                          )
                        }
                        className="hover:bg-black/2 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-text-primary">
                          <div className="flex items-center gap-2 max-w-60">
                            <FileText size={15} className="text-text-secondary shrink-0" />
                            <span className="truncate">{note.title || "Untitled Note"}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-text-secondary">
                          {noteProject ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                              <Folder size={12} /> {noteProject.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-text-secondary">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-text-secondary capitalize">
                          {note.noteType || "note"}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-none ${
                              isPolished
                                ? "bg-status-completed-bg text-status-completed-text"
                                : isProcessing
                                ? "bg-status-pending-bg text-status-pending-text"
                                : "bg-status-draft-bg text-status-draft-text"
                            }`}
                          >
                            {isPolished ? "Polished" : isProcessing ? "Processing" : "Draft"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-text-secondary text-[11px]">
                          {new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this note?")) {
                                onDeleteNote(note.id);
                              }
                            }}
                            className="p-1 text-text-secondary hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── New Project Modal ──────────────────────────────────────────────── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-2000 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 w-full max-w-md shadow-elevated animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-text-primary mb-1">
              Create New Project Folder
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Organize your technical notes and documentation into dedicated projects.
            </p>
            <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name (e.g. Next.js Migration)..."
                autoFocus
                className="w-full h-10 px-3.5 bg-bg-primary border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="h-9 px-4 rounded-lg text-xs font-medium bg-transparent text-text-primary border border-border-subtle hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg text-xs font-semibold bg-text-primary text-bg-surface hover:bg-[#282827] cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
