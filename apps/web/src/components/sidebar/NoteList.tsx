import { useNavigate } from "react-router-dom";
import type { DevNote } from "../../hooks/useNotes";
import type { Project } from "../../hooks/useProjects";
import { LoadingSpinner } from "../LoadingSpinner";

interface NoteListProps {
  notes: DevNote[];
  projects: Project[];
  isLoading: boolean;
  activeNoteId?: string;
  activeProjectId?: string;
  onNoteClick?: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Senior engineer high-density notes navigation list.
 */
export function NoteList({
  notes,
  projects,
  isLoading,
  activeNoteId,
  activeProjectId,
  onNoteClick,
}: NoteListProps) {
  const navigate = useNavigate();

  const sectionTitle = activeProjectId
    ? `${projects.find((p) => p.id === activeProjectId)?.name ?? "Project"} Notes`
    : "Recent Notes";

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
          {sectionTitle}
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          {notes.length}
        </span>
      </div>

      {isLoading ? (
        <div className="p-3 text-text-muted text-xs flex justify-center">
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div className="px-2 py-3 text-text-muted text-xs font-mono border border-dashed border-border-subtle rounded text-center">
          no notes found
        </div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
          {notes.map((n) => {
            const isActive = activeNoteId === n.id;
            const isPolished = n.aiStatus === "completed" && n.enrichedContent;
            const isProcessing = n.aiStatus === "processing";

            return (
              <li
                key={n.id}
                onClick={() => {
                  navigate(
                    activeProjectId
                      ? `/projects/${activeProjectId}/notes/${n.id}`
                      : `/notes/${n.id}`
                  );
                  onNoteClick?.();
                }}
                className={`group flex flex-col p-2 rounded border transition-all cursor-pointer ${
                  isActive
                    ? "bg-bg-elevated text-text-primary border-border-strong font-medium"
                    : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-elevated/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full mb-1">
                  <span
                    className={`truncate text-xs tracking-tight ${
                      isActive ? "font-semibold text-text-primary" : "font-normal text-text-primary/90"
                    }`}
                  >
                    {n.title || "Untitled Note"}
                  </span>
                  
                  {/* AI Status Micro Indicator Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isPolished
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                        : isProcessing
                        ? "bg-amber-400 animate-pulse"
                        : "bg-zinc-700"
                    }`}
                    title={isPolished ? "AI Polished" : isProcessing ? "AI Processing" : "Draft"}
                  />
                </div>

                <div className="flex items-center justify-between w-full font-mono text-[9px] text-text-muted">
                  <span className="uppercase px-1 py-0.2 rounded bg-bg-primary border border-border-subtle text-[9px]">
                    {n.noteType || "note"}
                  </span>
                  <span>{formatRelativeTime(n.updatedAt || n.createdAt)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
