"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { savePortfolioContent } from "./actions";
import { uploadPortfolioImage } from "@/lib/supabase/storage";

type SaveStatus = "saved" | "saving" | "error";

const DEBOUNCE_MS = 2000;

export function PortfolioEditor({
  portfolioId,
  userId,
  initialContent,
}: {
  portfolioId: string;
  userId: string;
  initialContent: PartialBlock[] | null;
}) {
  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
    uploadFile: (file) => uploadPortfolioImage(file, userId, portfolioId),
  });

  const [status, setStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange() {
    setStatus("saving");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const { error } = await savePortfolioContent(portfolioId, editor.document);
      setStatus(error ? "error" : "saved");
    }, DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-black/10 px-6 py-3 text-sm dark:border-white/15">
        {status === "saving" && (
          <span className="text-black/60 dark:text-white/60">Сохранение...</span>
        )}
        {status === "saved" && (
          <span className="text-green-600">Сохранено</span>
        )}
        {status === "error" && (
          <span className="text-red-600">Ошибка сохранения</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <BlockNoteView editor={editor} onChange={handleChange} />
      </div>
    </div>
  );
}
