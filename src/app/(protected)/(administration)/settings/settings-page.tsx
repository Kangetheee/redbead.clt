"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw } from "lucide-react";

import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import {
  getSettingsAction,
  updateSettingsAction,
} from "@/lib/settings/settings.actions";
// import { Settings } from "@/lib/settings/types/settings.types";
import {
  NotificationChannel,
  UpdateSettingsDto,
} from "@/lib/settings/dto/settings.dto";

// Query keys
const SETTINGS_QUERY_KEY = ["settings"] as const;

// Channel display configuration
const NOTIFICATION_CHANNELS = [
  {
    value: NotificationChannel.EMAIL,
    label: "Email",
    description: "Receive notifications via email",
  },
  {
    value: NotificationChannel.SMS,
    label: "SMS",
    description: "Receive notifications via text message",
  },
  {
    value: NotificationChannel.IN_APP,
    label: "In-App",
    description: "Receive notifications within the application",
  },
  {
    value: NotificationChannel.WHATSAPP,
    label: "WhatsApp",
    description: "Receive notifications via WhatsApp",
  },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Query for fetching settings
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const response = await getSettingsAction();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to load settings");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: UpdateSettingsDto) => {
      const response = await updateSettingsAction(data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to update settings");
      }
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with the new data
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updatedSettings);
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      toast.error(errorMessage);
    },
  });

  // Form state
  const [formData, setFormData] = useState<UpdateSettingsDto>(() => {
    if (settings) {
      return {
        isAiEnabled: settings.isAiEnabled,
        allowedAdminNotificationChannels:
          settings.allowedAdminNotificationChannels,
      };
    }
    return {
      isAiEnabled: false,
      allowedAdminNotificationChannels: [],
    };
  });

  // Update form data when settings change
  useState(() => {
    if (settings) {
      setFormData({
        isAiEnabled: settings.isAiEnabled,
        allowedAdminNotificationChannels:
          settings.allowedAdminNotificationChannels,
      });
    }
  });

  const handleSaveSettings = async () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleRefresh = () => {
    // Invalidate and refetch the settings query
    queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
  };

  const handleAiEnabledChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isAiEnabled: checked,
    }));
  };

  const handleNotificationChannelChange = (
    channel: NotificationChannel,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentChannels = prev.allowedAdminNotificationChannels || [];

      if (checked) {
        // Add channel if not already present
        if (!currentChannels.includes(channel)) {
          return {
            ...prev,
            allowedAdminNotificationChannels: [...currentChannels, channel],
          };
        }
      } else {
        // Remove channel
        return {
          ...prev,
          allowedAdminNotificationChannels: currentChannels.filter(
            (c) => c !== channel
          ),
        };
      }

      return prev;
    });
  };

  const hasChanges = () => {
    if (!settings) return false;

    return (
      formData.isAiEnabled !== settings.isAiEnabled ||
      JSON.stringify(formData.allowedAdminNotificationChannels?.sort()) !==
        JSON.stringify(settings.allowedAdminNotificationChannels?.sort())
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <BreadcrumbNav title="Settings" />
        </div>

        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <BreadcrumbNav title="Settings" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <div className="text-center space-y-4">
            <p className="text-red-600 font-medium">Error loading settings</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav title="Settings" />

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges() || updateSettingsMutation.isPending}
            size="sm"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
            <CardDescription>
              Configure artificial intelligence features and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-enabled" className="text-base font-medium">
                  Enable AI Features
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI-powered features and recommendations throughout the
                  application
                </p>
              </div>
              <Switch
                id="ai-enabled"
                checked={formData.isAiEnabled}
                onCheckedChange={handleAiEnabledChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Notifications</CardTitle>
            <CardDescription>
              Choose how you want to receive administrative notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {NOTIFICATION_CHANNELS.map((channel, index) => (
                <div key={channel.value}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`channel-${channel.value}`}
                      checked={
                        formData.allowedAdminNotificationChannels?.includes(
                          channel.value
                        ) || false
                      }
                      onCheckedChange={(checked) =>
                        handleNotificationChannelChange(
                          channel.value,
                          checked as boolean
                        )
                      }
                    />
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={`channel-${channel.value}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {channel.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  {index < NOTIFICATION_CHANNELS.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Info */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle>Settings Information</CardTitle>
              <CardDescription>
                Current settings metadata and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Settings ID</Label>
                  <p className="text-muted-foreground font-mono">
                    {settings.id}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Last Updated</Label>
                  <p className="text-muted-foreground">
                    {new Date(settings.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {hasChanges() && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">Unsaved Changes</p>
              <p className="text-sm text-amber-700">
                You have unsaved changes. Don&apos;t forget to save your
                settings.
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              size="sm"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
