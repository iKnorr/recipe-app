"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTip, updateTip } from "@/actions/cooking-tips";
import { CookingTip, COOKING_TIP_CATEGORIES } from "@/lib/types";
import { toast } from "sonner";

interface TipFormProps {
  tip?: CookingTip;
}

export function TipForm({ tip }: TipFormProps) {
  const [category, setCategory] = useState(tip?.category ?? "");
  const [title, setTitle] = useState(tip?.title ?? "");
  const [content, setContent] = useState(tip?.content ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !category || !content.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const tipData = {
        category,
        title: title.trim(),
        content: content.trim(),
      };

      if (tip) {
        await updateTip(tip.id, tipData);
      } else {
        await createTip(tipData);
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "digest" in error) {
        throw error;
      }
      toast.error("Failed to save tip");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {COOKING_TIP_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tip title"
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write or paste your cooking tip here..."
          rows={10}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : tip ? "Update Tip" : "Save Tip"}
        </Button>
      </div>
    </form>
  );
}
