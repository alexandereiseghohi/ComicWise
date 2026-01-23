"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

/**
 * Settings page - User preferences and account settings
 */
export default function SettingsPage() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label>Email Notifications</label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <label>Weekly Digest</label>
              <Switch />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control who can see your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label>Public Profile</label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <label>Show Activity</label>
              <Switch />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
