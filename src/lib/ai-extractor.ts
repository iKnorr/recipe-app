import Anthropic from "@anthropic-ai/sdk";
import { Ingredient, Step } from "@/lib/types";

type ImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

interface ImageInput {
  base64: string;
  mediaType: ImageMediaType;
}

interface ExtractedRecipe {
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
}

export async function extractRecipeFromImages(
  images: ImageInput[]
): Promise<ExtractedRecipe> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const imageBlocks: Anthropic.Messages.ImageBlockParam[] = images.map(
    (img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: img.mediaType,
        data: img.base64,
      },
    })
  );

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          {
            type: "text",
            text: `Extract the recipe from ${images.length > 1 ? "these images (they are all parts of the same recipe)" : "this image"} and return it as JSON with this exact structure:
{
  "title": "Recipe Name",
  "description": "Brief description or null",
  "ingredients": [{"amount": "2", "unit": "cups", "name": "flour"}],
  "steps": [{"order": 1, "instruction": "Step description"}],
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4
}

Rules:
- Combine information from all images into a single complete recipe
- For ingredients, split into amount (number), unit (cups, tbsp, etc.), and name
- If you can't determine a value, use null for times/servings or empty string for amounts/units
- Steps should be numbered starting from 1
- Return ONLY valid JSON, no markdown or extra text`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not extract recipe from image(s)");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || "Untitled Recipe",
    description: parsed.description || null,
    ingredients: Array.isArray(parsed.ingredients)
      ? parsed.ingredients.map(
          (i: { amount?: string; unit?: string; name?: string }) => ({
            amount: String(i.amount || ""),
            unit: String(i.unit || ""),
            name: String(i.name || ""),
          })
        )
      : [],
    steps: Array.isArray(parsed.steps)
      ? parsed.steps.map(
          (s: { order?: number; instruction?: string }, idx: number) => ({
            order: s.order || idx + 1,
            instruction: String(s.instruction || ""),
          })
        )
      : [],
    prep_time:
      typeof parsed.prep_time === "number" ? parsed.prep_time : null,
    cook_time:
      typeof parsed.cook_time === "number" ? parsed.cook_time : null,
    servings:
      typeof parsed.servings === "number" ? parsed.servings : null,
  };
}
