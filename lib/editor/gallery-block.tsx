"use client";

import { useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import type { ReactCustomBlockRenderProps } from "@blocknote/react";
import { Images, Plus, X } from "lucide-react";
import { GalleryLightbox } from "./gallery-lightbox";

const MIN_IMAGES = 2;
const MAX_IMAGES = 6;

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const editable = props.editor.isEditable;

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || !props.editor.uploadFile) return;

    setError(null);

    if (images.length === 0 && files.length < MIN_IMAGES) {
      setError(`Выберите минимум ${MIN_IMAGES} изображения`);
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    const truncated = files.length > filesToUpload.length;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      let failedCount = 0;

      for (const file of filesToUpload) {
        try {
          const result = await props.editor.uploadFile(file);
          if (typeof result === "string") {
            uploaded.push(result);
          }
        } catch (thrown) {
          failedCount += 1;
          console.error("[gallery] upload failed for", file.name, thrown);
        }
      }

      if (uploaded.length > 0) {
        props.editor.updateBlock(props.block, {
          props: { images: JSON.stringify([...images, ...uploaded]) },
        });
      }

      if (failedCount > 0) {
        setError(
          failedCount === 1
            ? "Одно из фото не загрузилось, попробуйте ещё раз"
            : `${failedCount} фото не загрузилось, попробуйте ещё раз`
        );
      } else if (truncated) {
        setError(`Можно добавить максимум ${MAX_IMAGES} изображений — часть файлов не загружена`);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    props.editor.updateBlock(props.block, {
      props: { images: JSON.stringify(images.filter((image) => image !== url)) },
    });
  }

  const fileInput = editable && (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleFilesSelected}
    />
  );

  if (images.length === 0) {
    if (!editable) return null;

    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 p-8 text-center">
        <Images className="h-6 w-6 text-black/40" />
        <p className="text-sm font-medium text-black/60">Галерея изображений</p>
        <p className="text-xs text-black/40">
          Выберите от {MIN_IMAGES} до {MAX_IMAGES} фото
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-1 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-60"
        >
          {uploading ? "Загрузка..." : "Загрузить фото"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {fileInput}
      </div>
    );
  }

  const columns = Math.min(images.length, MAX_IMAGES);

  return (
    <div className="w-full">
      <div
        className="grid gap-2 grid-cols-[repeat(var(--gallery-cols),minmax(0,1fr))] max-sm:!grid-cols-2"
        style={{ "--gallery-cols": columns } as CSSProperties}
      >
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative h-48 overflow-hidden rounded-lg bg-black/5"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="block h-full w-full"
              aria-label="Открыть изображение"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
            {editable && (
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Удалить изображение"
                className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {editable && images.length < MAX_IMAGES && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/20 px-3 py-1.5 text-xs text-black/50 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          {uploading
            ? "Загрузка..."
            : `Добавить ещё (${images.length}/${MAX_IMAGES})`}
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {fileInput}

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

export const Gallery = createReactBlockSpec(galleryBlockConfig, {
  render: GalleryBlockContent,
});
