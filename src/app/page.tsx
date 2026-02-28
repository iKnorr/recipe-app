import { getRecipes } from "@/actions/recipes";
import { RecipeGrid } from "@/components/recipe-grid";
import Link from "next/link";

export default async function Home() {
  let recipes;
  try {
    recipes = await getRecipes();
  } catch {
    // Supabase not configured yet - show welcome screen
    recipes = null;
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold">Welcome to CookBase</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal recipe collection. Add your first recipe to get started!
        </p>
        <Link
          href="/recipes/new"
          className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add Your First Recipe
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Recipes ({recipes.length})
        </h1>
      </div>
      <RecipeGrid recipes={recipes} />
    </div>
  );
}
