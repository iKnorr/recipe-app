import { Card, CardContent, CardHeader } from "@/components/ui/card";

function CardSkeleton() {
  return (
    <Card className="h-full pt-0 overflow-hidden">
      <div className="h-40 w-full animate-pulse bg-muted" />
      <CardHeader className="pb-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
