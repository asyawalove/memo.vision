"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { schema, type PortfolioPartialBlock } from "@/lib/editor/schema";

export function PortfolioView({ content }: { content: PortfolioPartialBlock[] | null }) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: content && content.length > 0 ? content : undefined,
  });

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}
