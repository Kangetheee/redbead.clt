"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  DollarSign,
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
    profileUpdates: boolean;
    systemAlerts: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
    securityAlerts: boolean;
  };
  sms: {
    orderUpdates: boolean;
    security: boolean;
    emergencyAlerts: boolean;
  };
}

interface DisplaySettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  compactMode: boolean;
  animations: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  showOnlineStatus: boolean;
  allowDataCollection: boolean;
  allowMarketingEmails: boolean;
  allowProfileIndexing: boolean;
  requireTwoFactorForSensitive: boolean;
}

interface SoundSettings {
  masterVolume: number;
  notificationSounds: boolean;
  keyboardSounds: boolean;
  uiSounds: boolean;
  customSounds: boolean;
}

export default function Preferences({ userProfile }: PreferencesProps) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: userProfile.verified ? false : true,
      newsletter: true,
      security: true,
      profileUpdates: false,
      systemAlerts: true,
    },
    push: {
      orderUpdates: true,
      promotions: false,
      reminders: true,
      securityAlerts: true,
    },
    sms: {
      orderUpdates: userProfile.phone ? true : false,
      security: userProfile.phone ? true : false,
      emergencyAlerts: userProfile.phone ? true : false,
    },
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "US",
    compactMode: false,
    animations: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    allowDataCollection: true,
    allowMarketingEmails: false,
    allowProfileIndexing: false,
    requireTwoFactorForSensitive: false,
  });

  const [sound, setSound] = useState<SoundSettings>({
    masterVolume: 75,
    notificationSounds: true,
    keyboardSounds: false,
    uiSounds: true,
    customSounds: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [notifications, display, privacy, sound]);

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
  };

  const handleDisplayChange = (
    setting: keyof DisplaySettings,
    value: string | boolean
  ) => {
    setDisplay((prev) => ({ ...prev, [setting]: value }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePrivacyChange = (setting: keyof PrivacySettings, value: any) => {
    setPrivacy((prev) => ({ ...prev, [setting]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSoundChange = (setting: keyof SoundSettings, value: any) => {
    setSound((prev) => ({ ...prev, [setting]: value }));
  };

  const handleSavePreferences = async () => {
    try {
      // Here you would typically save to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Preferences saved successfully");
      setHasChanges(false);
      setLastSaved(new Date());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const handleResetToDefaults = () => {
    setNotifications({
      email: {
        orderUpdates: true,
        promotions: false,
        newsletter: true,
        security: true,
        profileUpdates: false,
        systemAlerts: true,
      },
      push: {
        orderUpdates: true,
        promotions: false,
        reminders: true,
        securityAlerts: true,
      },
      sms: {
        orderUpdates: false,
        security: false,
        emergencyAlerts: false,
      },
    });

    setDisplay({
      theme: "system",
      language: "en",
      timezone: "Africa/Kenya",
      currency: "KES",
      dateFormat: "MM/DD/YYYY",
      numberFormat: "KE",
      compactMode: false,
      animations: true,
    });

    setPrivacy({
      profileVisibility: "private",
      showEmail: false,
      showPhone: false,
      showOnlineStatus: true,
      allowDataCollection: true,
      allowMarketingEmails: false,
      allowProfileIndexing: false,
      requireTwoFactorForSensitive: false,
    });

    setSound({
      masterVolume: 75,
      notificationSounds: true,
      keyboardSounds: false,
      uiSounds: true,
      customSounds: false,
    });

    toast.success("Preferences reset to defaults");
  };

  const exportPreferences = () => {
    const preferences = { notifications, display, privacy, sound };
    const blob = new Blob([JSON.stringify(preferences, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preferences-${userProfile.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Preferences exported successfully");
  };

  const getRoleBasedRecommendations = () => {
    const role = userProfile.role?.name?.toLowerCase();
    const userType = userProfile.type?.toLowerCase();
    const recommendations = [];

    if (role === "admin" || userType === "admin") {
      recommendations.push(
        "Consider enabling security alerts and two-factor authentication for sensitive operations."
      );
    }

    if (!userProfile.phone) {
      recommendations.push(
        "Add a phone number to enable SMS notifications and improve account security."
      );
    }

    if (!userProfile.verified) {
      recommendations.push(
        "Complete account verification to access all features."
      );
    }

    return recommendations;
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              {lastSaved && (
                <p className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                size="sm"
              >
                Reset
              </Button>
              <Button onClick={handleSavePreferences}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role-based Recommendations */}
      {getRoleBasedRecommendations().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRoleBasedRecommendations().map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-yellow-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              {userProfile.verified && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Verified
                </Badge>
              )}
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
              {userProfile.phone ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Phone Added
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600"
                >
                  No Phone
                </Badge>
              )}
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
                    disabled={!userProfile.phone}
                  />
                </div>
              ))}
            </div>
            {!userProfile.phone && (
              <p className="text-sm text-gray-500 pl-6">
                Add a phone number to enable SMS notifications
              </p>
            )}
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
            <Label className="text-base font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </Label>
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
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
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
                <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Currency
            </Label>
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
                <SelectItem value="KES">KES (KSh)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* UI Preferences */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-medium">Interface</Label>
            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-sm text-gray-600">
                    Use smaller spacing and controls
                  </p>
                </div>
                <Switch
                  id="compactMode"
                  checked={display.compactMode}
                  onCheckedChange={(checked) =>
                    handleDisplayChange("compactMode", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-sm text-gray-600">
                    Enable smooth transitions and effects
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={display.animations}
                  onCheckedChange={(checked) =>
                    handleDisplayChange("animations", checked)
                  }
                />
              </div>
            </div>
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
              <Label className="text-base font-medium">Master Volume</Label>
              <span className="text-sm text-gray-600">
                {sound.masterVolume}%
              </span>
            </div>
            <Slider
              value={[sound.masterVolume]}
              onValueChange={(value) =>
                handleSoundChange("masterVolume", value[0])
              }
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            {[
              {
                key: "notificationSounds",
                label: "Notification Sounds",
                desc: "Play sounds for notifications and alerts",
              },
              {
                key: "keyboardSounds",
                label: "Keyboard Sounds",
                desc: "Play sounds when typing",
              },
              {
                key: "uiSounds",
                label: "UI Sound Effects",
                desc: "Play sounds for button clicks and interactions",
              },
              {
                key: "customSounds",
                label: "Custom Sounds",
                desc: "Allow custom notification sounds",
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{label}</Label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <Switch
                  checked={sound[key as keyof SoundSettings] as boolean}
                  onCheckedChange={(checked) =>
                    handleSoundChange(key as keyof SoundSettings, checked)
                  }
                />
              </div>
            ))}
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
            </RadioGroup>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Contact Information Visibility
            </Label>
            <div className="space-y-3 pl-4">
              {[
                {
                  key: "showEmail",
                  label: "Show email address",
                  value: privacy.showEmail,
                },
                {
                  key: "showPhone",
                  label: "Show phone number",
                  value: privacy.showPhone,
                },
                {
                  key: "showOnlineStatus",
                  label: "Show online status",
                  value: privacy.showOnlineStatus,
                },
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange(key as keyof PrivacySettings, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Data Collection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Data & Analytics</Label>
            <div className="space-y-3 pl-4">
              {[
                {
                  key: "allowDataCollection",
                  label: "Allow data collection",
                  desc: "Help improve our service with anonymous usage data",
                  value: privacy.allowDataCollection,
                },
                {
                  key: "allowMarketingEmails",
                  label: "Marketing communications",
                  desc: "Receive promotional emails and offers",
                  value: privacy.allowMarketingEmails,
                },
              ].map(({ key, label, desc, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange(key as keyof PrivacySettings, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
                onClick={exportPreferences}
              >
                <Download className="h-4 w-4" />
                Export Preferences
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
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
