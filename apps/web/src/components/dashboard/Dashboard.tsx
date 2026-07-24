import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  FolderPlus,
  Plus,
  Sparkles,
  Trash2,
  X,
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

/**
 * Custom glossy macOS-style blue folder graphic SVG
 */
function MacOSFolderIcon({ className = "w-16 h-14" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="macFolderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id="macFolderBackGrad"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient
          id="macFolderHighlight"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Back tab */}
      <path
        d="M 10 16 C 10 11.58 13.58 8 18 8 L 38 8 C 42 8 45 11 47 14 L 51 20 L 82 20 C 86.42 20 90 23.58 90 28 L 90 68 C 90 72.42 86.42 76 82 76 L 18 76 C 13.58 76 10 72.42 10 68 Z"
        fill="url(#macFolderBackGrad)"
      />
      {/* Front flap */}
      <path
        d="M 6 26 C 6 21.58 9.58 18 14 18 L 86 18 C 90.42 18 94 21.58 94 26 L 94 68 C 94 72.42 90.42 76 86 76 L 14 76 C 9.58 76 6 72.42 6 68 Z"
        fill="url(#macFolderGrad)"
      />
      {/* Glossy top edge */}
      <path
        d="M 6 26 C 6 21.58 9.58 18 14 18 L 86 18 C 90.42 18 94 21.58 94 26 L 94 36 L 6 36 Z"
        fill="url(#macFolderHighlight)"
      />
    </svg>
  );
}

