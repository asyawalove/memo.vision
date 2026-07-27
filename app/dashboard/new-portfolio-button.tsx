"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createPortfolio } from "./actions";

export function NewPortfolioButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => createPortfolio())}
      className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 text-muted-foreground transition-colors hover:border-black/35 hover:text-foreground disabled:opacity-60"
    >
      <Plus className="h-6 w-6" />
      <span className="text-sm font-medium">Новое портфолио</span>
    </button>
  );
}
