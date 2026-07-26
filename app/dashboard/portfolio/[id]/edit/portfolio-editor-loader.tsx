"use client";

import dynamic from "next/dynamic";

export const PortfolioEditor = dynamic(
  () => import("./editor").then((mod) => mod.PortfolioEditor),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-black/60 dark:text-white/60">
        Загрузка редактора...
      </div>
    ),
  }
);
