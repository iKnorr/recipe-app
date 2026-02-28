import { getRecipe, deleteRecipe, toggleFavorite } from "@/actions/recipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { FavoriteButton } from "@/components/favorite-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const totalTime =
    (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0) || null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-1 text-muted-foreground">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <FavoriteButton id={recipe.id} isFavorite={recipe.is_favorite} />
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <DeleteButton id={recipe.id} />
        </div>
      </div>

      {recipe.image_url && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {recipe.prep_time && <span>Prep: {recipe.prep_time} min</span>}
        {recipe.cook_time && <span>Cook: {recipe.cook_time} min</span>}
        {totalTime && <span>Total: {totalTime} min</span>}
        {recipe.servings && <span>Servings: {recipe.servings}</span>}
      </div>

      {recipe.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="my-6" />

      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold">Ingredients</h2>
        <ul className="space-y-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-medium">
                {ing.amount} {ing.unit}
              </span>
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-6" />

      <section className="mb-6">
        <h2 className="mb-3 text-xl font-semibold">Steps</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step) => (
            <li key={step.order} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {step.order}
              </span>
              <p>{step.instruction}</p>
            </li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <>
          <Separator className="my-6" />
          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">Notes</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {recipe.notes}
            </p>
          </section>
        </>
      )}

      {recipe.source_url && (
        <p className="mt-6 text-sm text-muted-foreground">
          Source:{" "}
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {new URL(recipe.source_url).hostname}
          </a>
        </p>
      )}
    </div>
  );
}
