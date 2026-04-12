"use server";

import { sql } from "@/lib/db";
import { CookingTip, CookingTipInsert } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getTips(): Promise<CookingTip[]> {
  const rows = await sql`SELECT * FROM cooking_tips ORDER BY category, title`;
  return rows as CookingTip[];
}

export async function getTip(id: string): Promise<CookingTip | null> {
  const rows = await sql`SELECT * FROM cooking_tips WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return rows[0] as CookingTip;
}

export async function createTip(tip: CookingTipInsert): Promise<string> {
  const rows = await sql`
    INSERT INTO cooking_tips (category, title, content)
    VALUES (${tip.category}, ${tip.title}, ${tip.content})
    RETURNING id
  `;

  revalidatePath("/tips");
  redirect(`/tips/${rows[0].id}`);
}

export async function updateTip(
  id: string,
  tip: CookingTipInsert
): Promise<void> {
  await sql`
    UPDATE cooking_tips SET
      category = ${tip.category},
      title = ${tip.title},
      content = ${tip.content}
    WHERE id = ${id}
  `;

  revalidatePath("/tips");
  revalidatePath(`/tips/${id}`);
  redirect(`/tips/${id}`);
}

export async function deleteTip(id: string): Promise<void> {
  await sql`DELETE FROM cooking_tips WHERE id = ${id}`;

  revalidatePath("/tips");
  redirect("/tips");
}
