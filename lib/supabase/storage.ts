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

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
