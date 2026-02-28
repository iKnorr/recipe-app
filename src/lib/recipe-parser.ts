import * as cheerio from "cheerio";
import { Ingredient, Step } from "@/lib/types";

interface ParsedRecipe {
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  image_url: string | null;
  source_url: string;
}

export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RecipeManager/1.0; +personal-use)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Try schema.org JSON-LD first
  const jsonLdRecipe = extractJsonLd($);
  if (jsonLdRecipe) {
    return { ...jsonLdRecipe, source_url: url };
  }

  // Fallback: extract from meta tags and page content
  return extractFromMetaTags($, url);
}

function extractJsonLd(
  $: cheerio.CheerioAPI
): Omit<ParsedRecipe, "source_url"> | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const text = $(scripts[i]).html();
      if (!text) continue;

      const json = JSON.parse(text);
      const recipe = findRecipeInJsonLd(json);
      if (recipe) {
        return normalizeSchemaRecipe(recipe);
      }
    } catch {
      continue;
    }
  }
  return null;
}

function findRecipeInJsonLd(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;

  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
    return null;
  }

  const obj = json as Record<string, unknown>;

  if (
    obj["@type"] === "Recipe" ||
    (Array.isArray(obj["@type"]) &&
      (obj["@type"] as string[]).includes("Recipe"))
  ) {
    return obj;
  }

  // Check @graph
  if (Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"] as unknown[]) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
  }

  return null;
}

function normalizeSchemaRecipe(
  schema: Record<string, unknown>
): Omit<ParsedRecipe, "source_url"> {
  return {
    title: String(schema.name || "Untitled Recipe"),
    description: schema.description ? String(schema.description) : null,
    ingredients: parseIngredientsList(schema.recipeIngredient),
    steps: parseInstructionsList(schema.recipeInstructions),
    prep_time: parseDuration(schema.prepTime),
    cook_time: parseDuration(schema.cookTime),
    servings: parseServings(schema.recipeYield),
    image_url: parseImage(schema.image),
  };
}

function parseIngredientsList(raw: unknown): Ingredient[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const text = String(item).trim();
    return parseIngredientText(text);
  });
}

function parseIngredientText(text: string): Ingredient {
  // Try to split "2 cups flour" into amount, unit, name
  const match = text.match(
    /^([\d./\s½¼¾⅓⅔⅛]+)?\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|liters?|cloves?|pieces?|slices?|cans?|bunch|pinch|dash)?\s*(.+)?$/i
  );

  if (match) {
    return {
      amount: (match[1] || "").trim(),
      unit: (match[2] || "").trim(),
      name: (match[3] || text).trim(),
    };
  }

  return { amount: "", unit: "", name: text };
}

function parseInstructionsList(raw: unknown): Step[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    const steps: Step[] = [];
    let order = 1;

    for (const item of raw) {
      if (typeof item === "string") {
        steps.push({ order: order++, instruction: item.trim() });
      } else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        if (obj["@type"] === "HowToStep") {
          steps.push({
            order: order++,
            instruction: String(obj.text || obj.name || "").trim(),
          });
        } else if (obj["@type"] === "HowToSection") {
          // Some recipes group steps into sections
          const sectionSteps = parseInstructionsList(obj.itemListElement);
          for (const s of sectionSteps) {
            steps.push({ order: order++, instruction: s.instruction });
          }
        }
      }
    }

    return steps;
  }

  if (typeof raw === "string") {
    return raw
      .split("\n")
      .filter((s) => s.trim())
      .map((s, i) => ({ order: i + 1, instruction: s.trim() }));
  }

  return [];
}

function parseDuration(raw: unknown): number | null {
  if (!raw) return null;
  const str = String(raw);

  // ISO 8601 duration: PT30M, PT1H30M, PT1H, etc.
  const match = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (match) {
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    return hours * 60 + minutes || null;
  }

  // Try plain number (minutes)
  const num = parseInt(str);
  return isNaN(num) ? null : num;
}

function parseServings(raw: unknown): number | null {
  if (!raw) return null;
  const str = Array.isArray(raw) ? String(raw[0]) : String(raw);
  const match = str.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

function parseImage(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return typeof raw[0] === "string" ? raw[0] : null;
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    return obj.url ? String(obj.url) : null;
  }
  return null;
}

function extractFromMetaTags(
  $: cheerio.CheerioAPI,
  url: string
): ParsedRecipe {
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    "Untitled Recipe";

  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    null;

  const image_url =
    $('meta[property="og:image"]').attr("content") || null;

  return {
    title: title.trim(),
    description,
    ingredients: [],
    steps: [],
    prep_time: null,
    cook_time: null,
    servings: null,
    image_url,
    source_url: url,
  };
}
