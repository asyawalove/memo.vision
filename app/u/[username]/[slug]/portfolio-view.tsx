"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export function PortfolioView({ content }: { content: PartialBlock[] | null }) {
  const editor = useCreateBlockNote({
    initialContent: content && content.length > 0 ? content : undefined,
  });

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}
