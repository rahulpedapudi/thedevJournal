import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DevNote = {
  id: string;
  title: string;
  rawContent: string;
  enrichedContent: string | null;
  noteType: string;
  projectId: string | null;
  aiStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateNotePayload = {
  title?: string;
  rawContent?: string;
  noteType?: string;
  projectId?: string | null;
  aiStatus?: string;
  enrichedContent?: string | null;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all notes for the current user. */
export function useNotes() {
  return useQuery<DevNote[]>({
    queryKey: ["notes"],
    queryFn: () => apiFetch("/api/devnote").then((res) => res.data),
  });
}

/** Fetch a single note by ID. Only runs when `noteId` is defined. */
export function useActiveNote(noteId: string | undefined) {
  return useQuery<DevNote>({
    queryKey: ["note", noteId],
    queryFn: () => apiFetch(`/api/devnote/${noteId}`).then((res) => res.data),
    enabled: !!noteId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a blank note, returning the server-assigned ID for navigation. */
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/api/devnote", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled Note", rawContent: "" }),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/** Patch a note's fields. Invalidates both the list and the individual cache entry. */
export function useUpdateNote(noteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNotePayload) =>
      apiFetch(`/api/devnote/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
  });
}

/** Delete a note by ID. */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/** Trigger the AI "polish" pipeline for a note. */
export function usePolishNote(noteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}/polish`, { method: "POST" }).then(
        (res) => res.data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
  });
}
