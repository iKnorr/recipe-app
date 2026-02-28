"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRecipe, updateRecipe } from "@/actions/recipes";
import { uploadRecipeImage } from "@/actions/upload-image";
import { Ingredient, Recipe, RecipeInsert, Step } from "@/lib/types";
import { toast } from "sonner";

interface RecipeFormProps {
  recipe?: Recipe;
  initialData?: RecipeInsert;
}

export function RecipeForm({ recipe, initialData }: RecipeFormProps) {
  const source = recipe ?? initialData;
  const [title, setTitle] = useState(source?.title ?? "");
  const [description, setDescription] = useState(source?.description ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    source?.ingredients.length ? source.ingredients : [{ amount: "", unit: "", name: "" }]
  );
  const [steps, setSteps] = useState<Step[]>(
    source?.steps.length ? source.steps : [{ order: 1, instruction: "" }]
  );
  const [prepTime, setPrepTime] = useState(source?.prep_time?.toString() ?? "");
  const [cookTime, setCookTime] = useState(source?.cook_time?.toString() ?? "");
  const [servings, setServings] = useState(source?.servings?.toString() ?? "");
  const [sourceUrl, setSourceUrl] = useState(source?.source_url ?? "");
  const [tags, setTags] = useState(source?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(source?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(source?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addIngredient() {
    setIngredients([...ingredients, { amount: "", unit: "", name: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  function addStep() {
    setSteps([...steps, { order: steps.length + 1, instruction: "" }]);
  }

  function removeStep(index: number) {
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(updated);
  }

  function updateStep(index: number, instruction: string) {
    const updated = [...steps];
    updated[index] = { ...updated[index], instruction };
    setSteps(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.instruction.trim()),
        prep_time: prepTime ? parseInt(prepTime) : null,
        cook_time: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : null,
        source_url: sourceUrl.trim() || null,
        image_url: imageUrl || null,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        notes: notes.trim() || null,
        is_favorite: recipe?.is_favorite ?? false,
      };

      if (recipe) {
        await updateRecipe(recipe.id, recipeData);
      } else {
        await createRecipe(recipeData);
      }
    } catch {
      toast.error("Failed to save recipe");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Recipe title"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the dish"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              <Input
                id="prepTime"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              <Input
                id="cookTime"
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="italian, pasta, quick"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {imageUrl && (
            <div className="relative overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt="Recipe"
                className="h-48 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const formData = new FormData();
                formData.append("image", file);
                const result = await uploadRecipeImage(formData);
                setUploading(false);
                if (result.success) {
                  setImageUrl(result.url);
                  toast.success("Image uploaded");
                } else {
                  toast.error(result.error);
                }
                e.target.value = "";
              }}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploading && (
              <p className="mt-1 text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                className="w-20"
                placeholder="Amt"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
              />
              <Input
                className="w-24"
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, "unit", e.target.value)}
              />
              <Input
                className="flex-1"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
              >
                X
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            + Add Ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2.5 text-sm font-medium text-muted-foreground">
                {step.order}.
              </span>
              <Textarea
                className="flex-1"
                placeholder={`Step ${step.order}...`}
                value={step.instruction}
                onChange={(e) => updateStep(index, e.target.value)}
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="mt-1"
              >
                X
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            + Add Step
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes, tips, variations..."
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : recipe ? "Update Recipe" : "Save Recipe"}
        </Button>
      </div>
    </form>
  );
}
