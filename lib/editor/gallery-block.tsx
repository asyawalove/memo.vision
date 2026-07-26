"use client";

import { useRef, type ChangeEvent } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { Plus, X } from "lucide-react";

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const galleryBlockConfig = {
  type: "gallery",
  propSchema: {
    images: { default: "[]" },
  },
  content: "none",
} as const;

type GalleryRenderProps = ReactCustomBlockRenderProps<typeof galleryBlockConfig>;

function GalleryBlockContent(props: GalleryRenderProps) {
  const images = parseImages(props.block.props.images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || !props.editor.uploadFile) return;

    const uploaded: string[] = [];
    for (const file of files) {
      const result = await props.editor.uploadFile(file);
      if (typeof result === "string") {
        uploaded.push(result);
      }
    }

    props.editor.updateBlock(props.block, {
      props: { images: JSON.stringify([...images, ...uploaded]) },
    });
  }

  function removeImage(url: string) {
    props.editor.updateBlock(props.block, {
      props: { images: JSON.stringify(images.filter((image) => image !== url)) },
    });
  }

  const editable = props.editor.isEditable;

  return (
    <div className="flex w-full gap-2 overflow-x-auto rounded-xl py-2">
      {images.map((url) => (
        <div
          key={url}
          className="group relative h-40 w-56 shrink-0 overflow-hidden rounded-lg bg-black/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          {editable && (
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      {editable && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-40 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 text-xs text-black/50"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
    </div>
  );
}

export const Gallery = createReactBlockSpec(galleryBlockConfig, {
  render: GalleryBlockContent,
});
