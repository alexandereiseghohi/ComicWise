"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsPanelProps {
  user: User;
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newChapterNotifications: true,
    bookmarkReminders: false,
    darkMode: false,
  });

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newChapterNotifications">New Chapter Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new chapters are released
              </p>
            </div>
            <Switch
              id="newChapterNotifications"
              checked={settings.newChapterNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, newChapterNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bookmarkReminders">Bookmark Reminders</Label>
              <p className="text-sm text-muted-foreground">Remind me about bookmarked comics</p>
            </div>
            <Switch
              id="bookmarkReminders"
              checked={settings.bookmarkReminders}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, bookmarkReminders: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize your reading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings}>Save Settings</Button>
    </div>
  );
}
