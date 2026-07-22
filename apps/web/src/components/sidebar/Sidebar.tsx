import { useNavigate } from "react-router-dom";
import { LogOut, Plus } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import type { Project } from "../../hooks/useProjects";
import type { DevNote } from "../../hooks/useNotes";
import { ProjectList } from "./ProjectList";
import { NoteList } from "./NoteList";

interface SidebarProps {
  projects: Project[];
  notes: DevNote[];
  notesLoading: boolean;
  activeProjectId?: string;
  activeNoteId?: string;
  onNewNote: () => void;
  newNoteIsPending: boolean;
  onSignOut: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * The application sidebar shell.
 * Composes the brand header, "New Note" CTA, ProjectList, NoteList,
 * and user footer with sign-out.
 */
export function Sidebar({
  projects,
  notes,
  notesLoading,
  activeProjectId,
  activeNoteId,
  onNewNote,
  newNoteIsPending,
  onSignOut,
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  return (
    <aside
      className={`fixed md:sticky top-0 z-1010 md:z-auto h-screen bg-bg-surface md:bg-bg-primary border-r border-border-subtle shadow-xl md:shadow-none transition-all duration-200 ease-out w-67.5 md:w-57.5 shrink-0 flex flex-col justify-between p-5 md:py-6 md:px-4 ${
        isOpen ? "left-0" : "-left-67.5 md:left-0"
      }`}
    >
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div
          onClick={() => {
            navigate("/");
            onClose?.();
          }}
          className="mb-6 px-2 flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-text-primary text-bg-surface flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            d
          </div>
          <span className="text-sm font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors">
            thedevjournal
          </span>
        </div>

        {/* New Note CTA */}
        <div className="px-2 pb-4">
          <button
            onClick={() => {
              onNewNote();
              onClose?.();
            }}
            className="w-full h-8.5 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold bg-text-primary text-bg-surface hover:bg-[#282827] shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            disabled={newNoteIsPending}
          >
            <Plus size={15} />
            <span>New Note</span>
          </button>
        </div>

        {/* Project nav */}
        <ProjectList
          projects={projects}
          notes={notes}
          activeProjectId={activeProjectId}
          activeNoteId={activeNoteId}
          onProjectClick={onClose}
        />

        {/* Notes list */}
        <NoteList
          notes={notes}
          projects={projects}
          isLoading={notesLoading}
          activeNoteId={activeNoteId}
          activeProjectId={activeProjectId}
          onNoteClick={onClose}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border-subtle pt-4 flex flex-col gap-2">
        {session && (
          <div className="pl-2 overflow-hidden">
            <div className="text-xs font-medium truncate text-text-primary">
              {session.user.name}
            </div>
            <div className="text-[11px] text-text-secondary truncate">
              {session.user.email}
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="w-full h-8.5 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-md text-xs font-medium bg-transparent text-text-primary border border-border-subtle hover:bg-black/5 transition-all cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
