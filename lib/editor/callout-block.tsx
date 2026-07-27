"use client";

import { useEffect, useRef, useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { COVER_COLORS } from "@/lib/cover-patterns";

const EMOJI_OPTIONS = [
  "💡",
  "🎯",
  "🛠️",
  "⚡",
  "📌",
  "✅",
  "⚠️",
  "🔥",
  "🚀",
  "💬",
  "📊",
  "🎨",
  "🧠",
  "📷",
  "🔗",
  "❤️",
  "👍",
  "📝",
  "🌟",
  "🧩",
];

const calloutBlockConfig = {
  type: "callout",
  propSchema: {
    icon: { default: "💡" },
    backgroundColor: { default: COVER_COLORS[4] },
  },
  content: "inline",
} as const;

type CalloutRenderProps = ReactCustomBlockRenderProps<typeof calloutBlockConfig>;

function CalloutBlockContent(props: CalloutRenderProps) {
  const { icon, backgroundColor } = props.block.props;
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const editable = props.editor.isEditable;

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  function setIcon(nextIcon: string) {
    props.editor.updateBlock(props.block, { props: { icon: nextIcon } });
  }

  function setColor(nextColor: string) {
    props.editor.updateBlock(props.block, { props: { backgroundColor: nextColor } });
  }

  return (
    <div
      className="relative flex w-full items-start gap-3 rounded-xl p-4"
      style={{ backgroundColor }}
    >
      <button
        type="button"
        onClick={() => editable && setPickerOpen((value) => !value)}
        disabled={!editable}
        aria-label="Выбрать иконку и цвет"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg leading-none hover:bg-black/10 disabled:cursor-text"
      >
        {icon}
      </button>

      <div
        ref={(node) => props.contentRef(node)}
        className="min-w-0 flex-1 pt-0.5 text-sm"
      />

      {pickerOpen && (
        <div
          ref={pickerRef}
          onClick={(event) => event.stopPropagation()}
          className="absolute left-0 top-11 z-20 w-64 rounded-xl bg-white p-3 shadow-lg"
        >
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Иконка</p>
          <div className="mb-3 grid grid-cols-7 gap-1">
            {EMOJI_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIcon(option)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-base hover:bg-black/5 ${
                  icon === option ? "bg-black/10" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Цвет</p>
          <div className="flex flex-wrap gap-2">
            {COVER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setColor(color)}
                aria-label={color}
                className="h-6 w-6 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: backgroundColor === color ? "#26241F" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const Callout = createReactBlockSpec(calloutBlockConfig, {
  render: CalloutBlockContent,
});
