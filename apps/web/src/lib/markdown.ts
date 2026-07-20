/**
 * A minimal markdown-to-HTML parser covering the subset used in the journal:
 * headings, blockquotes, checkboxes, bullet lists, bold, inline code, and hr.
 *
 * NOTE: Raw HTML is escaped first to prevent XSS before injecting HTML tags.
 */
export function parseMarkdown(md: string): string {
  if (!md) return "";
  let html = md;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");

  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, "<blockquote>$1</blockquote>");

  // Checkboxes (must come before bullet list)
  html = html.replace(
    /- \[\s*\]\s+(.*)$/gm,
    "<li><input type='checkbox' disabled /> $1</li>"
  );
  html = html.replace(
    /- \[[xX]\]\s+(.*)$/gm,
    "<li><input type='checkbox' checked disabled /> $1</li>"
  );

  // Bullet lists
  html = html.replace(/^[-*]\s+(.*)$/gm, "<li>$1</li>");

  // Strong / Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Horizontal Rule
  html = html.replace(/^---$/gm, "<hr />");

  // Wrap loose <li> runs in <ul> and remaining text lines in <p>
  const lines = html.split("\n");
  let inList = false;
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("<li>") ||
      trimmed.startsWith("<blockquote>") ||
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<hr")
    ) {
      let prefix = "";
      if (trimmed.startsWith("<li>") && !inList) {
        inList = true;
        prefix = "<ul>";
      }
      return prefix + line;
    } else {
      let suffix = "";
      if (inList) {
        inList = false;
        suffix = "</ul>";
      }
      if (trimmed === "") return suffix;
      if (!line.includes("<ul>") && !line.includes("</ul>")) {
        return suffix + `<p>${line}</p>`;
      }
      return suffix + line;
    }
  });

  return formattedLines.join("\n");
}
