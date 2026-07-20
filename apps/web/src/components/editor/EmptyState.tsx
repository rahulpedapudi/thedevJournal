import { Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateNote: () => void;
}

/**
 * Shown in the main content area when no note is selected.
 */
export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div
        style={{
          fontSize: "32px",
          fontFamily: "var(--font-mono)",
          color: "var(--border-subtle)",
          marginBottom: "16px",
        }}
      >
        :::
      </div>
      <h3>No note selected</h3>
      <p>
        Choose an existing scratchpad entry from the sidebar, or create a new
        note to begin.
      </p>
      <button onClick={onCreateNote} className="btn btn-ghost">
        <Plus size={14} />
        <span>Create a note</span>
      </button>
    </div>
  );
}
