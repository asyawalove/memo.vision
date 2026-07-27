"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Palette, Share2 } from "lucide-react";
import { setPortfolioCoverStyle, setPortfolioVisibility } from "./actions";
import {
  COVER_COLORS,
  COVER_PATTERNS,
  getCoverPatternStyle,
  parseCoverStyle,
  type PortfolioCoverStyle,
} from "@/lib/cover-patterns";

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  is_public: boolean;
  updated_at: string;
  cover_style: unknown;
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

export function PortfolioCard({
  portfolio,
  username,
}: {
  portfolio: Portfolio;
  username: string;
}) {
  const [isPublic, setIsPublic] = useState(portfolio.is_public);
  const [coverStyle, setCoverStyle] = useState<PortfolioCoverStyle>(
    parseCoverStyle(portfolio.cover_style)
  );
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative">
        <Link href={`/dashboard/portfolio/${portfolio.id}/edit`} className="block">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-md"
            style={getCoverPatternStyle(coverStyle.pattern, coverStyle.color)}
          >
            <div className="absolute inset-y-0 left-0 w-2.5 bg-black/15" />
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="w-full max-w-[82%] rounded-sm border-2 border-black/25 bg-[#FBF8F1]/90 px-3 py-4 text-center shadow-sm">
                <p className="line-clamp-4 text-sm font-semibold text-foreground">
                  {portfolio.title}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleShare();
            }}
            aria-label="Поделиться"
            title="Поделиться публичной ссылкой"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setPickerOpen((value) => !value);
            }}
            aria-label="Изменить обложку"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-foreground opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
        </div>

        {pickerOpen && (
          <div
            ref={pickerRef}
            onClick={(event) => event.stopPropagation()}
            className="absolute right-2 top-11 z-20 w-56 rounded-xl bg-white p-3 shadow-lg"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Узор</p>
            <div className="mb-3 grid grid-cols-5 gap-2">
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
                  className={`h-8 w-8 rounded-md border-2 ${
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
        <p className="truncate text-sm font-semibold">{portfolio.title}</p>
        <p className="text-xs text-muted-foreground">{formatUpdatedAt(portfolio.updated_at)}</p>
      </div>
    </div>
  );
}
