import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
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
} from "lucide-react";

import { SlashCommandsExtension } from "./slashExtension";

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
      }),
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
      onChange(markdown);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    },
  });

  // Sync content from outside (e.g. when changing notes)
  useEffect(() => {
    if (!editor || isUpdatingRef.current) return;
    const currentMarkdown = (editor.storage as any).markdown?.getMarkdown() ?? "";
    if (currentMarkdown !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-col w-full flex-1 min-h-87.5">
      {/* Floating Toolbar — Appears dynamically ONLY when text is selected */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-1 p-1 bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("bold") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("italic") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("strike") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("code") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Inline Code"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                onClick={addLink}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("link") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Add Link"
              >
                <LinkIcon size={14} />
              </button>
            </div>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("heading", { level: 1 }) ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Heading 1 (#)"
              >
                <Heading1 size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("heading", { level: 2 }) ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Heading 2 (##)"
              >
                <Heading2 size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("heading", { level: 3 }) ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Heading 3 (###)"
              >
                <Heading3 size={14} />
              </button>
            </div>

            <div className="w-px h-4 bg-border-subtle mx-1" />

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("bulletList") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Bullet List (-)"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("orderedList") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Ordered List (1.)"
              >
                <ListOrdered size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("taskList") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Task List ([ ])"
              >
                <CheckSquare size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("blockquote") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Quote (>)"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer transition-colors ${
                  editor.isActive("codeBlock") ? "bg-text-primary text-bg-surface" : "text-text-secondary hover:bg-accent-light hover:text-text-primary"
                }`}
                title="Code Block (```)"
              >
                <SquareCode size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="inline-flex items-center justify-center w-6 h-6 rounded border-none bg-transparent text-text-secondary hover:bg-accent-light hover:text-text-primary cursor-pointer transition-colors"
                title="Divider (---)"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
        </BubbleMenu>
      )}

      {/* Tiptap WYSIWYG Editable Area */}
      <EditorContent editor={editor} className="flex-1 w-full flex flex-col" />
    </div>
  );
}
