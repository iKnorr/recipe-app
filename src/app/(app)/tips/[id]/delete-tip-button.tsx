"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteTip } from "@/actions/cooking-tips";
import { toast } from "sonner";

interface DeleteTipButtonProps {
  id: string;
}

export function DeleteTipButton({ id }: DeleteTipButtonProps) {
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    try {
      await deleteTip(id);
    } catch {
      toast.error("Failed to delete tip");
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? "Confirm?" : "Delete"}
    </Button>
  );
}
