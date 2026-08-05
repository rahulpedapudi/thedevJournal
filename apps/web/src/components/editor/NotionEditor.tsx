import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  SquareCode,
  Minus,
  Link as LinkIcon,
  Table as TableIcon,
  ExternalLink,
  Unlink,
  Edit2,
  Trash2,
  Columns3,
  Rows3,
} from "lucide-react";

import { SlashCommandsExtension } from "./slashExtension";
import { EditorTooltip } from "./EditorTooltip";

interface NotionEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export function NotionEditor({
  content,
  onChange,
  placeholder = "Type '/' for commands, or write notes directly...",
}: NotionEditorProps) {
  const isUpdatingRef = useRef(false);
  const lastEmittedMarkdownRef = useRef<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "editor-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      // Extend Table to always serialize as GFM markdown (| col |),
      // even when cells contain multiple paragraphs, instead of falling
      // through to tiptap-markdown's broken "[table]" placeholder.
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "notion-table",
        },
      }).extend({
        addStorage() {
          return {
            markdown: {
              serialize(state: any, node: ProseMirrorNode) {
                const rows: string[][] = [];
                node.forEach((row) => {
                  const cells: string[] = [];
                  row.forEach((cell) => {
                    // Collect text from all paragraphs in the cell,
                    // joining multi-paragraph content with <br>
                    const parts: string[] = [];
                    cell.forEach((child) => {
                      let text = "";
                      child.forEach((inline: ProseMirrorNode) => {
                        text += inline.text ?? "";
                      });
                      parts.push(text);
                    });
                    // Escape pipes inside cell content
                    cells.push(parts.join("<br>").replace(/\|/g, "\\|").trim());
                  });
                  rows.push(cells);
                });

                if (rows.length === 0) return;

                const colCount = rows.reduce(
                  (m, r) => Math.max(m, r.length),
                  0,
                );

                // Header row (first row)
                state.write(
                  `| ${rows[0].map((c) => c || " ").join(" | ")} |\n`,
                );
                // Separator
                state.write(`| ${Array(colCount).fill("---").join(" | ")} |\n`);
                // Body rows
                rows.slice(1).forEach((r) => {
                  const padded = Array.from(
                    { length: colCount },
                    (_, i) => r[i] ?? "",
                  );
                  state.write(
                    `| ${padded.map((c) => c || " ").join(" | ")} |\n`,
                  );
                });

                state.closeBlock(node);
              },
              parse: {
                // Handled by markdown-it's table plugin
              },
            },
          };
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
      SlashCommandsExtension,
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const markdown = (editor.storage as any).markdown?.getMarkdown() ?? "";
      lastEmittedMarkdownRef.current = markdown;
      onChange(markdown);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    },
  });

  // Sync content from outside (e.g. when changing active notes)
  useEffect(() => {
    if (!editor) return;
    // Skip setContent if content matches what editor just emitted (prevents cursor jump & char loss)
    if (content === lastEmittedMarkdownRef.current) return;
    if (isUpdatingRef.current) return;

    const currentMarkdown =
      (editor.storage as any).markdown?.getMarkdown() ?? "";
    if (currentMarkdown !== content) {
      lastEmittedMarkdownRef.current = content;
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter target URL:", previousUrl);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const formattedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: formattedUrl })
      .run();
  };

  const getBtnClass = (isActive: boolean) =>
    `inline-flex items-center justify-center w-7 h-7 rounded border transition-all cursor-pointer ${
      isActive
        ? "bg-accent text-white border-accent shadow-xs font-semibold scale-[1.03]"
        : "bg-transparent border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
    }`;

  const currentLinkHref = editor.getAttributes("link").href;

  return (
    <div className="flex flex-col w-full flex-1 min-h-87.5">
      {/* Floating Formatting Bubble Toolbar — Appears dynamically when text is selected */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-1 p-1 bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95">
            {/* Formatting Group */}
            <div className="flex items-center gap-0.5">
              <EditorTooltip content="Bold" shortcut="Ctrl+B">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={getBtnClass(editor.isActive("bold"))}
                >
                  <Bold size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Italic" shortcut="Ctrl+I">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={getBtnClass(editor.isActive("italic"))}
                >
                  <Italic size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Strikethrough">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={getBtnClass(editor.isActive("strike"))}
                >
                  <Strikethrough size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Inline Code" shortcut="Ctrl+E">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={getBtnClass(editor.isActive("code"))}
                >
                  <Code size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip
                content={editor.isActive("link") ? "Edit Link" : "Add Link"}
                shortcut="Ctrl+K"
              >
                <button
                  type="button"
                  onClick={addLink}
                  className={getBtnClass(editor.isActive("link"))}
                >
                  <LinkIcon size={14} />
                </button>
              </EditorTooltip>
            </div>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            {/* Headings Group */}
            <div className="flex items-center gap-0.5">
              <EditorTooltip content="Heading 1" shortcut="# Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={getBtnClass(
                    editor.isActive("heading", { level: 1 }),
                  )}
                >
                  <Heading1 size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Heading 2" shortcut="## Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={getBtnClass(
                    editor.isActive("heading", { level: 2 }),
                  )}
                >
                  <Heading2 size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Heading 3" shortcut="### Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className={getBtnClass(
                    editor.isActive("heading", { level: 3 }),
                  )}
                >
                  <Heading3 size={14} />
                </button>
              </EditorTooltip>
            </div>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            {/* Structure Group */}
            <div className="flex items-center gap-0.5">
              <EditorTooltip content="Bullet List" shortcut="- Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={getBtnClass(editor.isActive("bulletList"))}
                >
                  <List size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Numbered List" shortcut="1. Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={getBtnClass(editor.isActive("orderedList"))}
                >
                  <ListOrdered size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Task List" shortcut="[ ] Space">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  className={getBtnClass(editor.isActive("taskList"))}
                >
                  <CheckSquare size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Quote" shortcut="> Space">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={getBtnClass(editor.isActive("blockquote"))}
                >
                  <Quote size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Code Block" shortcut="```">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={getBtnClass(editor.isActive("codeBlock"))}
                >
                  <SquareCode size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Insert Table">
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }
                  className={getBtnClass(editor.isActive("table"))}
                >
                  <TableIcon size={14} />
                </button>
              </EditorTooltip>

              <EditorTooltip content="Divider Line" shortcut="---">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  className="inline-flex items-center justify-center w-7 h-7 rounded border border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary cursor-pointer transition-colors"
                >
                  <Minus size={14} />
                </button>
              </EditorTooltip>
            </div>
          </div>
        </BubbleMenu>
      )}

      {/* Link Popover Menu — Appears when focused inside a Link */}
      {editor && editor.isActive("link") && currentLinkHref && (
        <div className="flex items-center gap-1.5 p-1.5 mb-2 bg-bg-surface border border-border-subtle rounded-lg shadow-lg text-xs self-start z-40">
          <span className="text-text-muted font-mono text-[11px] truncate max-w-50 px-1">
            {currentLinkHref}
          </span>
          <EditorTooltip content="Open Link">
            <a
              href={currentLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-text-secondary hover:text-accent hover:bg-bg-elevated transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          </EditorTooltip>
          <EditorTooltip content="Edit URL">
            <button
              type="button"
              onClick={addLink}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              <Edit2 size={13} />
            </button>
          </EditorTooltip>
          <EditorTooltip content="Remove Link">
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1 rounded text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Unlink size={13} />
            </button>
          </EditorTooltip>
        </div>
      )}

      {/* Table Context Controls — Appears when focused inside a Table */}
      {editor && editor.isActive("table") && (
        <div className="flex items-center gap-1 p-1 mb-2 bg-bg-surface border border-border-subtle rounded-lg shadow-md text-xs self-start z-40 flex-wrap">
          <span className="text-[10px] font-mono text-text-muted px-1 uppercase font-semibold">
            Table Options:
          </span>

          <EditorTooltip content="Add Row Above">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Rows3 size={12} />
              <span>+Row Above</span>
            </button>
          </EditorTooltip>

          <EditorTooltip content="Add Row Below">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Rows3 size={12} />
              <span>+Row Below</span>
            </button>
          </EditorTooltip>

          <EditorTooltip content="Add Column Left">
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Columns3 size={12} />
              <span>+Col Left</span>
            </button>
          </EditorTooltip>

          <EditorTooltip content="Add Column Right">
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Columns3 size={12} />
              <span>+Col Right</span>
            </button>
          </EditorTooltip>

          <div className="w-px h-4 bg-border-subtle mx-1" />

          <EditorTooltip content="Delete Row">
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Row</span>
            </button>
          </EditorTooltip>

          <EditorTooltip content="Delete Column">
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Col</span>
            </button>
          </EditorTooltip>

          <EditorTooltip content="Delete Entire Table">
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Table</span>
            </button>
          </EditorTooltip>
        </div>
      )}

      {/* Tiptap WYSIWYG Editable Area */}
      <EditorContent editor={editor} className="flex-1 w-full flex flex-col" />
    </div>
  );
}
