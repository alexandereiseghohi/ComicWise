"use client";

import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/use-image-upload";
import { normalizeImagePath } from "@/lib/image-path";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { cn } from "utils";

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT IMAGE UPLOADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClientImageUploaderProps {
  value?: string;
  onChange?(url: string): void;
  onRemove?(url?: string): void;
  onUploadComplete?(url: string): void;
  disabled?: boolean;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  type?: "comic-cover" | "chapter-image" | "avatar" | "general";
  uploadType?: "comic-cover" | "chapter-image" | "avatar" | "general";
  /** deprecated Not used, kept for backward compatibility */
  targetInputId?: string;
}

/**
 * Client-side image uploader component with preview and drag-and-drop support
 *
 * Features:
 * - Drag and drop support
 * - File preview before upload
 * - Progress indicator
 * - Error handling
 * - Responsive design
 *
 * example
 * ```tsx
 * <ClientImageUploader
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   onUploadComplete={saveToDb}
 *   type="comic-cover"
 *   maxSize={10}
 * />
 * ```
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.onRemove
 * @param root0.onUploadComplete
 * @param root0.disabled
 * @param root0.className
 * @param root0.label
 * @param root0.accept
 * @param root0.maxSize
 * @param root0.type
 * @param root0.uploadType
 * @param root0.targetInputId
 */
export default function ClientImageUploader({
  value,
  onChange,
  onRemove,
  onUploadComplete,
  disabled = false,
  className,
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSize = 10,
  type = "general",
  uploadType,
  targetInputId: _targetInputId, // kept for backward compatibility but unused
}: ClientImageUploaderProps) {
  const { fileInputRef, isUploading, uploadProgress, error, handleFileSelect } = useImageUpload({
    maxSizeMB: maxSize,
    uploadType: uploadType || type,
    onChange,
    onUploadComplete,
  });

  // Handle drag and drop
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled || isUploading) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled, isUploading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled || isUploading) return;
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const event = {
          target: { files },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
      }
    },
    [disabled, isUploading, handleFileSelect]
  );

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
              relative flex aspect-video w-full max-w-md cursor-pointer flex-col
              items-center justify-center gap-2 rounded-lg border-2
              border-dashed bg-muted/50 transition-colors
              hover:bg-muted
            `,
            disabled && "cursor-not-allowed opacity-50",
            isUploading && "opacity-75"
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && !isUploading && (e.key === "Enter" || e.key === " ")) {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-1 bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {uploadProgress > 0 && (
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              )}
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
        <div className={`rounded-md bg-destructive/15 p-3 text-sm text-destructive`}>{error}</div>
      )}
    </div>
  );
}