export function DriveDashboard({
  notes,
  projects,
  notesLoading,
  activeProjectId,
  onCreateNote,
  onCreateProject,
  onDeleteNote,
  onPolishNote,
  isCreatingNote,
}: DriveDashboardProps) {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Project Modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId],
  );

  // ── Filtering Logic ──────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.rawContent?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      if (activeProjectId && note.projectId !== activeProjectId) {
        return false;
      }

      if (statusFilter !== "all") {
        if (
          statusFilter === "polished" &&
          (!note.enrichedContent || note.aiStatus !== "completed")
        ) {
          return false;
        }
        if (
          statusFilter === "draft" &&
          (note.enrichedContent || note.aiStatus === "processing")
        ) {
          return false;
        }
        if (statusFilter === "processing" && note.aiStatus !== "processing") {
          return false;
        }
      }

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
    if (!text) return "No content written yet...";
    return (
      text
        .replace(/[#*`~>-]/g, " ")
        .trim()
        .slice(0, 140) || "No content written yet..."
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20 select-none">
      {/* ── Top Header Title & Actions ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
              Workspace Overview
            </span>
            {activeProject && (
              <span className="text-xs text-text-secondary font-mono">
                / {activeProject.name}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {activeProject ? activeProject.name : "All Journal Notes"}
          </h1>
        </div>
      </div>

      {/* ── macOS-Style Project Folders Grid ─────────────────────────────────── */}
      {!activeProjectId && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <span>Projects & Directories</span>
              <span className="px-1.5 py-0.2 rounded bg-bg-elevated border border-border-subtle text-[10px] text-text-primary">
                {projects.length}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {projects.map((proj) => {
              const noteCount = notes.filter(
                (n) => n.projectId === proj.id,
              ).length;
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="group bg-bg-surface border border-border-subtle hover:border-border-strong rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-bg-elevated/70 shadow-xs hover:shadow-lg"
                >
                  <div className="my-2 group-hover:scale-105 transition-transform">
                    <MacOSFolderIcon className="w-16 h-13" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-white truncate max-w-full font-sans">
                    {proj.name}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted mt-0.5">
                    {noteCount} {noteCount === 1 ? "Note" : "Notes"}
                  </span>
                </div>
              );
            })}

            {/* Quick Add Project Folder Card */}
            <div
              onClick={() => setShowNewProjectModal(true)}
              className="bg-bg-surface/50 border border-dashed border-border-subtle hover:border-border-strong rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-bg-elevated/40"
            >
              <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted my-2">
                <Plus size={18} />
              </div>
              <span className="text-xs font-medium text-text-muted">
                New Project
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls (Linear Style) ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-bg-surface border border-border-subtle rounded-xl p-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dev notes..."
            className="w-full h-8 pl-8 pr-7 text-xs bg-bg-primary border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Note Type Selector */}
          <div className="flex items-center bg-bg-primary border border-border-subtle rounded-md p-0.5 text-[11px] font-mono">
            {["all", "note", "learning", "problem", "todo"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                  typeFilter === t
                    ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* AI Status Selector */}
          <div className="flex items-center bg-bg-primary border border-border-subtle rounded-md p-0.5 text-[11px] font-mono">
            {["all", "draft", "polished"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-bg-primary border border-border-subtle rounded-md p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-6 px-2 inline-flex items-center gap-1 rounded text-[11px] transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`h-6 px-2 inline-flex items-center gap-1 rounded text-[11px] transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-bg-elevated text-text-primary font-semibold border border-border-strong"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Table View"
            >
              <ListIcon size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Notes View (Reference Image 3 Card Style) ─────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">
            {activeProjectId
              ? `${activeProject?.name} Notes`
              : "Dev Journal Notes"}
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "Note" : "Notes"}
          </span>
        </div>

        {notesLoading ? (
          <div className="p-12 text-center text-text-muted text-xs flex justify-center">
            <LoadingSpinner />
          </div>
        ) : viewMode === "grid" ? (
          /* Linear / Vercel Note Cards (With ALWAYS STARTING New Note Card) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* ── ALWAYS PLACED AT THE STARTING OF THE NOTES GRID ─────────────── */}
            <div
              onClick={onCreateNote}
              className="group bg-bg-surface/40 border border-dashed border-border-subtle hover:border-border-strong rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-bg-elevated/70 shadow-xs min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted mb-2 group-hover:scale-105 transition-transform">
                {isCreatingNote ? (
                  <LoadingSpinner
                    style={{
                      borderColor: "rgba(0,0,0,0.2)",
                      borderLeftColor: "#000",
                    }}
                  />
                ) : (
                  <Plus size={18} />
                )}
              </div>
              <span className="text-xs font-semibold text-text-primary group-hover:text-white font-sans">
                New Dev Note
              </span>
              <span className="text-[10px] font-mono text-text-muted mt-0.5">
                Click to start taking notes
              </span>
            </div>

            {filteredNotes.map((note) => {
              const project = projects.find((p) => p.id === note.projectId);
              const isPolished =
                note.aiStatus === "completed" && note.enrichedContent;
              const isProcessing = note.aiStatus === "processing";
              const dateYear = new Date(note.createdAt).getFullYear();
              const formattedDate = new Date(
                note.updatedAt || note.createdAt,
              ).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={note.id}
                  onClick={() =>
                    navigate(
                      activeProjectId
                        ? `/projects/${activeProjectId}/notes/${note.id}`
                        : `/notes/${note.id}`,
                    )
                  }
                  className="group bg-bg-surface border border-border-subtle hover:border-border-strong rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:bg-bg-elevated/50 shadow-xs"
                >
                  {/* Top Bar: Micro Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-border-subtle bg-bg-primary text-text-muted">
                        {dateYear}
                      </span>
                      <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-border-subtle bg-bg-primary text-text-muted">
                        {note.noteType || "NOTE"}
                      </span>
                    </div>

                    {/* AI Status Badge */}
                    <div className="flex items-center gap-1">
                      {isPolished ? (
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <Sparkles size={10} />
                          Polished
                        </span>
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isProcessing
                              ? "bg-amber-400 animate-pulse"
                              : "bg-zinc-700"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Card Title & Excerpt */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-white transition-colors truncate font-sans tracking-tight">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-3 font-sans leading-relaxed">
                      {cleanSnippet(note.rawContent)}
                    </p>
                  </div>

                  {/* Card Footer: Project Tag & Date */}
                  <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2.5 font-mono text-[10px] text-text-muted">
                    <span className="truncate max-w-[140px] text-text-secondary">
                      {project ? project.name : "Unassigned"}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <span>{formattedDate}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dense Table View */
          <div className="border border-border-subtle rounded-xl bg-bg-surface overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/40 text-text-muted font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3.5">Title & Content Preview</th>
                  <th className="py-2.5 px-3.5 w-36">Project</th>
                  <th className="py-2.5 px-3.5 w-24">Type</th>
                  <th className="py-2.5 px-3.5 w-24 text-right">Modified</th>
                  <th className="py-2.5 px-3.5 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {filteredNotes.map((note) => {
                  const project = projects.find((p) => p.id === note.projectId);
                  const isPolished =
                    note.aiStatus === "completed" && note.enrichedContent;

                  return (
                    <tr
                      key={note.id}
                      onClick={() =>
                        navigate(
                          activeProjectId
                            ? `/projects/${activeProjectId}/notes/${note.id}`
                            : `/notes/${note.id}`,
                        )
                      }
                      className="group hover:bg-bg-elevated/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-text-primary group-hover:text-white transition-colors truncate font-sans">
                            {note.title || "Untitled Note"}
                          </span>
                          <span className="text-[11px] text-text-muted line-clamp-1 font-sans">
                            {cleanSnippet(note.rawContent)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-text-secondary truncate">
                        {project ? project.name : "—"}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border border-border-subtle bg-bg-primary text-text-muted">
                          {note.noteType || "note"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-[10px] text-text-muted">
                        {new Date(
                          note.updatedAt || note.createdAt,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td
                        className="py-3 px-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {!isPolished && (
                            <button
                              onClick={() => onPolishNote(note.id)}
                              className="p-1 rounded text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Polish with AI"
                            >
                              <Sparkles size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Note"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── New Project Dialog Modal ────────────────────────────────────────── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-2000 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-strong rounded-xl w-full max-w-sm p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-text-primary">
                Create Project
              </h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form
              onSubmit={handleCreateProjectSubmit}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name (e.g. Frontend Architecture)"
                className="w-full h-8 px-3 text-xs bg-bg-primary border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong transition-colors font-sans"
                autoFocus
                required
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="h-7 px-3 text-xs rounded text-text-secondary hover:bg-bg-elevated cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-7 px-3 text-xs font-medium rounded bg-text-primary text-bg-surface hover:opacity-90 cursor-pointer"
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
