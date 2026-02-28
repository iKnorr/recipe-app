import { TipForm } from "@/components/tip-form";

export default function NewTipPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Add New Tip</h1>
      <TipForm />
    </div>
  );
}
