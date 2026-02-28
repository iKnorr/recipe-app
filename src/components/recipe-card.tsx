import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0) || null;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className={`h-full transition-shadow hover:shadow-md ${recipe.image_url ? "pt-0 overflow-hidden" : ""}`}>
        {recipe.image_url && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 text-lg">
              {recipe.title}
            </CardTitle>
            {recipe.is_favorite && <span className="text-lg text-yellow-500">&#9733;</span>}
          </div>
        </CardHeader>
        <CardContent>
          {recipe.description && (
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {totalTime && (
              <span className="text-xs text-muted-foreground">
                {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="text-xs text-muted-foreground">
                {recipe.servings} servings
              </span>
            )}
          </div>
          {recipe.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
