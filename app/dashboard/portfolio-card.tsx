"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Palette, Share2, Trash2 } from "lucide-react";
import {
  deletePortfolio,
  renamePortfolio,
  setPortfolioCoverStyle,
  setPortfolioVisibility,
} from "./actions";
import {
  COVER_COLORS,
  COVER_PATTERNS,
  getCoverPatternStyle,
  parseCoverStyle,
  type PortfolioCoverStyle,
} from "@/lib/cover-patterns";
import { getContentPreviewMarks, type PreviewMark } from "@/lib/portfolio-preview";
import type { PortfolioPartialBlock } from "@/lib/editor/schema";

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  is_public: boolean;
  updated_at: string;
  cover_style: unknown;
  content: unknown;
};

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (date.toDateString() === now.toDateString()) {
    return `Сегодня в ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Вчера в ${time}`;
  }

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function PagePreview({ marks }: { marks: PreviewMark[] }) {
  if (marks.length === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-1 p-2">
        <div className="h-0.5 w-3/4 rounded-full bg-black/10" />
        <div className="h-0.5 w-1/2 rounded-full bg-black/10" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-1 overflow-hidden p-2">
      {marks.map((mark, index) => {
        if (mark.kind === "heading") {
          return <div key={index} className="h-1 w-3/4 rounded-full bg-black/30" />;
        }
        if (mark.kind === "image") {
          return <div key={index} className="h-3 w-full rounded-sm bg-black/15" />;
        }
        if (mark.kind === "callout") {
          return <div key={index} className="h-1.5 w-full rounded-full bg-accent-orange/50" />;
        }
        if (mark.kind === "divider") {
          return <div key={index} className="h-px w-full bg-black/15" />;
        }
        const width =
          mark.width === "full" ? "w-full" : mark.width === "wide" ? "w-5/6" : "w-1/2";
        return <div key={index} className={`h-0.5 ${width} rounded-full bg-black/15`} />;
      })}
    </div>
  );
}

export function PortfolioCard({
  portfolio,
  username,
}: {
  portfolio: Portfolio;
  username: string;
}) {
  const [title, setTitle] = useState(portfolio.title);
  const [isPublic, setIsPublic] = useState(portfolio.is_public);
  const [coverStyle, setCoverStyle] = useState<PortfolioCoverStyle>(
    parseCoverStyle(portfolio.cover_style)
  );
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(portfolio.title);
  const [isDeleted, setIsDeleted] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const previewMarks = getContentPreviewMarks(
    portfolio.content as PortfolioPartialBlock[] | null
  );

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  function handleCoverChange(next: Partial<PortfolioCoverStyle>) {
    const merged = { ...coverStyle, ...next };
    setCoverStyle(merged);
    startTransition(async () => {
      await setPortfolioCoverStyle(portfolio.id, merged);
    });
  }

  async function handleShare() {
    const url = `${window.location.origin}/u/${username}/${portfolio.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (!isPublic) {
      setIsPublic(true);
      startTransition(async () => {
        await setPortfolioVisibility(portfolio.id, true);
      });
    }
  }

  function startEditingTitle() {
    setTitleDraft(title);
    setIsEditingTitle(true);
  }

  function commitTitle() {
    const trimmed = titleDraft.trim();
    setIsEditingTitle(false);

    if (!trimmed || trimmed === title) {
      return;
    }

    setTitle(trimmed);
    startTransition(async () => {
      await renamePortfolio(portfolio.id, trimmed);
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Удалить портфолио «${title}»? Это действие нельзя отменить.`
    );
    if (!confirmed) return;

    setIsDeleted(true);
    startTransition(async () => {
      await deletePortfolio(portfolio.id);
    });
  }

  if (isDeleted) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="group relative">
        <Link href={`/dashboard/portfolio/${portfolio.id}/edit`} className="block">
          <div className="relative aspect-[3/4] w-full">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-lg border border-black/10 bg-[#FBF8F1] shadow-sm" />
            <div className="absolute inset-0 translate-x-1 translate-y-1 rotate-1 rounded-lg border border-black/10 bg-[#FBF8F1] shadow-sm">
              <PagePreview marks={previewMarks} />
            </div>
            <div
              className="absolute inset-0 overflow-hidden rounded-lg shadow-md"
              style={getCoverPatternStyle(coverStyle.pattern, coverStyle.color)}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-black/15" />
              <div className="flex h-full w-full items-center justify-center p-3">
                <div className="w-full max-w-[85%] rounded-sm border-2 border-black/25 bg-[#FBF8F1]/90 px-2 py-2 text-center shadow-sm">
                  <p className="line-clamp-3 text-xs font-semibold text-foreground">{title}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleShare();
            }}
            aria-label="Поделиться"
            title="Поделиться публичной ссылкой"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setPickerOpen((value) => !value);
            }}
            aria-label="Изменить обложку"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Palette className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDelete();
            }}
            aria-label="Удалить портфолио"
            title="Удалить"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {pickerOpen && (
          <div
            ref={pickerRef}
            onClick={(event) => event.stopPropagation()}
            className="absolute left-1/2 top-9 z-20 w-40 -translate-x-1/2 rounded-xl bg-white p-2.5 shadow-lg"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Узор</p>
            <div className="mb-3 grid grid-cols-5 gap-1">
              {COVER_PATTERNS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleCoverChange({ pattern: option.value });
                  }}
                  className={`h-6 w-6 rounded-md border-2 ${
                    coverStyle.pattern === option.value
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                  style={getCoverPatternStyle(option.value, coverStyle.color)}
                />
              ))}
            </div>

            <p className="mb-2 text-xs font-medium text-muted-foreground">Цвет</p>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleCoverChange({ color });
                  }}
                  className="h-6 w-6 rounded-full border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: coverStyle.color === color ? "#26241F" : "transparent",
                  }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-0.5">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitTitle();
              } else if (event.key === "Escape") {
                event.preventDefault();
                setIsEditingTitle(false);
              }
            }}
            maxLength={200}
            className="w-full truncate rounded-md border border-border bg-background px-1 text-xs font-semibold outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditingTitle}
            title="Переименовать"
            className="block w-full truncate text-left text-xs font-semibold hover:underline"
          >
            {title}
          </button>
        )}
        <p className="text-[11px] text-muted-foreground">
          {formatUpdatedAt(portfolio.updated_at)}
        </p>
      </div>
    </div>
  );
}
