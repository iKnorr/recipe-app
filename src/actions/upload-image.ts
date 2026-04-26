"use server";

import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

async function validateImageFile(
  file: File
): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be under 10 MB");
  }

  const buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const patterns = MAGIC_BYTES[file.type];
  if (patterns) {
    const matches = patterns.some((pattern) =>
      pattern.every((byte, i) => buffer[i] === byte)
    );
    if (!matches) {
      throw new Error("File content does not match its declared type");
    }
  }

  return ext;
}

export async function uploadRecipeImage(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image provided" };
    }

    const ext = await validateImageFile(file);
    const supabase = await createClient();

    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, file);

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}
