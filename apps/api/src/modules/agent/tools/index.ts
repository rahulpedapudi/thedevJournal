import { createNote } from "./createNote";
import type { AgentTool } from "./types";

export const availableTools: AgentTool[] = [createNote];

export async function executeTool(name: string, args: any, userId: string) {
  const tool = availableTools.find((t) => t.function.name === name);

  if (!tool) throw new Error(`Unknown Tool: ${name}`);

  return tool.execute(userId, args);
}
