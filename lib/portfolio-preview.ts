import type { PortfolioPartialBlock } from "@/lib/editor/schema";

export type PreviewMark =
  | { kind: "heading" }
  | { kind: "text"; width: "full" | "wide" | "narrow" }
  | { kind: "image" }
  | { kind: "callout" }
  | { kind: "divider" };

const MAX_MARKS = 6;

const TEXT_BLOCK_TYPES = new Set([
  "paragraph",
  "bulletListItem",
  "numberedListItem",
  "toggleListItem",
  "table",
  "codeBlock",
]);

function inlineTextLength(content: unknown): number {
  if (!Array.isArray(content)) return 0;
  return content.reduce((total: number, item) => {
    if (
      item &&
      typeof item === "object" &&
      "text" in item &&
      typeof (item as { text?: unknown }).text === "string"
    ) {
      return total + (item as { text: string }).text.length;
    }
    return total;
  }, 0);
}

export function getContentPreviewMarks(
  content: PortfolioPartialBlock[] | null | undefined
): PreviewMark[] {
  if (!content || content.length === 0) return [];

  const marks: PreviewMark[] = [];

  for (const block of content) {
    if (marks.length >= MAX_MARKS) break;

    const type = block.type as string;

    if (type === "heading") {
      marks.push({ kind: "heading" });
    } else if (type === "image" || type === "gallery") {
      marks.push({ kind: "image" });
    } else if (type === "callout") {
      marks.push({ kind: "callout" });
    } else if (type === "divider") {
      marks.push({ kind: "divider" });
    } else if (TEXT_BLOCK_TYPES.has(type)) {
      const length = inlineTextLength((block as { content?: unknown }).content);
      if (length === 0) continue;
      marks.push({
        kind: "text",
        width: length > 80 ? "full" : length > 30 ? "wide" : "narrow",
      });
    }
  }

  return marks;
}
