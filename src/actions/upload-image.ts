"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadRecipeImage(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image provided" };
    }

    const supabase = await createClient();

    const ext = file.name.split(".").pop() || "jpg";
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
