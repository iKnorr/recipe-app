"use server";

import { createClient } from "@/lib/supabase/server";
import { CookingTip, CookingTipInsert } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getTips(): Promise<CookingTip[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cooking_tips")
    .select("*")
    .order("category")
    .order("title");

  if (error) throw error;
  return data as CookingTip[];
}

export async function getTip(id: string): Promise<CookingTip | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cooking_tips")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as CookingTip;
}

export async function createTip(tip: CookingTipInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cooking_tips")
    .insert(tip)
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/tips");
  redirect(`/tips/${data.id}`);
}

export async function updateTip(
  id: string,
  tip: CookingTipInsert
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cooking_tips")
    .update(tip)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/tips");
  revalidatePath(`/tips/${id}`);
  redirect(`/tips/${id}`);
}

export async function deleteTip(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cooking_tips")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/tips");
  redirect("/tips");
}
