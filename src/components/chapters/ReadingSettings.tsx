/**
 * ReadingSettings Component
 * Reading preferences and settings
 * @component
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";

/**
 * Props for ReadingSettings component
 */
interface ReadingSettingsProps {
  /**
   * Callback when settings change
   */
  onSettingsChange?(settings: ReadingSettingsType): void;
}

/**
 * Reading settings structure
 */
export interface ReadingSettingsType {
  backgroundColor: "white" | "black" | "gray";
  pageMode: "vertical" | "horizontal";
  autoScroll: boolean;
}

/**
 * ReadingSettings Component
 * Provides reading customization options
 * @param root0
 * @param root0.onSettingsChange
 */
export function ReadingSettings({ onSettingsChange }: ReadingSettingsProps) {
  const [settings, setSettings] = useState<ReadingSettingsType>({
    backgroundColor: "white",
    pageMode: "vertical",
    autoScroll: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof ReadingSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
    localStorage.setItem("readingSettings", JSON.stringify(newSettings));
  };

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="gap-2">
        ⚙️ Settings
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 z-50 mt-2 w-64 p-4 shadow-lg">
          <div className="space-y-4">
            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                {(["white", "black", "gray"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSetting("backgroundColor", color)}
                    className={`size-8 rounded-sm border-2 ${
                      settings.backgroundColor === color ? "border-primary" : "border-gray-300"
                    } ${
                      color === "white"
                        ? "bg-white"
                        : color === "black"
                          ? "bg-black"
                          : "bg-gray-500"
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Page Mode */}
            <div className="space-y-2">
              <Label>Page Mode</Label>
              <div className="flex gap-2">
                {(["vertical", "horizontal"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting("pageMode", mode)}
                    className={`flex-1 rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                      settings.pageMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-background hover:bg-accent"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Scroll */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoScroll"
                checked={settings.autoScroll}
                onChange={(e) => updateSetting("autoScroll", e.target.checked)}
                className="rounded-sm border border-input"
              />
              <Label htmlFor="autoScroll" className="cursor-pointer text-sm">
                Auto Scroll
              </Label>
            </div>

            {/* Close Button */}
            <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">
              Done
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
