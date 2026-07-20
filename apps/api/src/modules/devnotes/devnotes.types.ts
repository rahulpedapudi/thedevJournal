export type DevNoteParams = {
  id: string;
};

export type CreateDevNoteBody = {
  title: string;
  rawContent: string;
};

export type PatchNoteBody = {
  projectId?: string | null;
  title?: string;
  rawContent?: string;
  noteType?:
    | "learning"
    | "problem"
    | "solution"
    | "idea"
    | "decision"
    | "experiment"
    | "question"
    | "progress"
    | "note";
  aiStatus?: "pending" | "processing" | "completed" | "failed";
  enrichedContent?: string | null;
};

