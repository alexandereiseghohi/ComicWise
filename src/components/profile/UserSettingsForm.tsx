/**
 * UserSettingsForm Component
 * Form for managing user preferences and settings
 * @component
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useState } from "react";

/**
 * Props for UserSettingsForm
 */
interface UserSettingsFormProps {
  /**
   * Current user settings
   */
  initialSettings?: {
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    privateProfile: boolean;
    showReadingHistory: boolean;
  };
}

/**
 * UserSettingsForm Component
 * Manages user preferences, privacy, and theme settings
 * @param root0
 * @param root0.initialSettings
 */
export function UserSettingsForm({
  initialSettings = {
    theme: "system",
    emailNotifications: true,
    privateProfile: false,
    showReadingHistory: true,
  },
}: UserSettingsFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState(initialSettings);

  const handleThemeChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      theme: value as "light" | "dark" | "system",
    }));
  };

  const handleToggle = (key: keyof typeof settings) => {
    if (key === "theme") return;
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Please sign in to manage settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how ComicWise looks for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System (Follow device)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control who can see your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="privateProfile">Private Profile</Label>
              <p className="text-sm text-muted-foreground">Make your profile visible only to you</p>
            </div>
            <Switch
              id="privateProfile"
              checked={settings.privateProfile}
              onCheckedChange={() => handleToggle("privateProfile")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showReadingHistory">Show Reading History</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your reading history
              </p>
            </div>
            <Switch
              id="showReadingHistory"
              checked={settings.showReadingHistory}
              onCheckedChange={() => handleToggle("showReadingHistory")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how we contact you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new releases and features
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Settings saved successfully!
        </div>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
