import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";

const portfolioInter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-portfolio-inter",
});

const portfolioSerif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-portfolio-serif",
});

const portfolioMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-portfolio-mono",
});

export type PortfolioFont = "inter" | "serif" | "mono";

export const FONT_OPTIONS: { value: PortfolioFont; label: string; className: string }[] = [
  { value: "inter", label: "Inter", className: portfolioInter.className },
  { value: "serif", label: "Playfair Display", className: portfolioSerif.className },
  { value: "mono", label: "JetBrains Mono", className: portfolioMono.className },
];

export function getFontClassName(font: string): string {
  return FONT_OPTIONS.find((option) => option.value === font)?.className ?? FONT_OPTIONS[0].className;
}
