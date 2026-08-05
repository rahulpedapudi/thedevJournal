import type { AgentTool } from "./types";
import { createUserDevNote } from "../../devnotes/devnote.service";

export const createNote: AgentTool = {
  type: "function",
  function: {
    name: "create_note",
    description: `Create a new note for the user. Use this when the user explicitly
    asks to create, save, or add a note. Always confirm what you created.`,
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the Note",
        },
        rawContent: {
          type: "string",
          description:
            "Actual content of the note. Supports markdown, always output in markdown.",
        },

        projectId: {
          type: "string",
          description:
            "Project ID of the note, optional. This is a uuid,so dont add words if you use it, if you dont have any Project id dont include it.",
        },

        noteType: {
          type: "string",
          enum: [
            "learning",
            "problem",
            "solution",
            "idea",
            "decision",
            "experiment",
            "question",
            "progress",
            "note",
          ],
          description: "Type of the note, optional",
        },
      },
      required: ["title", "rawContent"],
    },
  },
  execute: async (userId, args) => {
    const { title, rawContent, projectId, noteType } = args;
    const note = await createUserDevNote(
      userId,
      title,
      rawContent,
      projectId ?? null,
      noteType ?? "note",
    );
    return note;
  },
};
