import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Editor, Range } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  SquareCode,
  Minus,
  Bold,
  Italic,
  Code,
} from "lucide-react";

export interface SlashItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ComponentType<{ size?: number }>;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Heading 1",
    description: "Big section heading",
    searchTerms: ["h1", "heading1", "title", "header"],
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    searchTerms: ["h2", "heading2", "subtitle", "header"],
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    searchTerms: ["h3", "heading3", "subheading", "header"],
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a bulleted list",
    searchTerms: ["bullet", "list", "unordered", "ul"],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    searchTerms: ["number", "list", "ordered", "ol"],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Track tasks with a checkable list",
    searchTerms: ["task", "todo", "checkbox", "check"],
    icon: CheckSquare,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote or callout",
    searchTerms: ["quote", "blockquote", "cite"],
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Insert a syntax code block",
    searchTerms: ["code", "pre", "javascript", "typescript", "python"],
    icon: SquareCode,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Visually separate sections",
    searchTerms: ["divider", "hr", "line", "separator"],
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Bold Text",
    description: "Make text bold",
    searchTerms: ["bold", "strong", "b"],
    icon: Bold,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run();
    },
  },
  {
    title: "Italic Text",
    description: "Make text italic",
    searchTerms: ["italic", "em", "i"],
    icon: Italic,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run();
    },
  },
  {
    title: "Inline Code",
    description: "Format inline code snippet",
    searchTerms: ["code", "inline", "mono"],
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run();
    },
  },
];

export interface SlashMenuListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashMenuListHandler {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenuList = forwardRef<SlashMenuListHandler, SlashMenuListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-bg-surface border border-border-subtle rounded-lg shadow-xl w-70 p-3 text-xs text-text-secondary text-center z-9999">
          <span>No matching blocks</span>
        </div>
      );
    }

    return (
      <div className="bg-bg-surface border border-border-subtle rounded-lg shadow-xl w-70 h-80 overflow-y-auto p-1.5 z-9999">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary px-2 py-1">Basic Blocks</div>
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                type="button"
                key={item.title}
                className={`flex items-center gap-2.5 w-full p-1.5 px-2 rounded-md border-none text-left cursor-pointer transition-colors ${
                  isSelected ? "bg-accent-light" : "hover:bg-accent-light"
                }`}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-md border text-text-primary shrink-0 transition-colors ${
                    isSelected
                      ? "bg-text-primary text-bg-surface border-text-primary"
                      : "bg-black/3 border-border-subtle"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="text-xs font-medium text-text-primary leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

SlashMenuList.displayName = "SlashMenuList";
