export interface AgentTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<
        string,
        {
          type: string;
          enum?: string[];
          description: string;
        }
      >;
      required: string[];
    };
  };
  execute: (userId: string, args: any) => Promise<any>;
}

// export interface ToolExecutionResult {
//     noteId: string;
//     status: "created" | "updated" | "deleted" | "error";
//     error?: string;
// }
