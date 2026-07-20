import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Folder } from "lucide-react";
import { useCreateProject } from "../../hooks/useProjects";
import type { Project } from "../../hooks/useProjects";
import type { DevNote } from "../../hooks/useNotes";

interface ProjectListProps {
  projects: Project[];
  notes: DevNote[];
  activeProjectId?: string;
  activeNoteId?: string;
  onProjectClick?: () => void;
}

/**
 * Renders the "Projects" section of the sidebar:
 *  - "All Notes" entry (no filter)
 *  - One entry per project with note count badge
 *  - Inline "Create Project" form
 */
export function ProjectList({
  projects,
  notes,
  activeProjectId,
  activeNoteId,
  onProjectClick,
}: ProjectListProps) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createProject.mutate(newName.trim(), {
        onSuccess: () => {
          setIsCreating(false);
          setNewName("");
        },
      });
    }
  };

  return (
    <div className="sidebar-nav-group">
      <div className="sidebar-section-title">Projects</div>
      <ul className="sidebar-nav-list">
        {/* All Notes */}
        <li
          onClick={() => {
            navigate(activeNoteId ? `/notes/${activeNoteId}` : "/");
            onProjectClick?.();
          }}
          className={`sidebar-link ${!activeProjectId ? "active" : ""}`}>
          <div className="flex-align-center">
            <BookOpen size={14} />
            <span className="sidebar-link-text">All Notes</span>
          </div>
          <span className="sidebar-link-badge">{notes.length}</span>
        </li>

        {/* Per-project entries */}
        {projects.map((proj) => {
          const count = notes.filter((n) => n.projectId === proj.id).length;
          const isActive = activeProjectId === proj.id;
          return (
            <li
              key={proj.id}
              onClick={() => {
                navigate(
                  isActive
                    ? "/"
                    : `/projects/${proj.id}${activeNoteId ? `/notes/${activeNoteId}` : ""}`,
                );
                onProjectClick?.();
              }}
              className={`sidebar-link ${isActive ? "active" : ""}`}>
              <div className="flex-align-center">
                <Folder size={14} />
                <span className="sidebar-link-text">{proj.name}</span>
              </div>
              <span className="sidebar-link-badge">{count}</span>
            </li>
          );
        })}
      </ul>

      {/* Inline new-project form */}
      <div style={{ padding: "8px" }}>
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex-align-center">
            <input
              type="text"
              className="text-input"
              placeholder="Project name..."
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ height: "26px", fontSize: "12px", padding: "4px 8px" }}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="toggle-tab ui-meta"
            style={{ padding: 0, color: "var(--text-secondary)" }}>
            + Create Project
          </button>
        )}
      </div>
    </div>
  );
}
