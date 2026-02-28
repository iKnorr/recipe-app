import { getTips } from "@/actions/cooking-tips";
import { TipCard } from "@/components/tip-card";
import { Badge } from "@/components/ui/badge";
import { COOKING_TIP_CATEGORIES } from "@/lib/types";
import Link from "next/link";

export default async function TipsPage() {
  const tips = await getTips();

  const tipsByCategory = COOKING_TIP_CATEGORIES.reduce(
    (acc, cat) => {
      const categoryTips = tips.filter((t) => t.category === cat);
      if (categoryTips.length > 0) {
        acc[cat] = categoryTips;
      }
      return acc;
    },
    {} as Record<string, typeof tips>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cooking Tips</h1>
        <Link
          href="/tips/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add Tip
        </Link>
      </div>

      {tips.length === 0 ? (
        <p className="text-muted-foreground">
          No tips yet. Add your first cooking tip!
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(tipsByCategory).map(([category, categoryTips]) => (
            <section key={category}>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge variant="outline" className="text-xs">
                  {categoryTips.length}
                </Badge>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTips.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
