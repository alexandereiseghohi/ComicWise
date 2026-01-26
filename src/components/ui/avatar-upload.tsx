/**
 * Avatar Upload Component
 * Handles profile image uploads with preview, cropping, and validation
 */

"use client";

import { Button } from "@/components/ui/button";
import { normalizeImagePath } from "@/lib/image-path";
import { cn } from "@/lib/utils";
import { Upload, User, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface AvatarUploadProps {
  currentImage?: string | null;
  onImageSelect(file: File): void;
  onImageRemove(): void;
  className?: string;
}

export function AvatarUpload({
  currentImage,
  onImageSelect,
  onImageRemove,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview || currentImage;

  /**
   * Validate image file
   * @param file
   */
  const validateImage = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload JPG, PNG, WebP, or GIF.",
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    return { valid: true };
  };

  /**
   * Handle file selection
   * @param file
   */
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent component
    onImageSelect(file);
  };

  /**
   * Handle drag and drop
   * @param e
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle remove image
   */
  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemove();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            "relative size-32 overflow-hidden rounded-full border-4 border-border bg-muted",
            dragActive && "border-primary"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {displayImage ? (
            <Image
              src={normalizeImagePath(displayImage) ?? displayImage}
              alt="Profile avatar"
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User className="size-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Remove Button */}
        {displayImage && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 size-8 rounded-full shadow-lg"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" />
          {displayImage ? "Change Photo" : "Upload Photo"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max 5MB.
          <br />
          Drag and drop or click to upload.
        </p>
      </div>
    </div>
  );
}
