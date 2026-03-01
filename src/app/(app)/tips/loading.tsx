import { Card, CardContent, CardHeader } from "@/components/ui/card";

function TipCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
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
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <section key={i}>
            <div className="mb-3 h-6 w-28 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <TipCardSkeleton key={j} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
