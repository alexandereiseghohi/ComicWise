"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface LoadingSwapProps {
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

export function LoadingSwap({ isLoading, children, className }: LoadingSwapProps) {
  if (isLoading) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </span>
    );
  }

  return <span className={className}>{children}</span>;
}
