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
  const { data: session } = authClient.useSession();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">thedevjournal</span>
        </div>

        {/* New Note CTA */}
        <div style={{ padding: "0 8px 16px 8px" }}>
          <button
            onClick={onNewNote}
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={newNoteIsPending}
          >
            <Plus size={14} />
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
      <div className="sidebar-footer">
        {session && (
          <div className="sidebar-user">
            <div className="sidebar-user-name">{session.user.name}</div>
            <div className="sidebar-user-email">{session.user.email}</div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="btn btn-ghost"
          style={{ width: "100%" }}
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
