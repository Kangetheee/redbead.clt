/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/users/types/users.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Eye,
  Settings,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface PreferencesProps {
  userProfile: UserProfile;
}

interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    security: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
  };
  sms: {
    orderUpdates: boolean;
    security: boolean;
  };
}

interface DisplaySettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  allowMarketingEmails: boolean;
}

export default function Preferences({ userProfile }: PreferencesProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: false,
      newsletter: true,
      security: true,
    },
    push: {
      orderUpdates: true,
      promotions: false,
      reminders: true,
    },
    sms: {
      orderUpdates: true,
      security: true,
    },
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "US",
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    allowMarketingEmails: false,
  });

  const [soundVolume, setSoundVolume] = useState([75]);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNotificationChange = (
    type: keyof NotificationSettings,
    setting: string,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleDisplayChange = (
    setting: keyof DisplaySettings,
    value: string
  ) => {
    setDisplay((prev) => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: any) => {
    setPrivacy((prev) => ({ ...prev, [setting]: value }));
    setHasChanges(true);
  };

  const handleSavePreferences = () => {
    // Here you would typically save to your backend
    toast.success("Preferences saved successfully");
    setHasChanges(false);
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <Button onClick={handleSavePreferences}>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label className="text-base font-medium">
                Email Notifications
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              {Object.entries(notifications.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`email-${key}`} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Switch
                    id={`email-${key}`}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Label className="text-base font-medium">
                Push Notifications
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              {Object.entries(notifications.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`push-${key}`} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Switch
                    id={`push-${key}`}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Label className="text-base font-medium">SMS Notifications</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              {Object.entries(notifications.sms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`sms-${key}`} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Switch
                    id={`sms-${key}`}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("sms", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display & Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Theme</Label>
            <RadioGroup
              value={display.theme}
              onValueChange={(value) => handleDisplayChange("theme", value)}
              className="grid grid-cols-3 gap-4"
            >
              {[
                {
                  value: "light",
                  label: "Light",
                  icon: <Sun className="h-4 w-4" />,
                },
                {
                  value: "dark",
                  label: "Dark",
                  icon: <Moon className="h-4 w-4" />,
                },
                {
                  value: "system",
                  label: "System",
                  icon: <Monitor className="h-4 w-4" />,
                },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {option.icon}
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Language</Label>
            <Select
              value={display.language}
              onValueChange={(value) => handleDisplayChange("language", value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Timezone</Label>
            <Select
              value={display.timezone}
              onValueChange={(value) => handleDisplayChange("timezone", value)}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (CT)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (MT)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Currency</Label>
            <Select
              value={display.currency}
              onValueChange={(value) => handleDisplayChange("currency", value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Date Format</Label>
            <Select
              value={display.dateFormat}
              onValueChange={(value) =>
                handleDisplayChange("dateFormat", value)
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Notification Volume
              </Label>
              <span className="text-sm text-gray-600">{soundVolume[0]}%</span>
            </div>
            <Slider
              value={soundVolume}
              onValueChange={setSoundVolume}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Sound Effects</Label>
              <p className="text-sm text-gray-600">
                Play sounds for notifications and interactions
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Keyboard Sounds</Label>
              <p className="text-sm text-gray-600">Play sounds when typing</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Profile Visibility</Label>
            <RadioGroup
              value={privacy.profileVisibility}
              onValueChange={(value) =>
                handlePrivacyChange("profileVisibility", value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">
                  Public - Anyone can see your profile
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">
                  Private - Only you can see your profile
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friends" id="friends" />
                <Label htmlFor="friends">
                  Friends - Only your friends can see your profile
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Contact Information Visibility
            </Label>
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showEmail">Show email address</Label>
                <Switch
                  id="showEmail"
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showEmail", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showPhone">Show phone number</Label>
                <Switch
                  id="showPhone"
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showPhone", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Data & Analytics</Label>
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowDataCollection">
                    Allow data collection
                  </Label>
                  <p className="text-sm text-gray-600">
                    Help improve our service with anonymous usage data
                  </p>
                </div>
                <Switch
                  id="allowDataCollection"
                  checked={privacy.allowDataCollection}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("allowDataCollection", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowMarketingEmails">
                    Marketing communications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive promotional emails and offers
                  </p>
                </div>
                <Switch
                  id="allowMarketingEmails"
                  checked={privacy.allowMarketingEmails}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("allowMarketingEmails", checked)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Deletion */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Download My Data
              </Button>
              <Button variant="outline" className="flex-1">
                Export Preferences
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full sm:w-auto">
                Delete All Data
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
