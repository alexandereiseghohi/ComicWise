/**
 * Image optimization tests
 */

import {
  estimateImageLoadTime,
  formatImageSize,
  generateColorLQIP,
  generateGradientLQIP,
  generateLQIP,
  generateSrcSet,
  getResponsiveImageSizes,
  imagePresets,
  imageQualitySettings,
  isValidImageUrl,
} from "@/lib/image/optimizations";
import { describe, expect, it } from "vitest";

describe("Image Optimization Utilities", () => {
  describe("LQIP Generators", () => {
    it("should generate basic LQIP", () => {
      const lqip = generateLQIP(10, 10);
      expect(lqip).toContain("data:image/svg+xml");
      expect(lqip).toContain("10");
    });

    it("should generate color-based LQIP", () => {
      const lqip = generateColorLQIP("#ff0000");
      expect(lqip).toContain("data:image/svg+xml");
      expect(lqip).toContain("ff0000");
    });

    it("should generate gradient LQIP", () => {
      const lqip = generateGradientLQIP("#000000", "#ffffff");
      expect(lqip).toContain("data:image/svg+xml");
      expect(lqip).toContain("linearGradient");
    });

    it("should handle default colors", () => {
      const colorLqip = generateColorLQIP();
      const gradientLqip = generateGradientLQIP();

      expect(colorLqip).toContain("data:image/svg+xml");
      expect(gradientLqip).toContain("data:image/svg+xml");
    });
  });

  describe("Image URL Validation", () => {
    it("should validate image URLs with extensions", () => {
      expect(isValidImageUrl("/images/comic.jpg")).toBe(true);
      expect(isValidImageUrl("https://example.com/image.png")).toBe(true);
      expect(isValidImageUrl("/cover.webp")).toBe(true);
    });

    it("should accept HTTP(S) URLs", () => {
      expect(isValidImageUrl("http://example.com/image.jpg")).toBe(true);
      expect(isValidImageUrl("https://cdn.example.com/image.png")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidImageUrl("")).toBe(false);
      expect(isValidImageUrl("/path/without/extension")).toBe(false);
      expect(isValidImageUrl("not-a-url")).toBe(false);
      expect(isValidImageUrl(null as any)).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(isValidImageUrl("/image.JPG")).toBe(true);
      expect(isValidImageUrl("/image.PNG")).toBe(true);
    });
  });

  describe("Responsive Image Sizes", () => {
    it("should generate responsive sizes", () => {
      const sizes = getResponsiveImageSizes();

      expect(sizes.small).toBe(400);
      expect(sizes.medium).toBe(800);
      expect(sizes.large).toBe(1200);
    });

    it("should respect max width", () => {
      const sizes = getResponsiveImageSizes(600);

      expect(sizes.small).toBe(400);
      expect(sizes.medium).toBe(600);
      expect(sizes.large).toBe(600);
    });

    it("should handle small max widths", () => {
      const sizes = getResponsiveImageSizes(300);

      expect(sizes.small).toBe(300);
      expect(sizes.medium).toBe(300);
      expect(sizes.large).toBe(300);
    });
  });

  describe("Image Size Formatting", () => {
    it("should format bytes correctly", () => {
      expect(formatImageSize(0)).toBe("0 Bytes");
      expect(formatImageSize(1024)).toBe("1 KB");
      expect(formatImageSize(1024 * 1024)).toBe("1 MB");
      expect(formatImageSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should format partial units", () => {
      expect(formatImageSize(512)).toBe("0.5 KB");
      expect(formatImageSize(1024 * 512)).toBe("0.5 MB");
    });
  });

  describe("Image Load Time Estimation", () => {
    it("should estimate load time", () => {
      const loadTime = estimateImageLoadTime(1024 * 100, 5000); // 100 KB at 5 Mbps
      expect(loadTime).toBeGreaterThan(0);
    });

    it("should respect minimum load time", () => {
      const loadTime = estimateImageLoadTime(1, 5000);
      expect(loadTime).toBeGreaterThanOrEqual(100);
    });

    it("should scale with connection speed", () => {
      const fastLoadTime = estimateImageLoadTime(1024 * 100, 10000);
      const slowLoadTime = estimateImageLoadTime(1024 * 100, 1000);

      expect(slowLoadTime).toBeGreaterThan(fastLoadTime);
    });
  });

  describe("Responsive SrcSet Generation", () => {
    it("should generate srcSet string", () => {
      const sizes = getResponsiveImageSizes();
      const srcSet = generateSrcSet("https://example.com/image.jpg", sizes);

      expect(srcSet).toContain("400w");
      expect(srcSet).toContain("800w");
      expect(srcSet).toContain("1200w");
    });

    it("should include query parameters", () => {
      const sizes = getResponsiveImageSizes();
      const srcSet = generateSrcSet("https://example.com/image.jpg?v=1", sizes);

      expect(srcSet).toContain("w=");
    });
  });

  describe("Image Presets", () => {
    it("should have comic cover preset", () => {
      expect(imagePresets.comicCover.width).toBe(300);
      expect(imagePresets.comicCover.height).toBe(450);
      expect(imagePresets.comicCover.quality).toBe(80);
    });

    it("should have hero preset", () => {
      expect(imagePresets.hero.width).toBe(1200);
      expect(imagePresets.hero.height).toBe(600);
    });

    it("should all have valid formats", () => {
      for (const preset of Object.values(imagePresets)) {
        expect(["webp", "jpg", "png"]).toContain(preset.format);
      }
    });
  });

  describe("Image Quality Settings", () => {
    it("should have all quality levels", () => {
      expect(imageQualitySettings.thumbnail).toBe(60);
      expect(imageQualitySettings.list).toBe(75);
      expect(imageQualitySettings.detail).toBe(80);
      expect(imageQualitySettings.hero).toBe(85);
      expect(imageQualitySettings.print).toBe(95);
    });

    it("should scale appropriately", () => {
      expect(imageQualitySettings.thumbnail < imageQualitySettings.list).toBe(true);
      expect(imageQualitySettings.list < imageQualitySettings.detail).toBe(true);
      expect(imageQualitySettings.detail < imageQualitySettings.hero).toBe(true);
      expect(imageQualitySettings.hero < imageQualitySettings.print).toBe(true);
    });
  });
});
