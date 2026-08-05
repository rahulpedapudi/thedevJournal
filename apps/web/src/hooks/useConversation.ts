import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export type ConversationResponse = {
  id: string;
  userId: string;
  title: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessagesResponse = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
};

export function useConversations() {
  return useQuery<ConversationResponse[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const data = await apiFetch("/api/conversation").then((res) => res.data);
      return data as ConversationResponse[];
    },
  });
}

export function useCreateConversation(noteId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      // if noteId is provided then its a note specific chat, else global conversation
      apiFetch(
        noteId ? `/api/conversation?noteId=${noteId}` : "/api/conversation",
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useConversationMessages(id: string | undefined) {
  return useQuery({
    queryKey: ["conversation-messages", id],
    queryFn: async () => {
      const data = await apiFetch(`/api/conversation/${id}/messages`).then(
        (res) => res.data,
      );
      return data;
    },
    enabled: !!id,
  });
}
