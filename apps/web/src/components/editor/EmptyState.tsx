import { Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateNote: () => void;
}

/**
 * Shown in the main content area when no note is selected.
 */
export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-16 px-8 text-text-secondary border border-dashed border-border-subtle rounded-lg bg-bg-surface">
      <div className="text-3xl font-mono text-border-subtle mb-4 select-none">
        :::
      </div>
      <h3 className="text-base font-medium text-text-primary mb-2 mt-0">
        No note selected
      </h3>
      <p className="text-xs max-w-70 mb-4 leading-relaxed">
        Choose an existing scratchpad entry from the sidebar, or create a new
        note to begin.
      </p>
      <button
        onClick={onCreateNote}
        className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-medium bg-transparent text-text-primary border border-border-subtle hover:bg-text-primary/5 transition-all cursor-pointer"
      >
        <Plus size={14} />
        <span>Create a note</span>
      </button>
    </div>
  );
}
