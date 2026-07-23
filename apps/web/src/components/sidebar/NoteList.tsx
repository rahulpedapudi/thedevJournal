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

function resolveChipStyle(note: DevNote): string {
  if (note.aiStatus === "processing") return "bg-status-pending-bg text-status-pending-text";
  if (note.aiStatus === "completed" && note.enrichedContent) return "bg-status-completed-bg text-status-completed-text";
  return "bg-status-draft-bg text-status-draft-text";
}

/**
 * Renders the scrollable list of notes in the sidebar.
 * The section title reflects the active project filter (if any).
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
    <div className="mb-6 overflow-y-auto max-h-75">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary pl-2 mb-2">
        {sectionTitle}
      </div>

      {isLoading ? (
        <div className="p-2 text-text-secondary text-xs">
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div className="p-2 text-text-secondary text-xs">
          No notes found.
        </div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
          {notes.map((n) => {
            const isActive = activeNoteId === n.id;
            const chipStyle = resolveChipStyle(n);
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
                className={`flex items-center justify-between p-2 px-2.5 text-xs font-medium cursor-pointer transition-all border-l-2 rounded-r-md ${
                  isActive
                    ? "text-text-primary border-l-accent bg-text-primary/5"
                    : "text-text-secondary border-l-transparent hover:text-text-primary hover:bg-text-primary/5"
                }`}
              >
                <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                  <span
                    className={`truncate text-xs ${
                      isActive ? "font-medium text-text-primary" : "font-normal text-text-secondary"
                    }`}
                  >
                    {n.title || "Untitled Note"}
                  </span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] text-text-secondary opacity-70">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium leading-none ${chipStyle}`}
                    >
                      {n.aiStatus === "completed" && n.enrichedContent
                        ? "polished"
                        : n.aiStatus}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
