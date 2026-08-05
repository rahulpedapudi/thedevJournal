import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  PanelRightClose,
  FileText,
  ListCheck,
  Code2,
  Wand2,
} from "lucide-react";
import type { DevNote } from "../../hooks/useNotes";
import { apiFetch } from "../../lib/api";
import { parseMarkdown } from "../../lib/markdown";
import {
  useConversationMessages,
  useConversations,
} from "../../hooks/useConversation";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  chips?: string[];
}

interface AgentChatPanelProps {
  activeNote?: DevNote | null;
  noteTitle?: string;
  noteContent?: string;
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export function AgentChatPanel({
  activeNote,
  noteTitle = "",
  isOpen,
  onClose,
  projectId,
}: AgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(
    activeNote?.conversationId || undefined,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isNoteMode = Boolean(activeNote);

  const { data: conversations = [], isLoading: convLoading } =
    useConversations();

  const { data: conversationMessages = [], isLoading: messagesLoading } =
    useConversationMessages(conversationId);

  // Initialize conversation with contextual welcome message if empty
  useEffect(() => {
    if (isNoteMode && activeNote && !messagesLoading) {
      setMessages(
        conversationMessages.map((msg) => ({
          id: msg.id,
          sender: msg.role,
          content: msg.content,
          timestamp: msg.createdAt,
          // chips: msg.chips,
        })),
      );
    }
  }, [conversationMessages, conversationId]);

  // Auto-scroll to bottom of chat when messages change or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          prompt: query,
          conversationId: conversationId,
          noteId: activeNote?.id,
        }),
      });

      if (res?.conversationId) {
        setConversationId(res.conversationId);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "assistant",
        content: res?.data || "No response content received.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        content: `⚠️ **API Error**: ${
          error.message ||
          "Failed to connect to AI agent backend. Please ensure your AI Provider Key is configured in Settings."
        }`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // const handleClearChat = () => {
  //   setConversationId(undefined);
  //   if (isNoteMode && activeNote) {
  //     const displayTitle =
  //       noteTitle.trim() || activeNote.title || "Untitled Note";
  //     setMessages([
  //       {
  //         id: `welcome-${Date.now()}`,
  //         sender: "assistant",
  //         content: `Chat history cleared. How can I assist with **"${displayTitle}"** now?`,
  //         timestamp: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //         chips: [
  //           "Summarize this note",
  //           "Extract action items",
  //           "Generate unit tests",
  //         ],
  //       },
  //     ]);
  //   } else {
  //     setMessages([
  //       {
  //         id: `welcome-${Date.now()}`,
  //         sender: "assistant",
  //         content: `Chat history cleared. How can I assist with your workspace today?`,
  //         timestamp: new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         }),
  //         chips: [
  //           "Summarize workspace",
  //           "Find open tasks",
  //           "Generate code scaffold",
  //         ],
  //       },
  //     ]);
  //   }
  // };

  if (!isOpen) return null;

  const contextLabel = isNoteMode
    ? activeNote?.title || noteTitle || "Untitled Note"
    : projectId
      ? "Project Context"
      : "Workspace Overview";

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface select-none min-h-0 overflow-hidden font-sans">
      {/* ── Agent Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-elevated/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-purple-500 text-white shadow-xs shrink-0">
            <Bot size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-bg-surface rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text-primary tracking-tight font-sans truncate">
                DevJournal Agent
              </h3>
            </div>
            <p className="text-[10px] font-mono text-text-muted truncate">
              Context: {contextLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer border-none bg-transparent"
            title="Close Agent Panel"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      </div>

      {/* ── Chat Messages Scroller ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg) => {
          const isAgent = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                isAgent ? "items-start" : "items-end"
              }`}
            >
              {/* Sender info line */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted px-1">
                {isAgent ? (
                  <>
                    <Sparkles size={11} className="text-accent" />
                    <span className="font-semibold text-text-secondary">
                      Agent
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-text-secondary">
                      You
                    </span>
                    <User size={11} className="text-text-muted" />
                  </>
                )}
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble Card */}
              <div
                className={`relative group p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                  isAgent
                    ? "bg-bg-elevated/90 text-text-primary border border-border-subtle rounded-tl-xs shadow-xs"
                    : "bg-accent/15 text-text-primary border border-accent/30 rounded-tr-xs shadow-xs"
                }`}
              >
                {/* Render HTML parsed markdown */}
                <div
                  className="font-sans text-xs leading-relaxed space-y-2 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-bg-primary/80 [&_code]:font-mono [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:bg-bg-primary [&_pre]:overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(msg.content),
                  }}
                />

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute top-2 right-2 p-1 rounded bg-bg-surface/80 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity border border-border-subtle cursor-pointer"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check size={11} className="text-emerald-400" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>

                {/* Quick Action Suggestion Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2 border-t border-border-subtle/50">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-bg-primary hover:bg-bg-surface text-accent hover:text-text-primary border border-accent/25 hover:border-accent/50 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-text-muted text-[11px] font-mono px-2 py-1">
            <div className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Bot size={13} className="animate-spin" />
            </div>
            <span className="flex items-center gap-1">
              DevJournal Agent is thinking
              <span className="inline-flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-accent animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
              </span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Starter Chips Bar ─────────────────────────────────────────── */}
      <div className="px-3 py-1.5 bg-bg-elevated/20 border-t border-border-subtle/60 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono no-scrollbar shrink-0">
        {isNoteMode ? (
          <>
            <button
              type="button"
              onClick={() => handleSendMessage("Summarize this note")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <FileText size={10} className="text-blue-400" />
              <span>Summary</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Extract action items")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <ListCheck size={10} className="text-amber-400" />
              <span>Action Items</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Generate unit tests")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <Code2 size={10} className="text-purple-400" />
              <span>Tests</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Improve formatting")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <Wand2 size={10} className="text-emerald-400" />
              <span>Refactor</span>
            </button>
          </>
        ) : (
          <div>
            <h3>Recent Chats</h3>
            {convLoading ? (
              <p>Loading...</p>
            ) : (
              conversations.map((conversation) => {
                return <p>{conversation.title}</p>;
              })
            )}
            {/* <button
              type="button"
              onClick={() => handleSendMessage("Summarize workspace")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <FileText size={10} className="text-blue-400" />
              <span>Workspace Summary</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("What action items are open?")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <ListCheck size={10} className="text-amber-400" />
              <span>Action Items</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Generate code scaffold")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <Code2 size={10} className="text-purple-400" />
              <span>Code Scaffold</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Help organize projects")}
              className="px-2 py-1 rounded-md bg-bg-elevated text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <FolderGit2 size={10} className="text-emerald-400" />
              <span>Organize</span>
            </button> */}
          </div>
        )}
      </div>

      {/* ── Chat Input Form Bar ─────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border-subtle bg-bg-surface shrink-0">
        <div className="relative flex items-center bg-bg-primary border border-border-subtle focus-within:border-accent rounded-xl p-2 transition-colors">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isNoteMode
                ? "Ask AI agent about this note..."
                : "Ask AI agent about workspace..."
            }
            className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted/50 resize-none font-sans leading-relaxed"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            className="ml-2 p-2 rounded-lg bg-accent text-white hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:hover:bg-accent transition-all cursor-pointer shrink-0 border-none flex items-center justify-center shadow-xs"
            title="Send Message (Enter)"
          >
            <Send size={13} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-text-muted/60 px-1">
          <span>Enter to send · Shift+Enter for new line</span>
          <span>Agent API Active</span>
        </div>
      </div>
    </div>
  );
}
