"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout}>
      <LogOutIcon className="size-4" />
    </Button>
  );
}
