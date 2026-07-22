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
    <div className="mb-6">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary pl-2 mb-2">Projects</div>
      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
        {/* All Notes */}
        <li
          onClick={() => {
            navigate(activeNoteId ? `/notes/${activeNoteId}` : "/");
            onProjectClick?.();
          }}
          className={`flex items-center justify-between py-1.5 px-2.5 text-xs font-medium cursor-pointer transition-all border-l-2 rounded-r-md ${
            !activeProjectId
              ? "text-text-primary border-l-accent bg-black/5"
              : "text-text-secondary border-l-transparent hover:text-text-primary hover:bg-black/2"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <BookOpen size={14} className="shrink-0" />
            <span className="truncate text-xs">All Notes</span>
          </div>
          <span className="text-[10px] bg-border-subtle text-text-secondary px-1.5 py-0.5 rounded">
            {notes.length}
          </span>
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
              className={`flex items-center justify-between py-1.5 px-2.5 text-xs font-medium cursor-pointer transition-all border-l-2 rounded-r-md ${
                isActive
                  ? "text-text-primary border-l-accent bg-black/5"
                  : "text-text-secondary border-l-transparent hover:text-text-primary hover:bg-black/2"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder size={14} className="shrink-0" />
                <span className="truncate text-xs">{proj.name}</span>
              </div>
              <span className="text-[10px] bg-border-subtle text-text-secondary px-1.5 py-0.5 rounded">
                {count}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Inline new-project form */}
      <div className="p-2">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              type="text"
              className="w-full h-7 text-xs px-2.5 bg-bg-surface border border-border-subtle rounded-md text-text-primary outline-none focus:border-text-primary"
              placeholder="Project name..."
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs font-medium text-text-secondary hover:text-text-primary cursor-pointer border-none bg-transparent p-0 transition-colors"
          >
            + Create Project
          </button>
        )}
      </div>
    </div>
  );
}
