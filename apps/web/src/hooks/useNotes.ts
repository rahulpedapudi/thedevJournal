import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DevNote = {
  id: string;
  title: string;
  revision: number;
  rawContent: string;
  enrichedContent: string | null;
  noteType: string;
  projectId: string | null;
  conversationId: string | null;
  aiStatus: string;
  isDeleted: boolean;
  deletedAt: string | null;
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

export type ApplyPatchPayload = {
  patchStr: string;
  baseRevision: number;
};

export type SearchResultNote = DevNote & {
  rank?: number;
  headline?: string;
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
      }).then((res) => (Array.isArray(res.data) ? res.data[0] : res.data)),
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

export function useDiffPatch(noteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyPatchPayload) =>
      apiFetch(`/api/devnote/${noteId}/patch`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
  });
}

/** Fetch all soft-deleted trash notes for the current user. */
export function useTrashNotes() {
  return useQuery<DevNote[]>({
    queryKey: ["notes", "trash"],
    queryFn: () => apiFetch("/api/devnote/trash").then((res) => res.data),
  });
}

/** Delete a note by ID (soft delete). */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
    },
  });
}

/** Restore a soft-deleted note from trash. */
export function useRestoreNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isDeleted: false, deletedAt: null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
    },
  });
}

/** Permanently delete a note by ID. */
export function usePermanentDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}?permanent=true`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
    },
  });
}

/** Empty all trash notes. */
export function useEmptyTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/devnote/trash", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
    },
  });
}

/** Trigger the AI "polish" pipeline for a note. */
export function usePolishNote(noteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/devnote/${id}/polish`, { method: "POST" }).then(
        (res) => res.data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
  });
}

/** Search notes using full-text search backend endpoint /api/search */
export function useSearchNotes(
  query: string,
  options?: { projectId?: string; status?: string; limit?: number },
) {
  const trimmed = query.trim();
  return useQuery<SearchResultNote[]>({
    queryKey: [
      "search",
      trimmed,
      options?.projectId,
      options?.status,
      options?.limit,
    ],
    queryFn: async () => {
      if (!trimmed || trimmed.length < 2) return [];
      const params = new URLSearchParams({ q: trimmed });
      if (options?.projectId) params.append("projectId", options.projectId);
      if (options?.status) params.append("status", options.status);
      if (options?.limit) params.append("limit", options.limit.toString());

      const res = await apiFetch(`/api/search?${params.toString()}`);
      return res.results?.data ?? res.data ?? [];
    },
    enabled: trimmed.length >= 2,
  });
}
