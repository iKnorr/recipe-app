import { getTip, deleteTip } from "@/actions/cooking-tips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTipButton } from "./delete-tip-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TipDetailPage({ params }: Props) {
  const { id } = await params;
  const tip = await getTip(id);

  if (!tip) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tip.title}</h1>
          <Badge variant="secondary" className="mt-2">
            {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/tips/${tip.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <DeleteTipButton id={tip.id} />
        </div>
      </div>

      <Separator className="my-6" />

      <div className="whitespace-pre-wrap text-muted-foreground">
        {tip.content}
      </div>
    </div>
  );
}
