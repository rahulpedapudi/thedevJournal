import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, LogOut, Home, Bot } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useCreateNote } from "../../hooks/useNotes";
import { LoadingSpinner } from "../LoadingSpinner";

interface FloatingActionBarProps {
  onNewNote?: () => void;
  isCreatingNote?: boolean;
  onPolishNote?: () => void;
  isPolishing?: boolean;
  activeNoteId?: string;
  onOpenSearch?: () => void;
  isAgentOpen?: boolean;
  onToggleAgent?: () => void;
}

export function FloatingActionBar({
  onNewNote,
  isCreatingNote = false,
  isAgentOpen = false,
  onToggleAgent,
}: FloatingActionBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNote();

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCreateNote = async () => {
    if (onNewNote) {
      onNewNote();
    } else {
      const res = await createNoteMutation.mutateAsync(undefined as any);
      const created = Array.isArray(res) ? res[0] : res;
      if (created?.id) {
        navigate(`/notes/${created.id}`);
      }
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate("/login");
  };

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut handlers for convenience
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleCreateNote();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === ",") {
        e.preventDefault();
        navigate("/settings");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  const isSettingsActive = location.pathname === "/settings";
  const isPendingNote = isCreatingNote || createNoteMutation.isPending;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-1100 flex flex-col items-center select-none pointer-events-auto ${isAgentOpen ? "hidden lg:flex" : ""}`}
    >
      {/* ── Main Floating Dock Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface/85 backdrop-blur-xl border  dark:border-white/10 border-black/10 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all hover:border-white/20">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 relative group border-none bg-transparent"
          title="Home"
        >
          <Home size={17} />
        </button>
        {/* Agent Chat Button */}
        <button
          type="button"
          onClick={() => {
            if (onToggleAgent) {
              onToggleAgent();
            } else {
              navigate("/?chat=1");
            }
          }}
          className={`p-2 rounded-full transition-all cursor-pointer relative group border-none ${
            isAgentOpen
              ? "bg-accent/20 text-accent"
              : "text-text-muted hover:text-text-primary hover:bg-white/10 active:scale-95 bg-transparent"
          }`}
          title="Chat with Agent"
        >
          <Bot
            size={17}
            className="group-hover:scale-110 transition-transform"
          />
        </button>
        
        
        {/* 1. New Note Action Button */}
        <button
          type="button"
          onClick={handleCreateNote}
          disabled={isPendingNote}
          className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 relative group border-none bg-transparent"
          title="New Note"
        >
          {isPendingNote ? (
            <LoadingSpinner style={{ width: 16, height: 16 }} />
          ) : (
            <Plus
              size={17}
              className="group-hover:scale-110 transition-transform "
            />
          )}
        </button>
        {/* 2. Trash Button */}
        <button
          type="button"
          onClick={() => navigate("/trash")}
          className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 relative group border-none bg-transparent"
          title="Trash"
        >
          <Trash2
            size={17}
            className="group-hover:scale-110 transition-transform"
          />
          {/* {trashNotes.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-amber-500 text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs">
              {trashNotes.length}
            </span>
          )} */}
        </button>
        {/* 3. Settings Button */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className={`p-2 rounded-full transition-all cursor-pointer relative group border-none ${
            isSettingsActive
              ? "bg-purple-500/20 text-purple-400"
              : "text-text-muted hover:text-text-primary hover:bg-white/10 active:scale-95 bg-transparent"
          }`}
          title="Settings"
        >
          <Settings
            size={17}
            className="group-hover:rotate-45 transition-transform duration-300"
          />
        </button>
        {/* Divider */}
        <div className="h-4 w-px bg-border-subtle/80 mx-1 my-auto shrink-0" />
        {/* 4. Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="p-2 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/15 active:scale-95 transition-all cursor-pointer group border-none bg-transparent"
          title="Sign Out"
        >
          <LogOut
            size={17}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
