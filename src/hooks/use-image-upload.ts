import { useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD HOOK - React hook for uploading files with progress tracking
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export interface UseImageUploadOptions {
  /**
   * Maximum file size in MB (default: 10)
   */
  maxSizeMB?: number;
  /**
   * Allowed MIME types (default: common image formats)
   */
  allowedTypes?: string[];
  /**
   * Upload type for server-side categorization
   * Examples: 'comic-cover', 'chapter-image', 'avatar', 'general'
   */
  uploadType?: string;
  /**
   * Callback when file URL is set (fires immediately after validation)
   */
  onChange?(url: string): void;
  /**
   * Callback when upload completes successfully
   */
  onUploadComplete?(url: string): void;
}

export interface UseImageUploadReturn {
  /**
   * Ref to attach to hidden file input element
   */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /**
   * Whether an upload is currently in progress
   */
  isUploading: boolean;
  /**
   * Upload progress as percentage (0-100)
   */
  uploadProgress: number;
  /**
   * Error message if upload failed, null otherwise
   */
  error: string | null;
  /**
   * Whether the last upload was successful
   */
  success: boolean;
  /**
   * Handle file input change event
   */
  handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): Promise<void>;
  /**
   * Reset all state to initial values
   */
  reset(): void;
}

/**
 * React hook for uploading files with validation and progress tracking.
 *
 * Features:
 * - File type validation (configurable MIME types)
 * - File size validation (default 10MB for images, configurable)
 * - Upload progress tracking
 * - Error handling and reporting
 * - Multiple file type support (images, PDFs, etc.)
 *
 * param options - Configuration options for upload behavior
 * returns Object with upload state and control methods
 *
 * example
 * ```tsx
 * const { fileInputRef, isUploading, error, handleFileSelect } = useImageUpload({
 *   maxSizeMB: 10,
 *   uploadType: 'comic-cover',
 *   onChange: (url) => console.log('URL:', url),
 *   onUploadComplete: (url) => saveToDatabase(url),
 * });
 *
 * return (
 *   <>
 *     <input
 *       ref={fileInputRef}
 *       type="file"
 *       onChange={handleFileSelect}
 *     />
 *     {error && <div className="error">{error}</div>}
 *   </>
 * );
 * ```
 * @param options
 */
export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxSizeMB = 10,
    allowedTypes = DEFAULT_ALLOWED,
    uploadType,
    onChange,
    onUploadComplete,
  } = options;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Validate the selected file for type and size.
   * Returns null when valid, otherwise an error message string.
   * @param file
   */
  function validateFile(file: File): string | null {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map((t) => t.split("/")[1]).join(", ")}`;
    }
    return null;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (uploadType) formData.append("type", uploadType);

      // Simulate progress for UX since fetch doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) throw new Error("No URL returned from upload");

      setSuccess(true);
      onChange?.(data.url);
      onUploadComplete?.(data.url);

      // Clear success state after short delay
      setTimeout(() => setSuccess(false), 2000);
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to upload image. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function reset() {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return {
    fileInputRef,
    isUploading,
    uploadProgress,
    error,
    success,
    handleFileSelect,
    reset,
  };
}
