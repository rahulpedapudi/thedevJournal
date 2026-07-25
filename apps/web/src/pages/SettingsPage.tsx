import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Sun, Moon, HardDrive, Plus, Settings as SettingsIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";
import { useTheme } from "../hooks/useTheme";
import { useCreateNote } from "../hooks/useNotes";
import { SettingsScreen } from "../components/settings/SettingsScreen";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolvedTheme, toggleTheme } = useTheme();
  const createNote = useCreateNote();

  const handleNewNote = async () => {
    const resData = await createNote.mutateAsync(undefined as any);
    const newNote = resData?.[0];
    if (newNote) {
      navigate(`/notes/${newNote.id}`);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate("/login");
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-bg-primary text-text-primary">
      {/* Global Desktop & Mobile Top Navigation Header */}
      <header className="sticky top-0 z-1000 h-13 px-4 md:px-8 bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between select-none">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-6 h-6 rounded bg-text-primary text-bg-surface flex items-center justify-center font-mono font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              {">_"}
            </div>
            <span className="text-xs font-bold tracking-tight text-text-primary group-hover:text-white transition-colors font-mono hidden sm:inline-block">
              thedevjournal
            </span>
          </div>

          <div className="h-4 w-px bg-border-subtle shrink-0" />

          {/* Breadcrumb Path Navigation */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted truncate">
            <span
              onClick={() => navigate("/")}
              className="hover:text-text-primary cursor-pointer flex items-center gap-1 shrink-0"
            >
              <HardDrive size={13} />
              <span>workspace</span>
            </span>
            <span>/</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <SettingsIcon size={12} />
              <span>settings</span>
            </span>
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleNewNote}
            disabled={createNote.isPending}
            className="h-7 px-2.5 inline-flex items-center justify-center gap-1 rounded text-xs font-mono font-medium bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            {createNote.isPending ? (
              <LoadingSpinner
                style={{
                  borderColor: "rgba(0,0,0,0.2)",
                  borderLeftColor: "#000",
                }}
              />
            ) : (
              <Plus size={13} />
            )}
            <span>New Note</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} />
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="h-7 px-2.5 inline-flex items-center gap-1 rounded text-xs font-mono font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 border border-border-subtle transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={12} />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <SettingsScreen />
      </main>
    </div>
  );
}
