"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Copy, ImageOff } from "lucide-react";
import { setPortfolioVisibility } from "./actions";

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  is_public: boolean;
};

const COVER_ACCENTS = ["bg-accent-pink", "bg-accent-lime", "bg-accent-orange"];

export function PortfolioCard({
  portfolio,
  username,
  accentIndex,
}: {
  portfolio: Portfolio;
  username: string;
  accentIndex: number;
}) {
  const [isPublic, setIsPublic] = useState(portfolio.is_public);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const accent = COVER_ACCENTS[accentIndex % COVER_ACCENTS.length];

  function handleToggle() {
    const next = !isPublic;
    setIsPublic(next);
    startTransition(async () => {
      await setPortfolioVisibility(portfolio.id, next);
    });
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/u/${username}/${portfolio.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-4 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
      <Link href={`/dashboard/portfolio/${portfolio.id}/edit`} className="block">
        <div
          className={`aspect-video w-full overflow-hidden rounded-2xl ${
            portfolio.cover_image_url ? "bg-black/5" : accent
          }`}
        >
          {portfolio.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground/40">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
        <h2 className="mt-3 truncate text-base font-semibold">{portfolio.title}</h2>
      </Link>

      <div className="flex items-center justify-between">
        <span
          className={
            isPublic
              ? "rounded-full bg-accent-lime/60 px-3 py-1 text-xs font-medium text-foreground"
              : "rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {isPublic ? "Опубликовано" : "Черновик"}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="Публичный доступ"
          disabled={isPending}
          onClick={handleToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            isPublic ? "bg-foreground" : "bg-black/10"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        disabled={!isPublic}
        className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-foreground disabled:opacity-40"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Скопировано!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Скопировать ссылку
          </>
        )}
      </button>
    </div>
  );
}
