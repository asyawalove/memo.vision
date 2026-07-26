"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setPortfolioVisibility } from "./actions";

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  is_public: boolean;
};

export function PortfolioCard({
  portfolio,
  username,
}: {
  portfolio: Portfolio;
  username: string;
}) {
  const [isPublic, setIsPublic] = useState(portfolio.is_public);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

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
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <Link href={`/dashboard/portfolio/${portfolio.id}/edit`} className="block">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
          {portfolio.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-black/40 dark:text-white/40">
              Нет обложки
            </div>
          )}
        </div>
        <h2 className="mt-2 truncate text-sm font-medium">{portfolio.title}</h2>
      </Link>

      <div className="flex items-center justify-between text-xs">
        <span
          className={
            isPublic
              ? "rounded-full bg-green-600/10 px-2 py-1 text-green-600"
              : "rounded-full bg-black/5 px-2 py-1 text-black/60 dark:bg-white/10 dark:text-white/60"
          }
        >
          {isPublic ? "Публично" : "Черновик"}
        </span>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            disabled={isPending}
            onChange={handleToggle}
          />
          Public
        </label>
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        disabled={!isPublic}
        className="rounded-md border border-black/15 px-3 py-2 text-xs disabled:opacity-40 dark:border-white/20"
      >
        {copied ? "Скопировано!" : "Скопировать публичную ссылку"}
      </button>
    </div>
  );
}
