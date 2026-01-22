import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ChevronLeft, ChevronRight, Edit2, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Comic {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  status: "Ongoing" | "Hiatus" | "Completed" | "Dropped" | "Coming Soon";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ComicsTableProps {
  comics: Comic[];
  onDelete(id: number): Promise<void>;
  onBulkDelete?(ids: number[]): Promise<void>;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage(): void;
  onPrevPage(): void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  Ongoing: "bg-blue-100 text-blue-800",
  Hiatus: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Dropped: "bg-red-100 text-red-800",
  "Coming Soon": "bg-purple-100 text-purple-800",
};

export function ComicsTable({
  comics,
  onDelete,
  onBulkDelete,
  currentPage,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  isLoading,
}: ComicsTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(comics.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleDelete = (id: number) => {
    confirm(
      {
        title: "Delete Comic",
        description:
          "Are you sure? This will delete the comic and all associated chapters. This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
      },
      async () => {
        setDeletingId(id);
        await onDelete(id);
        setDeletingId(null);
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0 || !onBulkDelete) return;

    confirm(
      {
        title: "Bulk Delete Comics",
        description: `Are you sure? This will delete ${selectedIds.length} comic(s) and all their associated chapters. This action cannot be undone.`,
        confirmText: "Delete All",
        cancelText: "Cancel",
        variant: "destructive",
      },
      async () => {
        setIsBulkDeleting(true);
        try {
          await onBulkDelete(selectedIds);
          setSelectedIds([]);
        } finally {
          setIsBulkDeleting(false);
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comics</CardTitle>
          <CardDescription>Manage all comics in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={selectedIds.length === comics.length && comics.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className={`py-8 text-center text-muted-foreground`}>
                      No comics found
                    </TableCell>
                  </TableRow>
                ) : (
                  comics.map((comic) => (
                    <TableRow key={comic.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(comic.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(comic.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`
                            relative h-10 w-8 overflow-hidden rounded-sm
                          `}
                        >
                          <Image
                            src={comic.coverImage}
                            alt={comic.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{comic.title}</p>
                          <p className="text-xs text-muted-foreground">{comic.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[comic.status]}>{comic.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {comic.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(comic.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/comic/${comic.slug}`} target="_blank">
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/admin/comics/${comic.id}`}>
                              <Edit2 className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(comic.id)}
                            disabled={isLoading ?? deletingId === comic.id}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {currentPage}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={!hasPrevPage || isLoading}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={!hasNextPage || isLoading}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">{selectedIds.length} selected</p>
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting || isLoading}
                >
                  {isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.length}`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
