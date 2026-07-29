import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  RotateCcw,
  Eye,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  ArrowLeft,
  AlertTriangle,
  Folder,
  Calendar,
  Sparkles,
  HardDrive,
  CheckCircle2,
} from "lucide-react";
import {
  useTrashNotes,
  useRestoreNote,
  usePermanentDeleteNote,
  useEmptyTrash,
  type DevNote,
} from "../hooks/useNotes";
import { useProjects } from "../hooks/useProjects";
import { parseMarkdown } from "../lib/markdown";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FloatingActionBar } from "../components/navigation/FloatingActionBar";

export function RecentlyDeletedPage() {
  const navigate = useNavigate();

  // ── Queries & Mutations ──────────────────────────────────────────────────
  const { data: trashNotes = [], isLoading: isTrashLoading } = useTrashNotes();
  const { data: projects = [] } = useProjects();
  const restoreNote = useRestoreNote();
  const permanentDelete = usePermanentDeleteNote();
  const emptyTrash = useEmptyTrash();

  // ── Local State ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [previewNote, setPreviewNote] = useState<DevNote | null>(null);
  const [confirmEmptyModal, setConfirmEmptyModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Filtered Notes ───────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    return trashNotes.filter((note) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.rawContent?.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      if (typeFilter !== "all" && note.noteType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [trashNotes, searchQuery, typeFilter]);

  const cleanSnippet = (text?: string) => {
    if (!text) return "No content preview available...";
    return (
      text
        .replace(/[#*`~>-]/g, " ")
        .trim()
        .slice(0, 140) || "No content preview available..."
    );
  };

  const handleRestore = (id: string, title?: string) => {
    restoreNote.mutate(id, {
      onSuccess: () => {
        showToast(`Restored "${title || "Untitled Note"}"`);
        if (previewNote?.id === id) setPreviewNote(null);
      },
    });
  };

  const handlePermanentDelete = (id: string, title?: string) => {
    permanentDelete.mutate(id, {
      onSuccess: () => {
        showToast(`Permanently deleted "${title || "Untitled Note"}"`);
        setConfirmDeleteId(null);
        if (previewNote?.id === id) setPreviewNote(null);
      },
    });
  };

  const handleEmptyTrash = () => {
    emptyTrash.mutate(undefined, {
      onSuccess: () => {
        showToast("Trash emptied successfully");
        setConfirmEmptyModal(false);
        setPreviewNote(null);
      },
    });
  };

  const handleRestoreAll = async () => {
    if (trashNotes.length === 0) return;
    try {
      for (const note of trashNotes) {
        await restoreNote.mutateAsync(note.id);
      }
      showToast("All notes restored to workspace");
    } catch {
      showToast("Failed to restore some notes");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-bg-primary text-text-primary">
      {/* ── Global Header Navigation ───────────────────────────────────────── */}
      <header className="sticky top-0 z-1000 h-13 px-4 md:px-8 bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between select-none">
        {/* Left: Brand Mark & Breadcrumb */}
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
            <span className="text-text-muted/60">/</span>
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Trash2 size={13} />
              <span>Trash</span>
            </span>
          </div>
        </div>

        {/* Right side clean space reserved for breadcrumbs-only header */}
        <div className="shrink-0" />
      </header>

      {/* ── Main Trash Workspace Body ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-20 select-none">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-3000 bg-bg-surface border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-in fade-in slide-in-from-bottom-4 duration-200">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Page Header & Main Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-1.5 rounded-lg border border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer shrink-0"
                title="Back to Workspace"
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                  Trash
                </h1>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            {trashNotes.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleRestoreAll}
                  disabled={restoreNote.isPending}
                  className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-mono font-medium bg-bg-elevated border border-border-subtle text-text-primary hover:bg-bg-elevated/80 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw size={13} className="text-emerald-400" />
                  <span>Restore All</span>
                </button>

                <button
                  onClick={() => setConfirmEmptyModal(true)}
                  disabled={emptyTrash.isPending}
                  className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-mono font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 size={13} />
                  <span>Empty Trash</span>
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Controls Bar */}
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
                placeholder="Search deleted notes..."
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

            {/* Filter Pills & View Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Type Filter */}
              <div className="flex items-center bg-bg-primary border border-border-subtle rounded-md p-0.5 text-[11px] font-mono">
                {["all", "note", "learning", "problem", "idea", "solution"].map(
                  (t) => (
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
                  ),
                )}
              </div>

              {/* View Switcher */}
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

          {/* Main Content Area */}
          {isTrashLoading ? (
            <div className="p-16 text-center text-text-muted text-xs flex justify-center">
              <LoadingSpinner />
            </div>
          ) : trashNotes.length === 0 ? (
            /* Empty State */
            <div className="bg-bg-surface/50 border border-dashed border-border-subtle rounded-2xl p-12 flex flex-col items-center justify-center text-center my-6">
              <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted mb-4 shadow-inner">
                <Trash2 size={28} className="text-text-muted" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1">
                Trash is completely empty
              </h3>
              <p className="text-xs text-text-muted max-w-sm mb-6 font-sans leading-relaxed">
                When you delete notes from your workspace, they will be safely
                kept here until you decide to restore or permanently remove
                them.
              </p>
              <button
                onClick={() => navigate("/")}
                className="h-8 px-4 inline-flex items-center justify-center gap-2 rounded-lg text-xs font-mono font-medium bg-text-primary text-bg-surface hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft size={13} />
                <span>Return to Workspace</span>
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            /* No Filter Matches */
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 text-center text-xs text-text-muted">
              No deleted notes match your search query or filters.
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredNotes.map((note) => {
                const project = projects.find((p) => p.id === note.projectId);
                const deletedDate = note.deletedAt
                  ? new Date(note.deletedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently";

                return (
                  <div
                    key={note.id}
                    className="group bg-bg-surface border border-border-subtle hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all hover:bg-bg-elevated/40 shadow-xs relative"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-border-subtle bg-bg-primary text-text-muted">
                          {note.noteType || "NOTE"}
                        </span>
                        {note.aiStatus === "completed" && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                            <Sparkles size={10} />
                            Polished
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <Calendar size={10} />
                        {deletedDate}
                      </span>
                    </div>

                    {/* Title & Preview */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-white transition-colors truncate font-sans tracking-tight">
                        {note.title || "Untitled Note"}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-3 font-sans leading-relaxed">
                        {cleanSnippet(note.rawContent)}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2.5 font-mono text-[10px] text-text-muted">
                      <span className="truncate max-w-32 text-text-secondary flex items-center gap-1">
                        <Folder
                          size={11}
                          className="text-text-muted shrink-0"
                        />
                        <span className="truncate">
                          {project ? project.name : "Unassigned"}
                        </span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Preview Button */}
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="h-6 px-2 inline-flex items-center gap-1 rounded bg-bg-primary border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer text-[10px]"
                          title="Preview Deleted Note"
                        >
                          <Eye size={11} />
                          <span>View</span>
                        </button>

                        {/* Restore Button */}
                        <button
                          onClick={() => handleRestore(note.id, note.title)}
                          disabled={restoreNote.isPending}
                          className="h-6 px-2 inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer text-[10px]"
                          title="Restore Note"
                        >
                          <RotateCcw size={11} />
                          <span>Restore</span>
                        </button>

                        {/* Permanent Delete Button */}
                        <button
                          onClick={() => setConfirmDeleteId(note.id)}
                          className="h-6 p-1 inline-flex items-center justify-center rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Permanently Delete Note"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="border border-border-subtle rounded-xl bg-bg-surface overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-elevated/40 text-text-muted font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3.5">Title & Content Preview</th>
                    <th className="py-2.5 px-3.5 w-32">Original Project</th>
                    <th className="py-2.5 px-3.5 w-24">Type</th>
                    <th className="py-2.5 px-3.5 w-32 text-right">
                      Deleted Date
                    </th>
                    <th className="py-2.5 px-3.5 w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {filteredNotes.map((note) => {
                    const project = projects.find(
                      (p) => p.id === note.projectId,
                    );
                    const deletedDate = note.deletedAt
                      ? new Date(note.deletedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently";

                    return (
                      <tr
                        key={note.id}
                        className="group hover:bg-bg-elevated/50 transition-colors"
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
                        <td className="py-3 px-3.5 text-right font-mono text-[10px] text-amber-400/80">
                          {deletedDate}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewNote(note)}
                              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                              title="Preview Deleted Note"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleRestore(note.id, note.title)}
                              className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Restore Note"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(note.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Permanently Delete"
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
      </main>

      {/* ── Read-Only Preview Modal ─────────────────────────────────────────── */}
      {previewNote && (
        <div className="fixed inset-0 z-2000 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-strong rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/40">
              <div className="flex flex-col gap-1 overflow-hidden pr-4">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase font-semibold">
                    Deleted Note Preview
                  </span>
                  <span className="uppercase text-text-muted">
                    {previewNote.noteType || "NOTE"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-text-primary truncate font-sans">
                  {previewNote.title || "Untitled Note"}
                </h2>
              </div>

              <button
                onClick={() => setPreviewNote(null)}
                className="text-text-muted hover:text-text-primary p-1 cursor-pointer rounded-lg hover:bg-bg-elevated"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 font-sans text-sm leading-relaxed prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(
                    previewNote.rawContent ||
                      "*No content recorded for this note.*",
                  ),
                }}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-border-subtle bg-bg-elevated/40 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted">
                Read-only
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDeleteId(previewNote.id)}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Forever</span>
                </button>

                <button
                  onClick={() =>
                    handleRestore(previewNote.id, previewNote.title)
                  }
                  className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw size={13} />
                  <span>Restore Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Permanent Single Delete Modal ──────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-2100 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-red-500/30 rounded-xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-text-primary">
                  Permanently Delete Note?
                </h3>
                <span className="text-xs text-text-muted">
                  This action cannot be undone. All data will be destroyed.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="h-8 px-3 text-xs rounded-lg text-text-secondary hover:bg-bg-elevated cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetNote = trashNotes.find(
                    (n) => n.id === confirmDeleteId,
                  );
                  handlePermanentDelete(confirmDeleteId, targetNote?.title);
                }}
                disabled={permanentDelete.isPending}
                className="h-8 px-4 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer shadow-xs"
              >
                {permanentDelete.isPending
                  ? "Deleting..."
                  : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Empty Trash Modal ──────────────────────────────────────── */}
      {confirmEmptyModal && (
        <div className="fixed inset-0 z-2100 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-red-500/30 rounded-xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-text-primary">
                  Empty Trash Repository?
                </h3>
                <span className="text-xs text-text-muted">
                  Are you sure you want to permanently delete all{" "}
                  {trashNotes.length} notes in trash?
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setConfirmEmptyModal(false)}
                className="h-8 px-3 text-xs rounded-lg text-text-secondary hover:bg-bg-elevated cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmptyTrash}
                disabled={emptyTrash.isPending}
                className="h-8 px-4 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer shadow-xs"
              >
                {emptyTrash.isPending ? "Emptying..." : "Empty All Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Bar ──────────────────────────────────────────── */}
      <FloatingActionBar />
    </div>
  );
}
