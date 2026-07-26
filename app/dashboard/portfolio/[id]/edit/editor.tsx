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

const STATUS_STYLES: Record<SaveStatus, string> = {
  saved: "bg-accent-lime/60 text-foreground",
  saving: "bg-accent-orange/40 text-foreground",
  error: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<SaveStatus, string> = {
  saved: "Сохранено",
  saving: "Сохранение...",
  error: "Ошибка сохранения",
};

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
    <div className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex justify-end">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto rounded-3xl bg-card p-6 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
    </div>
  );
}
