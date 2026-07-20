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

/** Returns the CSS class for the AI-status chip. */
function resolveChipClass(note: DevNote): string {
  if (note.aiStatus === "processing") return "pending";
  if (note.aiStatus === "completed" && note.enrichedContent) return "completed";
  return "draft";
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
    <div
      className="sidebar-nav-group"
      style={{ overflowY: "auto", maxHeight: "300px" }}
    >
      <div className="sidebar-section-title">{sectionTitle}</div>

      {isLoading ? (
        <div style={{ padding: "8px", color: "var(--text-secondary)" }}>
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div
          style={{
            padding: "8px",
            color: "var(--text-secondary)",
            fontSize: "12px",
          }}
        >
          No notes found.
        </div>
      ) : (
        <ul className="sidebar-nav-list">
          {notes.map((n) => {
            const isActive = activeNoteId === n.id;
            const chipClass = resolveChipClass(n);
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
                className={`sidebar-link ${isActive ? "active" : ""}`}
                style={{ padding: "8px 10px" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <span
                    className="sidebar-link-text"
                    style={{
                      fontWeight: isActive ? 500 : 400,
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {n.title || "Untitled Note"}
                  </span>
                  <div className="flex-between">
                    <span style={{ fontSize: "10px", color: "#888" }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`status-chip ${chipClass}`}
                      style={{ fontSize: "9px", padding: "1px 5px" }}
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
