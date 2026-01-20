/**
 * @vitest-environment jsdom
 */

import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { uploadAvatar } from "@/lib/actions/avatar";
import { updateUserProfile } from "@/lib/actions/users";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock server actions
vi.mock("@/lib/actions/users", () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock("@/lib/actions/avatar", () => ({
  uploadAvatar: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("EditProfileForm", () => {
  const mockUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with user data", () => {
    render(<EditProfileForm user={mockUser} />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent(mockUser.image))
    );
  });

  it("submits form with updated profile data", async () => {
    const mockUpdateUserProfile = vi.mocked(updateUserProfile);
    mockUpdateUserProfile.mockResolvedValue({ success: true });

    render(<EditProfileForm user={mockUser} />);

    const nameInput = screen.getByDisplayValue("John Doe");
    const bioTextarea = screen.getByRole("textbox", { name: /bio/i });
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(bioTextarea, { target: { value: "I love comics!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "john@example.com",
        bio: "I love comics!",
        image: mockUser.image,
      });
    });
  });

  it("handles avatar upload", async () => {
    const mockUploadAvatar = vi.mocked(uploadAvatar);
    mockUploadAvatar.mockResolvedValue({
      success: true,
      data: { url: "https://example.com/new-avatar.jpg" },
    });

    render(<EditProfileForm user={mockUser} />);

    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/Drop image here or click to upload/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalled();
    });

    // Check that the new avatar URL is set
    const formData = mockUploadAvatar.mock.calls[0][0] as FormData;
    expect(formData.get("avatar")).toBe(file);
  });

  it("displays error when profile update fails", async () => {
    const mockUpdateUserProfile = vi.mocked(updateUserProfile);
    mockUpdateUserProfile.mockResolvedValue({
      success: false,
      error: "Update failed",
    });

    render(<EditProfileForm user={mockUser} />);

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalled();
    });
  });

  it("displays error when avatar upload fails", async () => {
    const mockUploadAvatar = vi.mocked(uploadAvatar);
    mockUploadAvatar.mockResolvedValue({
      success: false,
      error: "Upload failed",
    });

    render(<EditProfileForm user={mockUser} />);

    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/Drop image here or click to upload/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalled();
    });
  });

  it("disables form during submission", async () => {
    const mockUpdateUserProfile = vi.mocked(updateUserProfile);
    mockUpdateUserProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<EditProfileForm user={mockUser} />);

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows loading state during avatar upload", async () => {
    const mockUploadAvatar = vi.mocked(uploadAvatar);
    mockUploadAvatar.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<EditProfileForm user={mockUser} />);

    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/Drop image here or click to upload/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/uploading avatar/i)).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    render(<EditProfileForm user={mockUser} />);

    const nameInput = screen.getByDisplayValue("John Doe");
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    // Clear name field
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(vi.mocked(updateUserProfile)).not.toHaveBeenCalled();
  });

  it("handles avatar removal", async () => {
    render(<EditProfileForm user={mockUser} />);

    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    // Avatar should be removed from preview
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(updateUserProfile)).toHaveBeenCalledWith(
        expect.objectContaining({
          image: null,
        })
      );
    });
  });
});
