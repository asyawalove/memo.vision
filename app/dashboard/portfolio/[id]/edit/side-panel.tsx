"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ComponentType } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronRight,
  Code,
  Columns2,
  Columns3,
  GalleryHorizontal,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Image as ImageIcon,
  List,
  ListOrdered,
  Megaphone,
  Minus,
  Pipette,
  Strikethrough,
  Table as TableIcon,
  Type,
  Upload,
} from "lucide-react";
import type { PortfolioEditorInstance } from "@/lib/editor/schema";
import { FONT_OPTIONS, type PortfolioFont } from "@/lib/fonts";
import { uploadPortfolioImage } from "@/lib/supabase/storage";

type Tab = "insert" | "format" | "style";

export type PortfolioStyleValues = {
  backgroundColor: string;
  textColor: string;
  fontFamily: PortfolioFont;
  coverImageUrl: string | null;
};

const BG_PRESETS = ["#F7F5F2", "#FFFFFF", "#FFD6E8", "#C4E86B", "#FF8A4C", "#1A1A1A"];
const TEXT_PRESETS = ["#26241F", "#FFFFFF", "#8A8578"];

const TABS: { value: Tab; label: string }[] = [
  { value: "insert", label: "Insert" },
  { value: "format", label: "Format" },
  { value: "style", label: "Style" },
];

