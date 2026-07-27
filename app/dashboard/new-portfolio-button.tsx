"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createPortfolio } from "./actions";

export function NewPortfolioButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createPortfolio();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-black/20 p-2 text-center text-muted-foreground transition-colors hover:border-black/35 hover:text-foreground disabled:opacity-60"
      >
        <Plus className="h-5 w-5 shrink-0" />
        <span className="text-xs font-medium leading-tight">
          {isPending ? "Создаём..." : "Новое портфолио"}
        </span>
      </button>
      {error && <p className="px-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
