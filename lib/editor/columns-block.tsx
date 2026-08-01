"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { BlockNoteSchema, defaultBlockSpecs, type BlockNoteEditor } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Gallery } from "./gallery-block";
import { Callout } from "./callout-block";

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 3;
const MIN_WIDTH_PERCENT = 15;
const MIN_ROW_HEIGHT = 80;

const COLUMN_KEYS = ["column1", "column2", "column3"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

// A column's content can't include another "columns" block — this schema is
// deliberately separate from the main editor schema (which registers this
// very block) to avoid a circular import and infinite nesting.
const columnContentSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    gallery: Gallery(),
    callout: Callout(),
  },
});

type ColumnPartialBlock = typeof columnContentSchema.PartialBlock;
type ColumnEditorInstance = BlockNoteEditor<
  typeof columnContentSchema.blockSchema,
  typeof columnContentSchema.inlineContentSchema,
  typeof columnContentSchema.styleSchema
>;

function parseColumnContent(raw: string): ColumnPartialBlock[] | undefined {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseWidths(raw: string, count: number): number[] {
  const parsed = raw
    .split(",")
    .map((n) => parseFloat(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (parsed.length !== count) {
    return Array(count).fill(100 / count);
  }
  return parsed;
}

function parseRowHeight(raw: string): number | null {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const columnsBlockConfig = {
  type: "columns",
  propSchema: {
    columnCount: { default: "2" },
    column1: { default: "[]" },
    column2: { default: "[]" },
    column3: { default: "[]" },
    widths: { default: "" },
    rowHeight: { default: "0" },
  },
  content: "none",
} as const;

type ColumnsRenderProps = ReactCustomBlockRenderProps<typeof columnsBlockConfig>;

function ColumnEditor({
  content,
  editable,
  hasFixedHeight,
  uploadFile,
  onChange,
}: {
  content: string;
  editable: boolean;
  hasFixedHeight: boolean;
  uploadFile: ColumnEditorInstance["uploadFile"];
  onChange: (json: string) => void;
}) {
  const columnEditor = useCreateBlockNote({
    schema: columnContentSchema,
    initialContent: parseColumnContent(content),
    uploadFile,
  });

  function handleChange() {
    onChange(JSON.stringify(columnEditor.document));
  }

  return (
    <BlockNoteView
      className={hasFixedHeight ? "sm:h-[var(--col-row-height)]" : undefined}
      editor={columnEditor}
      editable={editable}
      onChange={handleChange}
      theme="light"
    />
  );
}

function ColumnsBlockContent(props: ColumnsRenderProps) {
  const editable = props.editor.isEditable;
  const requestedCount = parseInt(props.block.props.columnCount, 10);
  const columnCount = Math.min(
    MAX_COLUMNS,
    Math.max(MIN_COLUMNS, Number.isFinite(requestedCount) ? requestedCount : MIN_COLUMNS)
  );
  const columnKeys = COLUMN_KEYS.slice(0, columnCount);

  const rowRef = useRef<HTMLDivElement>(null);
  // Only holds a value while actively dragging (live preview); otherwise
  // the committed block props are the source of truth.
  const [dragWidths, setDragWidths] = useState<number[] | null>(null);
  const [dragRowHeight, setDragRowHeight] = useState<number | null | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  const widths = dragWidths ?? parseWidths(props.block.props.widths, columnCount);
  const rowHeight =
    dragRowHeight !== undefined ? dragRowHeight : parseRowHeight(props.block.props.rowHeight);

  function updateColumn(key: ColumnKey, json: string) {
    props.editor.updateBlock(props.block, {
      props: { [key]: json },
    });
  }

  function startWidthDrag(index: number, event: ReactPointerEvent) {
    if (!editable) return;
    event.preventDefault();
    const rowWidthPx = rowRef.current?.getBoundingClientRect().width || 1;
    const startX = event.clientX;
    const startWidths = widths;
    let latest = startWidths;
    setIsDragging(true);

    function handleMove(moveEvent: PointerEvent) {
      const deltaPercent = ((moveEvent.clientX - startX) / rowWidthPx) * 100;
      let left = startWidths[index] + deltaPercent;
      let right = startWidths[index + 1] - deltaPercent;
      if (left < MIN_WIDTH_PERCENT) {
        right -= MIN_WIDTH_PERCENT - left;
        left = MIN_WIDTH_PERCENT;
      }
      if (right < MIN_WIDTH_PERCENT) {
        left -= MIN_WIDTH_PERCENT - right;
        right = MIN_WIDTH_PERCENT;
      }
      const next = [...startWidths];
      next[index] = left;
      next[index + 1] = right;
      latest = next;
      setDragWidths(next);
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      setIsDragging(false);
      setDragWidths(null);
      // Deferred so this runs after the current event/render cycle — calling
      // updateBlock synchronously from a raw DOM listener can otherwise hit
      // BlockNote's node-view react renderer mid-render.
      setTimeout(() => {
        props.editor.updateBlock(props.block, {
          props: { widths: latest.map((n) => n.toFixed(2)).join(",") },
        });
      }, 0);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function startHeightDrag(event: ReactPointerEvent) {
    if (!editable) return;
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = rowHeight ?? rowRef.current?.getBoundingClientRect().height ?? 240;
    let latest = startHeight;
    setIsDragging(true);

    function handleMove(moveEvent: PointerEvent) {
      const next = Math.max(MIN_ROW_HEIGHT, startHeight + (moveEvent.clientY - startY));
      latest = next;
      setDragRowHeight(next);
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      setIsDragging(false);
      setDragRowHeight(undefined);
      setTimeout(() => {
        props.editor.updateBlock(props.block, {
          props: { rowHeight: String(Math.round(latest)) },
        });
      }, 0);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function resetHeight() {
    if (!editable) return;
    setDragRowHeight(undefined);
    props.editor.updateBlock(props.block, { props: { rowHeight: "0" } });
  }

  return (
    <div className={`w-full ${isDragging ? "select-none" : ""}`}>
      <div
        ref={rowRef}
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0"
        style={rowHeight ? ({ "--col-row-height": `${rowHeight}px` } as CSSProperties) : undefined}
      >
        {columnKeys.map((key, index) => (
          <div
            key={key}
            className="flex w-full min-w-0 shrink-0 grow-0 basis-auto sm:basis-[var(--col-basis)]"
            style={{ "--col-basis": `${widths[index]}%` } as CSSProperties}
          >
            <div
              className={`bn-column-editor w-full min-w-0 overflow-x-auto rounded-lg transition-colors sm:overflow-y-auto ${
                editable ? "hover:bg-black/[0.025]" : ""
              }`}
            >
              <ColumnEditor
                content={props.block.props[key]}
                editable={editable}
                hasFixedHeight={rowHeight !== null}
                uploadFile={props.editor.uploadFile}
                onChange={(json) => updateColumn(key, json)}
              />
            </div>

            {editable && index < columnCount - 1 && (
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={(event) => startWidthDrag(index, event)}
                className="hidden w-4 shrink-0 cursor-col-resize items-center justify-center sm:flex"
              >
                <div className="h-8 w-0.5 rounded-full bg-black/10 transition-colors hover:bg-black/30" />
              </div>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <div className="mt-1 hidden items-center justify-center gap-2 sm:flex">
          <div
            onPointerDown={startHeightDrag}
            title="Изменить высоту колонок"
            className="flex h-3 w-10 cursor-row-resize items-center justify-center"
          >
            <div className="h-0.5 w-10 rounded-full bg-black/10 transition-colors hover:bg-black/30" />
          </div>
          {rowHeight !== null && (
            <button
              type="button"
              onClick={resetHeight}
              className="text-[11px] text-muted-foreground underline"
            >
              Сбросить высоту
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const Columns = createReactBlockSpec(columnsBlockConfig, {
  render: ColumnsBlockContent,
});
