"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteRecipe } from "@/actions/recipes";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    try {
      await deleteRecipe(id);
    } catch {
      toast.error("Failed to delete recipe");
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? "Confirm?" : "Delete"}
    </Button>
  );
}
