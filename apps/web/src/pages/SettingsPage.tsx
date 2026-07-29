import { useNavigate } from "react-router-dom";
import { HardDrive, Settings as SettingsIcon } from "lucide-react";
import { useCreateNote } from "../hooks/useNotes";
import { SettingsScreen } from "../components/settings/SettingsScreen";
import { FloatingActionBar } from "../components/navigation/FloatingActionBar";

export function SettingsPage() {
  const navigate = useNavigate();
  const createNote = useCreateNote();

  const handleNewNote = async () => {
    const resData = await createNote.mutateAsync(undefined as any);
    const created = Array.isArray(resData) ? resData[0] : resData;
    const newNote = created as { id: string } | null | undefined;
    if (newNote?.id) {
      navigate(`/notes/${newNote.id}`);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-bg-primary text-text-primary">
      {/* Global Desktop & Mobile Top Navigation Header */}
      <header className="sticky top-0 z-1000 h-13 px-4 md:px-8 bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between select-none">
        {/* Left: Brand Mark & Breadcrumbs */}
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

        {/* Right: Clean space for breadcrumbs-only header */}
        <div className="shrink-0" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
        <SettingsScreen />
      </main>

      {/* Floating Action Bar */}
      <FloatingActionBar
        onNewNote={handleNewNote}
        isCreatingNote={createNote.isPending}
      />
    </div>
  );
}
