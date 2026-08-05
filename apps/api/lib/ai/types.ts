export type LLMMessage = {
  role: "system" | "user" | "assistant" | "tool";
  tool_call_id?: string;
  content: string;

  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
};


export type LLMResponse = {
  msg: LLMMessage;
  finish_reason: string;
};

export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  tool_call_id?: string;
  content: string;
};

export interface AIProvider {
  complete(
    messages: LLMMessage[],
    tools?: any,
    model?: string,
  ): Promise<LLMResponse>;
  stream(messages: LLMMessage[], model?: string): AsyncGenerator<any>;
}

