export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface AIProvider {
  complete(messages: GroqMessage[]): Promise<string>;
  stream(messages: GroqMessage[]): AsyncGenerator<string>;
}
