"use server";

import { createClient } from "@/lib/supabase/server";
import { Recipe, RecipeInsert, RecipeUpdate } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Recipe;
}

export async function createRecipe(recipe: RecipeInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .insert(recipe)
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/");
  redirect(`/recipes/${data.id}`);
}

export async function updateRecipe(
  id: string,
  recipe: RecipeUpdate
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .update(recipe)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/");
  redirect("/");
}

export async function toggleFavorite(
  id: string,
  isFavorite: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .update({ is_favorite: isFavorite })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
}
