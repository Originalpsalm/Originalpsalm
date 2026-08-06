"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Revokes the session server-side, then returns to the login page. */
export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" isLoading={isSigningOut} onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
