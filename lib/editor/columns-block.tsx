"use client";

import { BlockNoteSchema, defaultBlockSpecs, type BlockNoteEditor } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Gallery } from "./gallery-block";
import { Callout } from "./callout-block";

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 3;

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

const columnsBlockConfig = {
  type: "columns",
  propSchema: {
    columnCount: { default: "2" },
    column1: { default: "[]" },
    column2: { default: "[]" },
    column3: { default: "[]" },
  },
  content: "none",
} as const;

type ColumnsRenderProps = ReactCustomBlockRenderProps<typeof columnsBlockConfig>;

function ColumnEditor({
  content,
  editable,
  uploadFile,
  onChange,
}: {
  content: string;
  editable: boolean;
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
    <div
      className={`bn-column-editor min-w-0 flex-1 rounded-lg transition-colors ${
        editable ? "hover:bg-black/[0.025]" : ""
      }`}
    >
      <BlockNoteView editor={columnEditor} editable={editable} onChange={handleChange} theme="light" />
    </div>
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

  function updateColumn(key: ColumnKey, json: string) {
    props.editor.updateBlock(props.block, {
      props: { [key]: json },
    });
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-8" data-content-type="columns">
      {columnKeys.map((key) => (
        <ColumnEditor
          key={key}
          content={props.block.props[key]}
          editable={editable}
          uploadFile={props.editor.uploadFile}
          onChange={(json) => updateColumn(key, json)}
        />
      ))}
    </div>
  );
}

export const Columns = createReactBlockSpec(columnsBlockConfig, {
  render: ColumnsBlockContent,
});
