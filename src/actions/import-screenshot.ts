"use server";

import { extractRecipeFromImages } from "@/lib/ai-extractor";
import { RecipeInsert } from "@/lib/types";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

export async function importFromScreenshot(
  formData: FormData
): Promise<
  { success: true; recipe: RecipeInsert } | { success: false; error: string }
> {
  try {
    const files = formData.getAll("images") as File[];
    if (!files.length) {
      return { success: false, error: "No images provided" };
    }

    if (files.length > MAX_FILES) {
      return { success: false, error: `Maximum ${MAX_FILES} images allowed` };
    }

    const images = await Promise.all(
      files.map(async (file) => {
        if (!SUPPORTED_TYPES.includes(file.type)) {
          throw new Error(
            `Unsupported format: ${file.name}. Use JPEG, PNG, WebP, or GIF.`
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `File too large: ${file.name}. Maximum size is 10 MB.`
          );
        }
        const bytes = await file.arrayBuffer();
        return {
          base64: Buffer.from(bytes).toString("base64"),
          mediaType: file.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/gif",
        };
      })
    );

    const extracted = await extractRecipeFromImages(images);

    const recipe: RecipeInsert = {
      title: extracted.title,
      description: extracted.description,
      ingredients: extracted.ingredients,
      steps: extracted.steps,
      prep_time: extracted.prep_time,
      cook_time: extracted.cook_time,
      servings: extracted.servings,
      source_url: null,
      image_url: null,
      tags: [],
      notes: null,
      is_favorite: false,
      categories: [],
    };

    return { success: true, recipe };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to extract recipe from image(s)",
    };
  }
}
