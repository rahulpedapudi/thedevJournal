import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Plus, Sun, Moon, LayoutDashboard, Trash2 } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import type { Project } from "../../hooks/useProjects";
import type { DevNote } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { ProjectList } from "./ProjectList";
import { NoteList } from "./NoteList";

interface SidebarProps {
  projects: Project[];
  notes: DevNote[];
  filteredNotes?: DevNote[];
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
 * Modern dark developer sidebar (Vercel x Linear x Obsidian).
 * Compact, high-density navigation, crisp 1px borders, monospace badges.
 */
export function Sidebar({
  projects,
  notes,
  filteredNotes,
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
  const location = useLocation();
  const { data: session } = authClient.useSession();
  const { resolvedTheme, toggleTheme } = useTheme();

  const notesForList = filteredNotes ?? notes;

  return (
    <aside
      className={`fixed md:sticky top-0 z-1010 md:z-auto h-screen bg-bg-surface border-r border-border-subtle transition-all duration-200 ease-out w-64 md:w-60 shrink-0 flex flex-col justify-between p-3.5 select-none ${
        isOpen ? "left-0 shadow-2xl" : "-left-64 md:left-0"
      }`}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand & Workspace Title Header */}
        <div className="flex items-center justify-between px-2 py-1 mb-3">
          <div
            onClick={() => {
              navigate("/");
              onClose?.();
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-5.5 h-5.5 rounded bg-text-primary text-bg-surface flex items-center justify-center font-mono font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              {">_"}
            </div>
            <span className="text-xs font-semibold tracking-tight text-text-primary group-hover:text-white transition-colors">
              thedevjournal
            </span>
          </div>

          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border-subtle text-text-muted bg-bg-elevated">
            v1.0
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 mb-3">
          {/* Dashboard Link */}
          <button
            onClick={() => {
              navigate("/");
              onClose?.();
            }}
            className={`w-full h-7.5 px-2.5 rounded text-xs font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
              !activeNoteId && !activeProjectId && location.pathname === "/"
                ? "bg-bg-elevated text-text-primary border-border-strong font-semibold"
                : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-elevated/50"
            }`}
          >
            <LayoutDashboard size={13} className="shrink-0 text-text-muted" />
            <span className="truncate">Overview</span>
          </button>

          {/* Trash / Recently Deleted Link */}
          <button
            onClick={() => {
              navigate("/trash");
              onClose?.();
            }}
            className={`w-full h-7.5 px-2.5 rounded text-xs font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
              location.pathname === "/trash"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold"
                : "bg-transparent text-text-secondary border-transparent hover:text-amber-400 hover:bg-bg-elevated/50"
            }`}
          >
            <Trash2 size={13} className="shrink-0 text-amber-400" />
            <span className="truncate">Recently Deleted</span>
          </button>
        </div>

        {/* Quick CTA Action */}
        <div className="mb-4">
          <button
            onClick={() => {
              onNewNote();
              onClose?.();
            }}
            className="w-full h-8 inline-flex items-center justify-between px-3 rounded text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
            disabled={newNoteIsPending}
          >
            <div className="flex items-center gap-1.5">
              <Plus size={14} />
              <span>New Note</span>
            </div>
            <kbd className="hidden sm:inline-block text-[9px] font-mono bg-bg-surface/20 px-1 py-0.2 rounded text-bg-surface">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Lists */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {/* Projects List */}
          <ProjectList
            projects={projects}
            notes={notes}
            activeProjectId={activeProjectId}
            onProjectClick={onClose}
          />

          {/* Notes List */}
          <NoteList
            notes={notesForList}
            projects={projects}
            isLoading={notesLoading}
            activeNoteId={activeNoteId}
            activeProjectId={activeProjectId}
            onNoteClick={onClose}
          />
        </div>
      </div>

      {/* Footer Area — Senior Engineer System Status */}
      <div className="border-t border-border-subtle pt-3 flex flex-col gap-2.5 shrink-0">
        {session && (
          <div className="flex items-center justify-between px-2 py-1 rounded bg-bg-elevated/40 border border-border-subtle/50">
            <div className="flex flex-col truncate pr-2">
              <span className="text-[11px] font-medium truncate text-text-primary leading-tight">
                {session.user.name || "Developer"}
              </span>
              <span className="text-[9px] font-mono text-text-muted truncate">
                {session.user.email}
              </span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex-1 h-7.5 inline-flex items-center justify-center gap-1.5 px-2 rounded text-[11px] font-medium bg-transparent text-text-secondary border border-border-subtle hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={12} className="text-amber-400" />
            ) : (
              <Moon size={12} className="text-slate-400" />
            )}
            <span>{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <button
            onClick={onSignOut}
            className="h-7.5 inline-flex items-center justify-center gap-1 px-2.5 rounded text-[11px] font-medium bg-transparent text-text-secondary border border-border-subtle hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
