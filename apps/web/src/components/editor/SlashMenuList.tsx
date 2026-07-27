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
  Table as TableIcon,
  Link as LinkIcon,
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
    title: "Table",
    description: "Insert a 3x3 grid table",
    searchTerms: ["table", "grid", "row", "column", "cell"],
    icon: TableIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Link",
    description: "Add a hyperlink to selected text",
    searchTerms: ["link", "url", "href", "hyperlink"],
    icon: LinkIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section title",
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
    description: "Medium section header",
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
    description: "Small sub-header",
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
    description: "Bulleted itemized list",
    searchTerms: ["bullet", "list", "unordered", "ul"],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Ordered numerical list",
    searchTerms: ["number", "list", "ordered", "ol"],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task Checklist",
    description: "Checkable todo task list",
    searchTerms: ["task", "todo", "checkbox", "check"],
    icon: CheckSquare,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Blockquote",
    description: "Quotations or callouts",
    searchTerms: ["quote", "blockquote", "cite"],
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code snippet",
    searchTerms: ["code", "pre", "javascript", "typescript", "python"],
    icon: SquareCode,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider Line",
    description: "Horizontal section divider",
    searchTerms: ["divider", "hr", "line", "separator"],
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Bold Text",
    description: "Emphasize with bold text",
    searchTerms: ["bold", "strong", "b"],
    icon: Bold,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run();
    },
  },
  {
    title: "Italic Text",
    description: "Slanted italic text",
    searchTerms: ["italic", "em", "i"],
    icon: Italic,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run();
    },
  },
  {
    title: "Inline Code",
    description: "Monospaced code snippet",
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
        <div className="bg-[#121215] border border-[#27272a] rounded-md shadow-2xl w-64 p-3 text-xs text-text-muted text-center font-mono z-9999">
          <span>no matching blocks</span>
        </div>
      );
    }

    return (
      <div className="bg-[#121215] border border-[#27272a] rounded-md shadow-2xl w-68 max-h-72 overflow-y-auto p-1.5 z-9999 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[9px] font-mono font-semibold uppercase tracking-wider text-text-muted px-2 py-1 mb-1">
            <span>Command Blocks</span>
            <span>{items.length}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  type="button"
                  key={item.title}
                  className={`flex items-center gap-2.5 w-full p-1.5 px-2 rounded border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#18181b] border-border-strong"
                      : "bg-transparent border-transparent hover:bg-[#18181b]/50"
                  }`}
                  onClick={() => selectItem(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded border shrink-0 transition-colors ${
                      isSelected
                        ? "bg-text-primary text-bg-surface border-text-primary"
                        : "bg-[#18181b] border-[#27272a] text-text-primary"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-text-primary leading-tight font-sans">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-text-muted truncate mt-0.5 font-sans">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Raycast Keyboard Footer */}
        <div className="mt-2 border-t border-[#27272a] pt-1.5 px-2 flex items-center justify-between text-[9px] font-mono text-text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Insert</span>
        </div>
      </div>
    );
  }
);

SlashMenuList.displayName = "SlashMenuList";
