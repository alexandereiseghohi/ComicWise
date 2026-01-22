"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${baseUrl || pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
        <Link href={createPageUrl(currentPage - 1)}>
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Link>
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNumber;
          if (totalPages <= 5) {
            pageNumber = i + 1;
          } else if (currentPage <= 3) {
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + i;
          } else {
            pageNumber = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={createPageUrl(pageNumber)}>{pageNumber}</Link>
            </Button>
          );
        })}
      </div>

      <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
        <Link href={createPageUrl(currentPage + 1)}>
          Next
          <ChevronRight className="ml-1 size-4" />
        </Link>
      </Button>
    </div>
  );
}
