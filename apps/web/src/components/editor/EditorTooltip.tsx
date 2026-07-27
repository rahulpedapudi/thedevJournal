import React, { useState } from "react";

interface EditorTooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
}

export function EditorTooltip({
  content,
  shortcut,
  children,
  side = "top",
}: EditorTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), 150);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-100 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-[#18181b] border border-[#27272a] text-[#f4f4f5] text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="px-1 py-0.5 text-[9px] font-mono text-[#a1a1aa] bg-[#27272a] border border-[#3f3f46] rounded">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}
