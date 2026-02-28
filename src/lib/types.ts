export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface Step {
  order: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  source_url: string | null;
  image_url: string | null;
  tags: string[];
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export type RecipeInsert = Omit<Recipe, "id" | "created_at" | "updated_at">;
export type RecipeUpdate = Partial<RecipeInsert>;

export const COOKING_TIP_CATEGORIES = [
  "vegetables",
  "meat",
  "fish",
  "sauces",
  "grains",
  "dairy",
  "baking",
  "general",
] as const;

export interface CookingTip {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type CookingTipInsert = Omit<CookingTip, "id" | "created_at" | "updated_at">;
