"use client";

import dynamic from "next/dynamic";

export const PortfolioView = dynamic(
  () => import("./portfolio-view").then((mod) => mod.PortfolioView),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-black/60 dark:text-white/60">
        Загрузка...
      </div>
    ),
  }
);
