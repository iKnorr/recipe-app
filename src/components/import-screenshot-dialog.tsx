"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importFromScreenshot } from "@/actions/import-screenshot";
import { RecipeInsert } from "@/lib/types";
import { toast } from "sonner";

interface ImportScreenshotDialogProps {
  onImport: (recipe: RecipeInsert) => void;
}

export function ImportScreenshotDialog({
  onImport,
}: ImportScreenshotDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setFiles((prev) => [...prev, ...selected]);
    const urls = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function resetState() {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    if (!files.length) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const result = await importFromScreenshot(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Recipe extracted! Review and edit below.");
      onImport(result.recipe);
      setOpen(false);
      resetState();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Import from Screenshot</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Recipe from Screenshots</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="screenshot">Upload Images</Label>
            <input
              ref={fileRef}
              id="screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Upload one or more photos of the same recipe (e.g. ingredients on
              one page, steps on another). All images are sent together.
            </p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="group relative overflow-hidden rounded-md border">
                  <img
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {files.length} image{files.length !== 1 ? "s" : ""} selected
            </span>
            <Button
              onClick={handleImport}
              disabled={loading || !files.length}
            >
              {loading ? "Extracting recipe..." : "Extract Recipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
