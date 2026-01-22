"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { deleteUserAccount, updateUserSettings } from "@/lib/actions/users";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface SettingsFormProps {
  userId: string;
}

export function SettingsForm({ userId }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newChapterAlerts, setNewChapterAlerts] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [readingHistoryVisibility, setReadingHistoryVisibility] = useState(false);

  const handleSaveSettings = () => {
    startTransition(async () => {
      try {
        const result = await updateUserSettings({
          emailNotifications,
          newChapterAlerts,
          commentReplies,
          profileVisibility,
          readingHistoryVisibility,
        });

        if (result.success) {
          toast.success("Settings saved successfully!");
        } else {
          toast.error(result.error || "Failed to save settings");
        }
      } catch (error) {
        toast.error("An error occurred while saving settings");
        console.error("Settings save error:", error);
      }
    });
  };

  const handleDeleteAccount = () => {
    startDeleteTransition(async () => {
      try {
        const result = await deleteUserAccount();

        if (result.success) {
          toast.success("Account deleted successfully");
          router.push("/");
        } else {
          toast.error(result.error || "Failed to delete account");
        }
      } catch (error) {
        toast.error("An error occurred while deleting account");
        console.error("Account deletion error:", error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive updates and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-chapter-alerts">New Chapter Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new chapters are released
              </p>
            </div>
            <Switch
              id="new-chapter-alerts"
              checked={newChapterAlerts}
              onCheckedChange={setNewChapterAlerts}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comment-replies">Comment Replies</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone replies to your comments
              </p>
            </div>
            <Switch
              id="comment-replies"
              checked={commentReplies}
              onCheckedChange={setCommentReplies}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control what information is visible to others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              id="profile-visibility"
              checked={profileVisibility}
              onCheckedChange={setProfileVisibility}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reading-history">Reading History Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your reading history on your profile
              </p>
            </div>
            <Switch
              id="reading-history"
              checked={readingHistoryVisibility}
              onCheckedChange={setReadingHistoryVisibility}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Settings
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Delete Account</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 size-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers, including:
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>Your profile and personal information</li>
                      <li>All bookmarks and reading history</li>
                      <li>Comments and ratings</li>
                      <li>Any uploaded content</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
