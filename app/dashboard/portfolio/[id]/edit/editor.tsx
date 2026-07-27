"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { schema, type PortfolioPartialBlock } from "@/lib/editor/schema";
import { getFontClassName } from "@/lib/fonts";
import { savePortfolioContent, savePortfolioStyle } from "./actions";
import { uploadPortfolioImage } from "@/lib/supabase/storage";
import { EditorSidePanel, type PortfolioStyleValues } from "./side-panel";

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
  initialStyle,
}: {
  portfolioId: string;
  userId: string;
  initialContent: PortfolioPartialBlock[] | null;
  initialStyle: PortfolioStyleValues;
}) {
  const editor = useCreateBlockNote({
    schema,
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
    uploadFile: (file) => uploadPortfolioImage(file, userId, portfolioId),
  });

  const [status, setStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [style, setStyle] = useState<PortfolioStyleValues>(initialStyle);
  const [, startStyleTransition] = useTransition();

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

  function handleStyleChange(next: Partial<PortfolioStyleValues>) {
    const merged = { ...style, ...next };
    setStyle(merged);

    startStyleTransition(async () => {
      await savePortfolioStyle(portfolioId, {
        background_color: merged.backgroundColor,
        text_color: merged.textColor,
        font_family: merged.fontFamily,
        cover_image_url: merged.coverImageUrl,
      });
    });
  }

  return (
    <div className="flex flex-1">
      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-28 md:p-8">
        <div className="flex justify-end">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
        <div
          className={`flex-1 overflow-x-auto overflow-y-auto rounded-3xl p-4 shadow-[0_1px_2px_rgba(38,36,31,0.06)] sm:p-6 ${getFontClassName(style.fontFamily)}`}
          style={{ backgroundColor: style.backgroundColor, color: style.textColor }}
        >
          <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
        </div>
      </div>

      <EditorSidePanel
        editor={editor}
        portfolioId={portfolioId}
        userId={userId}
        style={style}
        onStyleChange={handleStyleChange}
      />
    </div>
  );
}
