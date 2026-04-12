"use server";

import { sql } from "@/lib/db";
import { Recipe, RecipeInsert, RecipeUpdate } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRecipes(): Promise<Recipe[]> {
  const rows = await sql`SELECT * FROM recipes ORDER BY created_at DESC`;
  return rows as Recipe[];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const rows = await sql`SELECT * FROM recipes WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return rows[0] as Recipe;
}

export async function createRecipe(recipe: RecipeInsert): Promise<string> {
  const rows = await sql`
    INSERT INTO recipes (title, description, ingredients, steps, prep_time, cook_time, servings, source_url, image_url, tags, notes, is_favorite, categories)
    VALUES (
      ${recipe.title},
      ${recipe.description},
      ${JSON.stringify(recipe.ingredients)},
      ${JSON.stringify(recipe.steps)},
      ${recipe.prep_time},
      ${recipe.cook_time},
      ${recipe.servings},
      ${recipe.source_url},
      ${recipe.image_url},
      ${recipe.tags},
      ${recipe.notes},
      ${recipe.is_favorite},
      ${recipe.categories}
    )
    RETURNING id
  `;

  revalidatePath("/");
  redirect(`/recipes/${rows[0].id}`);
}

export async function updateRecipe(
  id: string,
  recipe: RecipeUpdate
): Promise<void> {
  await sql`
    UPDATE recipes SET
      title = COALESCE(${recipe.title ?? null}, title),
      description = COALESCE(${recipe.description ?? null}, description),
      ingredients = COALESCE(${recipe.ingredients ? JSON.stringify(recipe.ingredients) : null}, ingredients),
      steps = COALESCE(${recipe.steps ? JSON.stringify(recipe.steps) : null}, steps),
      prep_time = COALESCE(${recipe.prep_time ?? null}, prep_time),
      cook_time = COALESCE(${recipe.cook_time ?? null}, cook_time),
      servings = COALESCE(${recipe.servings ?? null}, servings),
      source_url = COALESCE(${recipe.source_url ?? null}, source_url),
      image_url = COALESCE(${recipe.image_url ?? null}, image_url),
      tags = COALESCE(${recipe.tags ?? null}, tags),
      notes = COALESCE(${recipe.notes ?? null}, notes),
      is_favorite = COALESCE(${recipe.is_favorite ?? null}, is_favorite),
      categories = COALESCE(${recipe.categories ?? null}, categories)
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id: string): Promise<void> {
  await sql`DELETE FROM recipes WHERE id = ${id}`;

  revalidatePath("/");
  redirect("/");
}

export async function toggleFavorite(
  id: string,
  isFavorite: boolean
): Promise<void> {
  await sql`UPDATE recipes SET is_favorite = ${isFavorite} WHERE id = ${id}`;

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
}
