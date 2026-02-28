import { getRecipe } from "@/actions/recipes";
import { RecipeForm } from "@/components/recipe-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Edit Recipe</h1>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
