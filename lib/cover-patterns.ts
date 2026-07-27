import type { CSSProperties } from "react";

export type CoverPattern =
  | "solid"
  | "dots"
  | "stripes-diagonal"
  | "stripes-horizontal"
  | "grid"
  | "crosshatch"
  | "checks"
  | "waves"
  | "fabric"
  | "speckle";

export type PortfolioCoverStyle = {
  pattern: CoverPattern;
  color: string;
};

export const DEFAULT_COVER_STYLE: PortfolioCoverStyle = {
  pattern: "dots",
  color: "#FFD6E8",
};

export const COVER_COLORS = [
  "#FFD6E8",
  "#C4E86B",
  "#FF8A4C",
  "#A8D8FF",
  "#FFE29A",
  "#D8C4F0",
];

export const COVER_PATTERNS: { value: CoverPattern; label: string }[] = [
  { value: "solid", label: "Однотонный" },
  { value: "dots", label: "Горошек" },
  { value: "stripes-diagonal", label: "Диагональ" },
  { value: "stripes-horizontal", label: "Полоски" },
  { value: "grid", label: "Клетка" },
  { value: "crosshatch", label: "Штриховка" },
  { value: "checks", label: "Шахматка" },
  { value: "waves", label: "Волны" },
  { value: "fabric", label: "Ткань" },
  { value: "speckle", label: "Крапинки" },
];

function fabricNoiseDataUri() {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='saturate' values='0'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function getCoverPatternStyle(pattern: CoverPattern, color: string): CSSProperties {
  switch (pattern) {
    case "solid":
      return { backgroundColor: color };

    case "dots":
      return {
        backgroundColor: color,
        backgroundImage: "radial-gradient(rgba(0,0,0,0.2) 1.5px, transparent 1.5px)",
        backgroundSize: "14px 14px",
      };

    case "stripes-diagonal":
      return {
        backgroundColor: color,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(0,0,0,0.14) 0 6px, transparent 6px 16px)",
      };

    case "stripes-horizontal":
      return {
        backgroundColor: color,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 4px, transparent 4px 14px)",
      };

    case "grid":
      return {
        backgroundColor: color,
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      };

    case "crosshatch":
      return {
        backgroundColor: color,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 10px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 10px)",
      };

    case "checks":
      return {
        backgroundColor: color,
        backgroundImage:
          "linear-gradient(45deg, rgba(0,0,0,0.14) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.14) 75%), linear-gradient(45deg, rgba(0,0,0,0.14) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.14) 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      };

    case "waves":
      return {
        backgroundColor: color,
        backgroundImage:
          "radial-gradient(circle at 50% 100%, transparent 8px, rgba(0,0,0,0.12) 9px, rgba(0,0,0,0.12) 10px, transparent 11px)",
        backgroundSize: "20px 20px",
      };

    case "fabric":
      return {
        backgroundColor: color,
        backgroundImage: fabricNoiseDataUri(),
        backgroundBlendMode: "overlay",
      };

    case "speckle":
      return {
        backgroundColor: color,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)",
        backgroundSize: "9px 9px, 13px 13px",
        backgroundPosition: "0 0, 4px 6px",
      };

    default:
      return { backgroundColor: color };
  }
}

export function parseCoverStyle(raw: unknown): PortfolioCoverStyle {
  if (
    raw &&
    typeof raw === "object" &&
    "pattern" in raw &&
    "color" in raw &&
    typeof (raw as { pattern: unknown }).pattern === "string" &&
    typeof (raw as { color: unknown }).color === "string"
  ) {
    return raw as PortfolioCoverStyle;
  }
  return DEFAULT_COVER_STYLE;
}
