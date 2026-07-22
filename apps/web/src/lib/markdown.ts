/**
 * High-performance Markdown-to-HTML parser covering GitHub Flavored Markdown (GFM)
 * and Notion extensions: Headings (H1-H6), Callouts, Code blocks, Tables,
 * Checkboxes, Bullet & Numbered lists, Blockquotes, Bold, Italic, Strikethrough,
 * Links, Inline code, and Horizontal Rules.
 */
export function parseMarkdown(md: string): string {
  if (!md) return "";

  // Normalize line endings
  let text = md.replace(/\r\n/g, "\n");

  // Code blocks placeholder replacement to prevent parsing inside code blocks
  const codeBlocks: string[] = [];
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = escapeHtml(code.trim());
    const langLabel = lang ? `<span class="code-lang-tag">${lang}</span>` : "";
    const html = `<div class="code-block-container">${langLabel}<pre><code>${escapedCode}</code></pre></div>`;
    codeBlocks.push(html);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Callout blocks (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION])
  text = text.replace(
    /^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(.*)$/gim,
    (_, type, content) => {
      const typeLower = type.toLowerCase();
      const icons: Record<string, string> = {
        note: "ℹ️",
        tip: "💡",
        warning: "⚠️",
        important: "📌",
        caution: "🚨",
      };
      const icon = icons[typeLower] || "💡";
      return `<div class="callout-block callout-${typeLower}"><span class="callout-icon">${icon}</span><div class="callout-body">${content}</div></div>`;
    }
  );

  // Standard Blockquotes (> quote)
  text = text.replace(/^>\s+(.*)$/gm, "<blockquote>$1</blockquote>");

  // Escape raw HTML outside of preserved code blocks
  text = escapeHtmlExceptPlaceholders(text);

  // GFM Tables
  text = text.replace(
    /^\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/gm,
    (_, headerRow, bodyRows) => {
      const headers = headerRow
        .split("|")
        .map((h: string) => h.trim())
        .filter((h: string) => h.length > 0);
      const rows = bodyRows
        .trim()
        .split("\n")
        .map((row: string) =>
          row
            .split("|")
            .map((c: string) => c.trim())
            .filter((c: string) => c.length > 0)
        );

      const ths = headers.map((h: string) => `<th>${h}</th>`).join("");
      const trs = rows
        .map(
          (row: string[]) =>
            `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`
        )
        .join("");

      return `<div class="markdown-table-wrapper"><table class="markdown-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    }
  );

  // Headings
  text = text.replace(/^######\s+(.*)$/gm, "<h6>$1</h6>");
  text = text.replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>");
  text = text.replace(/^####\s+(.*)$/gm, "<h4>$1</h4>");
  text = text.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  text = text.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  text = text.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");

  // Checkboxes / Task lists
  text = text.replace(
    /^[-*]\s+\[\s*\]\s+(.*)$/gm,
    '<li class="task-item"><input type="checkbox" disabled /> <span>$1</span></li>'
  );
  text = text.replace(
    /^[-*]\s+\[[xX]\]\s+(.*)$/gm,
    '<li class="task-item task-completed"><input type="checkbox" checked disabled /> <span>$1</span></li>'
  );

  // Unordered Lists
  text = text.replace(/^[-*]\s+(.*)$/gm, "<li>$1</li>");

  // Ordered Lists
  text = text.replace(/^\d+\.\s+(.*)$/gm, '<li class="ordered-item">$1</li>');

  // Horizontal Rule
  text = text.replace(/^(---|\*\*\*)$/gm, "<hr />");

  // Strikethrough
  text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Bold & Italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Format list wrapping & paragraphs
  const lines = text.split("\n");
  let inUl = false;
  let inOl = false;
  const formatted: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Check code block placeholder
    if (trimmed.startsWith("__CODE_BLOCK_")) {
      if (inUl) {
        formatted.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        formatted.push("</ol>");
        inOl = false;
      }
      formatted.push(line);
      continue;
    }

    if (trimmed.startsWith("<li")) {
      if (trimmed.includes("ordered-item")) {
        if (!inOl) {
          if (inUl) {
            formatted.push("</ul>");
            inUl = false;
          }
          inOl = true;
          formatted.push("<ol>");
        }
      } else {
        if (!inUl) {
          if (inOl) {
            formatted.push("</ol>");
            inOl = false;
          }
          inUl = true;
          formatted.push('<ul class="task-list">');
        }
      }
      formatted.push(line);
    } else {
      if (inUl) {
        formatted.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        formatted.push("</ol>");
        inOl = false;
      }

      if (
        trimmed === "" ||
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<div")
      ) {
        formatted.push(line);
      } else {
        formatted.push(`<p>${line}</p>`);
      }
    }
  }

  if (inUl) formatted.push("</ul>");
  if (inOl) formatted.push("</ol>");

  let result = formatted.join("\n");

  // Restore code blocks
  codeBlocks.forEach((cb, idx) => {
    result = result.replace(`__CODE_BLOCK_${idx}__`, cb);
  });

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlExceptPlaceholders(str: string): string {
  // Replace HTML tags except code block placeholders
  return str.replace(/<(?!\/?__CODE_BLOCK_)[^>]+>/g, (match) => {
    return match
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  });
}
