import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CookingTip } from "@/lib/types";

interface TipCardProps {
  tip: CookingTip;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <Link href={`/tips/${tip.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 text-lg">{tip.title}</CardTitle>
            <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {tip.content}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
