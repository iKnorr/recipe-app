"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importFromUrl } from "@/actions/import-url";
import { RecipeInsert } from "@/lib/types";
import { toast } from "sonner";

interface ImportUrlDialogProps {
  onImport: (recipe: RecipeInsert) => void;
}

export function ImportUrlDialog({ onImport }: ImportUrlDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!url.trim()) return;

    setLoading(true);
    const result = await importFromUrl(url.trim());
    setLoading(false);

    if (result.success) {
      toast.success("Recipe imported! Review and edit below.");
      onImport(result.recipe);
      setOpen(false);
      setUrl("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import from URL</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Recipe from URL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="import-url">Recipe URL</Label>
            <Input
              id="import-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.allrecipes.com/recipe/..."
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Works best with recipe sites that use structured data (most popular
              recipe sites).
            </p>
          </div>
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            {loading ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
