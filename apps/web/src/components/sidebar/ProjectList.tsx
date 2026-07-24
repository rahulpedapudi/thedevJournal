import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FolderPlus, Layers, Check } from "lucide-react";
import { useCreateProject } from "../../hooks/useProjects";
import type { Project } from "../../hooks/useProjects";
import type { DevNote } from "../../hooks/useNotes";

interface ProjectListProps {
  projects: Project[];
  notes: DevNote[];
  activeProjectId?: string;
  onProjectClick?: () => void;
}

/**
 * Modern dense project list navigation.
 */
export function ProjectList({
  projects,
  notes,
  activeProjectId,
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
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
          Projects
        </span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors cursor-pointer"
          title="Create Project"
        >
          <FolderPlus size={12} />
        </button>
      </div>

      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
        {/* All Notes Entry */}
        <li
          onClick={() => {
            navigate("/");
            onProjectClick?.();
          }}
          className={`group flex items-center justify-between h-7 px-2 text-xs font-medium cursor-pointer rounded border transition-all ${
            !activeProjectId
              ? "bg-bg-elevated text-text-primary border-border-strong font-semibold"
              : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-elevated/50"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Layers size={13} className="shrink-0 text-text-muted group-hover:text-text-primary transition-colors" />
            <span className="truncate text-xs">All Projects</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.2 rounded bg-bg-primary border border-border-subtle">
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
                navigate(`/projects/${proj.id}`);
                onProjectClick?.();
              }}
              className={`group flex items-center justify-between h-7 px-2 text-xs font-medium cursor-pointer rounded border transition-all ${
                isActive
                  ? "bg-bg-elevated text-text-primary border-border-strong font-semibold"
                  : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-elevated/50"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder size={13} className={`shrink-0 ${isActive ? "text-blue-400" : "text-text-muted group-hover:text-text-primary"}`} />
                <span className="truncate text-xs">{proj.name}</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.2 rounded bg-bg-primary border border-border-subtle">
                {count}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Inline inline new-project form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="mt-1.5 px-1">
          <div className="flex items-center gap-1 bg-bg-elevated border border-border-strong rounded p-1">
            <input
              type="text"
              className="w-full h-6 text-xs px-1.5 bg-transparent text-text-primary placeholder:text-text-muted outline-none font-sans"
              placeholder="Project name..."
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              className="h-5 px-1.5 bg-text-primary text-bg-surface text-[10px] font-medium rounded hover:opacity-90 cursor-pointer shrink-0"
            >
              <Check size={11} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
