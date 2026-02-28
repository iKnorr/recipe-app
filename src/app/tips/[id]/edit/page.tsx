import { getTip } from "@/actions/cooking-tips";
import { TipForm } from "@/components/tip-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTipPage({ params }: Props) {
  const { id } = await params;
  const tip = await getTip(id);

  if (!tip) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Edit Tip</h1>
      <TipForm tip={tip} />
    </div>
  );
}
