import { Plus, Terminal } from "lucide-react";

interface EmptyStateProps {
  onCreateNote: () => void;
}

/**
 * Modern Raycast-inspired Empty State.
 */
export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 px-6 text-text-muted border border-dashed border-border-subtle rounded-md bg-bg-surface select-none my-auto">
      <div className="w-10 h-10 rounded border border-border-subtle bg-bg-elevated flex items-center justify-center text-text-primary mb-3 shadow-xs">
        <Terminal size={18} />
      </div>

      <h3 className="text-sm font-semibold text-text-primary mb-1">
        No active note selected
      </h3>

      <p className="text-xs max-w-xs mb-5 text-text-muted leading-relaxed font-sans">
        Select a dev note from the navigation sidebar or create a new journal entry.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={onCreateNote}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>New Dev Note</span>
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-8 pt-4 border-t border-border-subtle/50 flex items-center gap-4 text-[10px] font-mono text-text-muted">
        <span><kbd className="bg-bg-elevated border border-border-subtle px-1 rounded">⌘N</kbd> New Note</span>
        <span><kbd className="bg-bg-elevated border border-border-subtle px-1 rounded">/</kbd> Commands</span>
      </div>
    </div>
  );
}
