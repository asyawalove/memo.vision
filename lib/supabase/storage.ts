import { createClient } from "@/lib/supabase/client";

const BUCKET = "portfolio-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadPortfolioImage(
  file: File,
  userId: string,
  portfolioId: string
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Можно загружать только изображения");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Максимальный размер файла — 5MB");
  }

  const extension =
    (file.name.split(".").pop() ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) ||
    "bin";
  const path = `${userId}/${portfolioId}/${crypto.randomUUID()}.${extension}`;

  // Reconstructing the file as a fresh in-memory Blob works around a known
  // Safari/WebKit bug where fetch() sends an empty body for a File taken
  // straight from the photo library inside FormData.
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], { type: file.type });

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: file.type,
  });

  if (error) {
    console.error("[storage] upload failed:", {
      message: error.message,
      name: error.name,
      file: file.name,
      size: file.size,
      type: file.type,
      path,
    });
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
