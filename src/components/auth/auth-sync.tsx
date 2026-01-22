"use client";

import { useAuth } from "@/hooks/use-stores";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Auth Sync Component
 * Synchronizes NextAuth session with Zustand auth store
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuth();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else if (status === "authenticated" && session?.user) {
      setUser(session.user as any);
    } else {
      setUser(null);
    }
  }, [session, status, setUser, setLoading]);

  return null;
}
