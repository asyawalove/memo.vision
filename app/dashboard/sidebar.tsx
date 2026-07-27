"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Мои портфолио", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard" || pathname.startsWith("/dashboard/portfolio")
      : pathname.startsWith(href);
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-border px-4 py-6 md:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-orange text-sm font-bold">
            D.
          </div>
          <span className="text-sm font-semibold">Do.Folio</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-full bg-sidebar px-4 py-2.5 text-sm font-medium text-white"
                    : "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-foreground/70 hover:bg-black/5"
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-card px-3 py-2.5 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-pink text-xs font-semibold">
            {displayName.slice(0, 1).toUpperCase() || "?"}
          </div>
          <span className="truncate text-sm text-foreground/80">{displayName}</span>
        </div>
      </aside>

      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange text-xs font-bold">
            D.
          </div>
          <span className="text-sm font-semibold">Do.Folio</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  active ? "bg-sidebar text-white" : "text-foreground/70 hover:bg-black/5"
                }`}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
