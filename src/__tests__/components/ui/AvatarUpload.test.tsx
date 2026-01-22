/**
 * @vitest-environment jsdom
 */

import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("AvatarUpload", () => {
  const mockOnImageSelect = vi.fn();
  const mockOnImageRemove = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default placeholder when no current image", () => {
    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText(/drop image here or click to upload/i)).toBeInTheDocument();
  });

  it("renders current image when provided", () => {
    const testImageUrl = "https://example.com/avatar.jpg";

    render(
      <AvatarUpload
        currentImage={testImageUrl}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(testImageUrl)));
  });

  it("shows file size limit information", () => {
    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    expect(screen.getByText(/jpg, png, webp or gif/i)).toBeInTheDocument();
    expect(screen.getByText(/max 5mb/i)).toBeInTheDocument();
  });

  it("calls onImageSelect when valid file is selected", async () => {
    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/drop image here or click to upload/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });
  });

  it("rejects files larger than 5MB", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    // Create a 6MB file
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByLabelText(/drop image here or click to upload/i);

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("rejects non-image files", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const pdfFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/drop image here or click to upload/i);

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("calls onImageRemove when remove button is clicked", () => {
    render(
      <AvatarUpload
        currentImage="https://example.com/avatar.jpg"
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnImageRemove).toHaveBeenCalled();
  });

  it("supports drag and drop", async () => {
    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const dropZone = screen.getByText(/drop image here or click to upload/i).closest("div");

    if (!dropZone) {
      throw new Error("Drop zone not found");
    }

    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file] },
    });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });
  });

  it("shows visual feedback during drag over", () => {
    render(
      <AvatarUpload
        currentImage={null}
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const dropZone = screen.getByText(/drop image here or click to upload/i).closest("div");

    if (!dropZone) {
      throw new Error("Drop zone not found");
    }

    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file] },
    });

    // Should have drag-over styling
    expect(dropZone).toHaveClass(/border-primary|ring-primary/);
  });

  it("accepts multiple valid image formats", async () => {
    const formats = [
      { name: "test.jpg", type: "image/jpeg" },
      { name: "test.png", type: "image/png" },
      { name: "test.webp", type: "image/webp" },
      { name: "test.gif", type: "image/gif" },
    ];

    for (const format of formats) {
      const { unmount } = render(
        <AvatarUpload
          currentImage={null}
          onImageSelect={mockOnImageSelect}
          onImageRemove={mockOnImageRemove}
        />
      );

      const file = new File(["test"], format.name, { type: format.type });
      const input = screen.getByLabelText(/drop image here or click to upload/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith(file);
      });

      mockOnImageSelect.mockClear();
      unmount();
    }
  });
});
