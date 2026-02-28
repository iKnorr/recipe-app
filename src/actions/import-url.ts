"use server";

import { parseRecipeFromUrl } from "@/lib/recipe-parser";
import { RecipeInsert } from "@/lib/types";

export async function importFromUrl(
  url: string
): Promise<{ success: true; recipe: RecipeInsert } | { success: false; error: string }> {
  try {
    const parsed = await parseRecipeFromUrl(url);

    const recipe: RecipeInsert = {
      title: parsed.title,
      description: parsed.description,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      prep_time: parsed.prep_time,
      cook_time: parsed.cook_time,
      servings: parsed.servings,
      source_url: parsed.source_url,
      image_url: parsed.image_url,
      tags: [],
      notes: null,
      is_favorite: false,
    };

    return { success: true, recipe };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to import recipe",
    };
  }
}
