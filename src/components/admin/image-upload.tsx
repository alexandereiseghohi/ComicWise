// ═══════════════════════════════════════════════════
// IMAGE UPLOAD COMPONENT - Reusable Image Upload with Preview
// ═══════════════════════════════════════════════════

"use client";

import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/use-image-upload";
import { normalizeImagePath } from "@/lib/image-path";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "utils";

interface ImageUploadProps {
  value?: string;
  onChange?(url: string): void;
  onRemove?(url?: string): void;
  onUploadComplete?(url: string): void;
  disabled?: boolean;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  type?: "comic" | "chapter" | "avatar" | "other";
  uploadType?: "comic" | "chapter" | "avatar" | "other";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  onUploadComplete,
  disabled = false,
  className,
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSize = 10,
  type = "other",
  uploadType,
}: ImageUploadProps) {
  const { fileInputRef, isUploading, error, handleFileSelect } = useImageUpload({
    maxSizeMB: maxSize,
    uploadType: uploadType || type,
    onChange,
    onUploadComplete,
  });

  const handleRemove = () => {
    if (onRemove) {
      onRemove(value);
    } else if (onChange) {
      onChange("");
    }
  };
  return (
    <div className={cn("space-y-4", className)}>
      {value ? (
        <div
          className={`
            relative aspect-video w-full max-w-md overflow-hidden rounded-lg
            border bg-muted
          `}
        >
          <Image
            src={normalizeImagePath(value) ?? value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            `
              flex aspect-video w-full max-w-md cursor-pointer flex-col
              items-center justify-center gap-2 rounded-lg border-2
              border-dashed bg-muted/50 transition-colors
              hover:bg-muted
            `,
            disabled && "cursor-not-allowed opacity-50"
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              fileInputRef.current?.click();
            }
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">Click to browse or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  Max {maxSize}MB • JPG, PNG, WebP, GIF
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="sr-only"
        aria-label={`Upload ${label}`}
        title={`Upload ${label}`}
      />

      {error && (
        <div
          className={`
          rounded-md bg-destructive/15 p-3 text-sm text-destructive
        `}
        >
          {error}
        </div>
      )}
    </div>
  );
}
