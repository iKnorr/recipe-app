"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/actions/recipes";

interface FavoriteButtonProps {
  id: string;
  isFavorite: boolean;
}

export function FavoriteButton({ id, isFavorite }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleFavorite(id, !isFavorite);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={isFavorite ? "text-yellow-500 hover:text-yellow-600" : ""}
    >
      <span className="mr-1">{isFavorite ? "\u2605" : "\u2606"}</span>
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
}
