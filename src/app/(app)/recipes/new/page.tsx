"use client";

import { useState } from "react";
import { RecipeForm } from "@/components/recipe-form";
import { ImportUrlDialog } from "@/components/import-url-dialog";
import { ImportScreenshotDialog } from "@/components/import-screenshot-dialog";
import { RecipeInsert } from "@/lib/types";

export default function NewRecipePage() {
  const [importedData, setImportedData] = useState<RecipeInsert | null>(null);

  function handleImport(recipe: RecipeInsert) {
    setImportedData(recipe);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Recipe</h1>
        <div className="flex gap-2">
          <ImportUrlDialog onImport={handleImport} />
          <ImportScreenshotDialog onImport={handleImport} />
        </div>
      </div>
      <RecipeForm key={importedData?.title} initialData={importedData ?? undefined} />
    </div>
  );
}