function PanelRow({
  icon: Icon,
  label,
  onClick,
  active,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        active ? "bg-foreground text-background" : "text-foreground hover:bg-black/5"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground">{children}</p>;
}

export function EditorSidePanel({
  editor,
  portfolioId,
  userId,
  style,
  onStyleChange,
}: {
  editor: PortfolioEditorInstance;
  portfolioId: string;
  userId: string;
  style: PortfolioStyleValues;
  onStyleChange: (next: Partial<PortfolioStyleValues>) => void;
}) {
  const [tab, setTab] = useState<Tab>("insert");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStyles, setActiveStyles] = useState<{
    bold?: boolean;
    italic?: boolean;
    strike?: boolean;
  }>({});
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleTabClick(value: Tab) {
    if (value === tab && mobileOpen) {
      setMobileOpen(false);
    } else {
      setTab(value);
      setMobileOpen(true);
    }
  }

  useEffect(() => {
    function refresh() {
      const active = editor.getActiveStyles();
      setActiveStyles({ bold: active.bold, italic: active.italic, strike: active.strike });
    }
    refresh();
    return editor.onSelectionChange(refresh);
  }, [editor]);

  function insertBlock(block: Parameters<PortfolioEditorInstance["insertBlocks"]>[0][number]) {
    const current = editor.getTextCursorPosition().block;
    const [inserted] = editor.insertBlocks([block], current, "after");
    editor.setTextCursorPosition(inserted, "end");
    editor.focus();
  }

  function toggleStyle(key: "bold" | "italic" | "strike") {
    editor.toggleStyles({ [key]: true });
    const active = editor.getActiveStyles();
    setActiveStyles({ bold: active.bold, italic: active.italic, strike: active.strike });
    editor.focus();
  }

  function setBlockType(type: "bulletListItem" | "numberedListItem" | "paragraph") {
    try {
      const block = editor.getTextCursorPosition().block;
      editor.updateBlock(block, { type } as Parameters<PortfolioEditorInstance["updateBlock"]>[1]);
    } catch {
      // current block doesn't support this conversion; ignore
    }
    editor.focus();
  }

  function setAlignment(textAlignment: "left" | "center" | "right" | "justify") {
    try {
      const block = editor.getTextCursorPosition().block;
      editor.updateBlock(block, {
        props: { textAlignment },
      } as Parameters<PortfolioEditorInstance["updateBlock"]>[1]);
    } catch {
      // block type has no textAlignment prop; ignore
    }
    editor.focus();
  }

  function indent() {
    if (editor.canNestBlock()) editor.nestBlock();
    editor.focus();
  }

  function outdent() {
    if (editor.canUnnestBlock()) editor.unnestBlock();
    editor.focus();
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadPortfolioImage(file, userId, portfolioId);
      onStyleChange({ coverImageUrl: url });
    } catch {
      // best-effort; validation errors are silently ignored here, the
      // main content upload path already surfaces these to the user
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 flex max-h-[70vh] flex-col-reverse border-t border-border bg-background shadow-[0_-2px_12px_rgba(38,36,31,0.08)] md:static md:inset-auto md:z-auto md:max-h-none md:w-64 md:shrink-0 md:flex-col md:border-l md:border-t-0 md:shadow-none">
      <div className="flex shrink-0 gap-1 border-t border-border p-2 md:border-b md:border-t-0">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleTabClick(t.value)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-black/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className={`overflow-y-auto p-2 md:block md:flex-1 ${mobileOpen ? "block" : "hidden"}`}
      >
        {tab === "insert" && (
          <div className="flex flex-col gap-0.5">
            <PanelRow icon={Type} label="Текст" onClick={() => insertBlock({ type: "paragraph" })} />
            <PanelRow
              icon={ImageIcon}
              label="Изображение"
              onClick={() => insertBlock({ type: "image" })}
            />
            <PanelRow
              icon={GalleryHorizontal}
              label="Галерея"
              onClick={() => insertBlock({ type: "gallery" })}
            />
            <PanelRow
              icon={TableIcon}
              label="Таблица"
              onClick={() =>
                insertBlock({
                  type: "table",
                  content: {
                    type: "tableContent",
                    rows: [{ cells: ["", "", ""] }, { cells: ["", "", ""] }],
                  },
                } as Parameters<typeof insertBlock>[0])
              }
            />
            <PanelRow icon={Code} label="Код" onClick={() => insertBlock({ type: "codeBlock" })} />
            <PanelRow
              icon={Minus}
              label="Разделитель"
              onClick={() => insertBlock({ type: "divider" })}
            />
            <PanelRow
              icon={Megaphone}
              label="Плашка"
              title={'Например: "Моя роль", "Инструменты", "Ключевой инсайт"'}
              onClick={() => insertBlock({ type: "callout" })}
            />
            <PanelRow
              icon={ChevronRight}
              label="Сворачиваемый блок"
              title={'Например: "Показать процесс/итерации"'}
              onClick={() => insertBlock({ type: "toggleListItem" })}
            />
            <PanelRow
              icon={Columns2}
              label="2 колонки"
              onClick={() =>
                insertBlock({
                  type: "columns",
                  props: { columnCount: "2" },
                } as Parameters<typeof insertBlock>[0])
              }
            />
            <PanelRow
              icon={Columns3}
              label="3 колонки"
              onClick={() =>
                insertBlock({
                  type: "columns",
                  props: { columnCount: "3" },
                } as Parameters<typeof insertBlock>[0])
              }
            />
          </div>
        )}

        {tab === "format" && (
          <div className="flex flex-col gap-0.5">
            <SectionLabel>Текст</SectionLabel>
            <PanelRow
              icon={Bold}
              label="Жирный"
              active={!!activeStyles.bold}
              onClick={() => toggleStyle("bold")}
            />
            <PanelRow
              icon={Italic}
              label="Курсив"
              active={!!activeStyles.italic}
              onClick={() => toggleStyle("italic")}
            />
            <PanelRow
              icon={Strikethrough}
              label="Зачёркнутый"
              active={!!activeStyles.strike}
              onClick={() => toggleStyle("strike")}
            />

            <SectionLabel>Списки</SectionLabel>
            <PanelRow
              icon={List}
              label="Маркированный список"
              onClick={() => setBlockType("bulletListItem")}
            />
            <PanelRow
              icon={ListOrdered}
              label="Нумерованный список"
              onClick={() => setBlockType("numberedListItem")}
            />

            <SectionLabel>Выравнивание</SectionLabel>
            <div className="flex gap-1 px-1">
              <button
                type="button"
                aria-label="Выровнять по левому краю"
                onClick={() => setAlignment("left")}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <AlignLeft className="mx-auto h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Выровнять по центру"
                onClick={() => setAlignment("center")}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <AlignCenter className="mx-auto h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Выровнять по правому краю"
                onClick={() => setAlignment("right")}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <AlignRight className="mx-auto h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Выровнять по ширине"
                onClick={() => setAlignment("justify")}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <AlignJustify className="mx-auto h-4 w-4" />
              </button>
            </div>

            <SectionLabel>Отступ</SectionLabel>
            <div className="flex gap-1 px-1">
              <button
                type="button"
                aria-label="Уменьшить отступ"
                onClick={outdent}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <IndentDecrease className="mx-auto h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Увеличить отступ"
                onClick={indent}
                className="flex-1 rounded-lg p-2 text-foreground hover:bg-black/5"
              >
                <IndentIncrease className="mx-auto h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {tab === "style" && (
          <div className="flex flex-col gap-0.5">
            <SectionLabel>Обложка</SectionLabel>
            <div className="px-3 pb-2">
              {style.coverImageUrl && (
                <div className="mb-2 aspect-video w-full overflow-hidden rounded-lg bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={style.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingCover
                  ? "Загрузка..."
                  : style.coverImageUrl
                    ? "Заменить обложку"
                    : "Загрузить обложку"}
              </button>
              {style.coverImageUrl && (
                <button
                  type="button"
                  onClick={() => onStyleChange({ coverImageUrl: null })}
                  className="mt-1 w-full text-center text-xs text-muted-foreground underline"
                >
                  Убрать обложку
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            <SectionLabel>Фон страницы</SectionLabel>
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {BG_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onStyleChange({ backgroundColor: color })}
                  className="h-7 w-7 rounded-full border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: style.backgroundColor === color ? "#26241F" : "transparent",
                  }}
                  aria-label={color}
                />
              ))}
              <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-black/25">
                <Pipette className="pointer-events-none h-3.5 w-3.5" />
                <input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(event) => onStyleChange({ backgroundColor: event.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>

            <SectionLabel>Цвет текста</SectionLabel>
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {TEXT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onStyleChange({ textColor: color })}
                  className="h-7 w-7 rounded-full border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: style.textColor === color ? "#26241F" : "transparent",
                  }}
                  aria-label={color}
                />
              ))}
              <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-black/25">
                <Pipette className="pointer-events-none h-3.5 w-3.5" />
                <input
                  type="color"
                  value={style.textColor}
                  onChange={(event) => onStyleChange({ textColor: event.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>

            <SectionLabel>Шрифт</SectionLabel>
            <div className="flex flex-col gap-1 px-3">
              {FONT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStyleChange({ fontFamily: option.value })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${option.className} ${
                    style.fontFamily === option.value
                      ? "border-foreground"
                      : "border-border"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
