/**
 * High-performance Markdown-to-HTML parser covering GitHub Flavored Markdown (GFM)
 * and Notion extensions: Headings (H1-H6), Callouts, Fenced Code Blocks, GFM Tables,
 * Task lists, Nested Bullet & Numbered lists, Blockquotes, Bold, Italic, Strikethrough,
 * Links, Inline code, and Horizontal Rules.
 */
export function parseMarkdown(md: string): string {
  if (!md) return "";

  // Normalize line endings
  let text = md.replace(/\r\n/g, "\n");

  // 1. Extract Code Blocks with safe unicode placeholders (e.g. \uE000CB_0\uE000)
  const codeBlocks: string[] = [];
  text = text.replace(/```([a-zA-Z0-9_+-]*)[ \t]*\n([\s\S]*?)(?:```|$)/g, (_, lang, code) => {
    const cleanLang = (lang || "").trim().toLowerCase();
    const rawCode = code.trimEnd();
    const escapedCode = escapeHtml(rawCode);
    const langLabel = cleanLang ? cleanLang : "code";
    const attrCode = escapeAttribute(rawCode);

    const html = `<div class="code-block-container" data-lang="${cleanLang}"><div class="code-block-header"><span class="code-lang-tag">${langLabel}</span><button class="code-copy-btn" data-code="${attrCode}" title="Copy code"><svg class="copy-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span class="copy-text">Copy</span></button></div><pre><code>${escapedCode}</code></pre></div>`;

    codeBlocks.push(html);
    return `\uE000CB_${codeBlocks.length - 1}\uE000`;
  });

  const lines = text.split("\n");
  const formatted: string[] = [];

  interface ListStackItem {
    type: "ul" | "ol" | "task";
    indent: number;
  }
  const listStack: ListStackItem[] = [];

  const closeListStack = () => {
    while (listStack.length > 0) {
      const popped = listStack.pop();
      if (popped) {
        const closeTag = popped.type === "ol" ? "</ol>" : "</ul>";
        formatted.push(`</li>${closeTag}`);
      }
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code block placeholder
    if (trimmed.startsWith("\uE000CB_") && trimmed.endsWith("\uE000")) {
      closeListStack();
      formatted.push(trimmed);
      i++;
      continue;
    }

    // Empty line
    if (trimmed === "") {
      closeListStack();
      i++;
      continue;
    }

    // Callout blocks (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION])
    const calloutMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(.*)$/i);
    if (calloutMatch) {
      closeListStack();
      const typeLower = calloutMatch[1].toLowerCase();
      const firstLineContent = calloutMatch[2];
      const calloutLines: string[] = [firstLineContent];

      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const subContent = lines[i].trim().replace(/^>\s?/, "");
        if (!subContent.startsWith("[!")) {
          calloutLines.push(subContent);
          i++;
        } else {
          break;
        }
      }

      const icons: Record<string, string> = {
        note: "ℹ️",
        tip: "💡",
        warning: "⚠️",
        important: "📌",
        caution: "🚨",
      };
      const icon = icons[typeLower] || "💡";
      const bodyHtml = calloutLines.map((l) => parseInline(l)).join("<br />");
      formatted.push(
        `<div class="callout-block callout-${typeLower}"><span class="callout-icon">${icon}</span><div class="callout-body">${bodyHtml}</div></div>`
      );
      continue;
    }

    // Standard Blockquotes (> quote)
    if (line.trim().startsWith(">")) {
      closeListStack();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const quoteHtml = quoteLines.map((l) => parseInline(l)).join("<br />");
      formatted.push(`<blockquote>${quoteHtml}</blockquote>`);
      continue;
    }

    // GFM Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeListStack();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2 && tableLines[1].includes("-")) {
        const headerRow = tableLines[0];
        const bodyRows = tableLines.slice(2);

        const headers = headerRow
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h.length > 0);

        const ths = headers.map((h) => `<th>${parseInline(h)}</th>`).join("");
        const trs = bodyRows
          .map((r) => {
            const cells = r
              .split("|")
              .map((c) => c.trim())
              .filter((c) => c.length > 0);
            return `<tr>${cells.map((c) => `<td>${parseInline(c)}</td>`).join("")}</tr>`;
          })
          .join("");

        formatted.push(
          `<div class="markdown-table-wrapper"><table class="markdown-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`
        );
        continue;
      }
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeListStack();
      const level = headingMatch[1].length;
      const content = parseInline(headingMatch[2]);
      formatted.push(`<h${level}>${content}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(---|[*]{3}|_{3})$/.test(trimmed)) {
      closeListStack();
      formatted.push("<hr />");
      i++;
      continue;
    }

    // Check for List Items (Unordered, Task, Ordered) with Indentation support
    const listItem = parseListItem(line);
    if (listItem.isList) {
      const { indent, type, isChecked, content } = listItem;
      const parsedContent = parseInline(content);

      if (listStack.length === 0) {
        listStack.push({ type, indent });
        const openTag = getListOpenTag(type);
        formatted.push(`${openTag}${renderListItemInner(type, isChecked, parsedContent)}`);
      } else {
        const currentTop = listStack[listStack.length - 1];

        if (indent > currentTop.indent) {
          listStack.push({ type, indent });
          const openTag = getListOpenTag(type);
          formatted.push(`${openTag}${renderListItemInner(type, isChecked, parsedContent)}`);
        } else if (indent < currentTop.indent) {
          while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
            const popped = listStack.pop();
            const closeTag = popped?.type === "ol" ? "</ol>" : "</ul>";
            formatted.push(`</li>${closeTag}`);
          }

          if (listStack.length > 0 && listStack[listStack.length - 1].indent === indent) {
            const top = listStack[listStack.length - 1];
            if (top.type === type) {
              formatted.push(`</li>${renderListItemInner(type, isChecked, parsedContent)}`);
            } else {
              const closeTag = top.type === "ol" ? "</ol>" : "</ul>";
              listStack.pop();
              listStack.push({ type, indent });
              formatted.push(`</li>${closeTag}${getListOpenTag(type)}${renderListItemInner(type, isChecked, parsedContent)}`);
            }
          } else {
            listStack.push({ type, indent });
            formatted.push(`${getListOpenTag(type)}${renderListItemInner(type, isChecked, parsedContent)}`);
          }
        } else {
          if (currentTop.type === type) {
            formatted.push(`</li>${renderListItemInner(type, isChecked, parsedContent)}`);
          } else {
            const closeTag = currentTop.type === "ol" ? "</ol>" : "</ul>";
            listStack.pop();
            listStack.push({ type, indent });
            formatted.push(`</li>${closeTag}${getListOpenTag(type)}${renderListItemInner(type, isChecked, parsedContent)}`);
          }
        }
      }

      i++;
      continue;
    }

    // Standard Paragraph line
    closeListStack();
    formatted.push(`<p>${parseInline(trimmed)}</p>`);
    i++;
  }

  closeListStack();

  let result = formatted.join("\n");

  codeBlocks.forEach((cb, idx) => {
    result = result.replace(`\uE000CB_${idx}\uE000`, cb);
  });

  return result;
}

type ListType = "ul" | "ol" | "task";

interface ParsedListItem {
  isList: true;
  indent: number;
  type: ListType;
  isChecked: boolean;
  content: string;
}

interface ParsedNonListItem {
  isList: false;
}

function parseListItem(line: string): ParsedListItem | ParsedNonListItem {
  const indentMatch = line.match(/^(\s*)/);
  const indentStr = indentMatch ? indentMatch[1] : "";
  let indent = 0;
  for (const ch of indentStr) {
    indent += ch === "\t" ? 2 : 1;
  }

  const rest = line.slice(indentStr.length);

  const taskMatch = rest.match(/^([-*+])\s+\[([ xX]?)\]\s+(.*)$/);
  if (taskMatch) {
    return {
      isList: true,
      indent,
      type: "task",
      isChecked: taskMatch[2].toLowerCase() === "x",
      content: taskMatch[3],
    };
  }

  const ulMatch = rest.match(/^([-*+])\s+(.*)$/);
  if (ulMatch) {
    return {
      isList: true,
      indent,
      type: "ul",
      isChecked: false,
      content: ulMatch[2],
    };
  }

  const olMatch = rest.match(/^(\d+)\.\s+(.*)$/);
  if (olMatch) {
    return {
      isList: true,
      indent,
      type: "ol",
      isChecked: false,
      content: olMatch[2],
    };
  }

  return { isList: false };
}

function getListOpenTag(type: "ul" | "ol" | "task"): string {
  if (type === "task") return '<ul class="task-list">';
  if (type === "ol") return "<ol>";
  return "<ul>";
}

function renderListItemInner(type: "ul" | "ol" | "task", isChecked: boolean, content: string): string {
  if (type === "task") {
    const checkedAttr = isChecked ? "checked" : "";
    const completedClass = isChecked ? " task-completed" : "";
    return `<li class="task-item${completedClass}"><input type="checkbox" ${checkedAttr} disabled /> <span>${content}</span>`;
  }
  if (type === "ol") {
    return `<li class="ordered-item">${content}`;
  }
  return `<li>${content}`;
}

function parseInline(text: string): string {
  if (!text) return "";

  let res = text;

  // Strikethrough
  res = res.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Bold & Italic combined ***text***
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");

  // Bold **text**
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic *text* or _text_
  res = res.replace(/\*(.*?)\*/g, "<em>$1</em>");
  res = res.replace(/_([^_\n]+)_/g, "<em>$1</em>");

  // Inline code `code`
  res = res.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links [text](url)
  res = res.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return res;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

