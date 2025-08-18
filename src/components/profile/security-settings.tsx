"use client";

import { useState } from "react";
import { useUpdateProfile } from "@/hooks/use-users";
import { UserProfile } from "@/lib/users/types/users.types";
import { updateUserSchema } from "@/lib/users/dto/users.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  History,
  Monitor,
  Laptop,
  TabletSmartphone,
} from "lucide-react";
import { toast } from "sonner";

interface SecuritySettingsProps {
  userProfile: UserProfile;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface SecurityActivity {
  id: string;
  action: string;
  date: string;
  location: string;
  ipAddress: string;
  success: boolean;
  device: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress: string;
}

export default function SecuritySettings({
  userProfile,
}: SecuritySettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  // Mock data for security activity
  const [securityActivity] = useState<SecurityActivity[]>([
    {
      id: "1",
      action: "Password changed",
      date: "2 hours ago",
      location: "Nairobi, Kenya",
      ipAddress: "192.168.1.1",
      success: true,
      device: "Chrome on Windows",
    },
    {
      id: "2",
      action: "Profile updated",
      date: "1 day ago",
      location: "Nairobi, Kenya",
      ipAddress: "192.168.1.1",
      success: true,
      device: "Chrome on Windows",
    },
    {
      id: "3",
      action: "Failed login attempt",
      date: "3 days ago",
      location: "Unknown location",
      ipAddress: "185.220.101.32",
      success: false,
      device: "Unknown",
    },
    {
      id: "4",
      action: "Successful login",
      date: "1 week ago",
      location: "Nairobi, Kenya",
      ipAddress: "192.168.1.100",
      success: true,
      device: "Safari on iPhone",
    },
  ]);

  // Mock data for active sessions
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: "1",
      device: "Desktop",
      browser: "Chrome on Windows",
      location: "Nairobi, Kenya",
      lastActive: "Active now",
      current: true,
      ipAddress: "192.168.1.1",
    },
    {
      id: "2",
      device: "Mobile",
      browser: "Safari on iPhone",
      location: "Nairobi, Kenya",
      lastActive: "2 hours ago",
      current: false,
      ipAddress: "192.168.1.50",
    },
    {
      id: "3",
      device: "Tablet",
      browser: "Chrome on Android",
      location: "Nairobi, Kenya",
      lastActive: "1 day ago",
      current: false,
      ipAddress: "192.168.1.75",
    },
  ]);

  const validatePassword = (password: string) => {
    const requirements = [
      { test: password.length >= 8, text: "At least 8 characters" },
      { test: /[A-Z]/.test(password), text: "One uppercase letter" },
      { test: /[a-z]/.test(password), text: "One lowercase letter" },
      { test: /\d/.test(password), text: "One number" },
      { test: /[@$!%*?&]/.test(password), text: "One special character" },
    ];
    return requirements;
  };

  const validatePasswordField = (field: keyof PasswordForm, value: string) => {
    const errors: PasswordErrors = { ...passwordErrors };

    switch (field) {
      case "currentPassword":
        if (!value) {
          errors.currentPassword = "Current password is required";
        } else {
          delete errors.currentPassword;
        }
        break;
      case "newPassword":
        try {
          updateUserSchema.pick({ password: true }).parse({ password: value });
          delete errors.newPassword;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          errors.newPassword = error.errors?.[0]?.message || "Invalid password";
        }
        break;
      case "confirmPassword":
        if (value !== passwordForm.newPassword) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;
    }

    setPasswordErrors(errors);
  };

  const handlePasswordInputChange = (
    field: keyof PasswordForm,
    value: string
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));

    if (value || field === "confirmPassword") {
      validatePasswordField(field, value);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    Object.entries(passwordForm).forEach(([field, value]) => {
      validatePasswordField(field as keyof PasswordForm, value);
    });

    if (Object.keys(passwordErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        password: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});

      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(
        twoFactorEnabled
          ? "Two-factor authentication disabled"
          : "Two-factor authentication enabled"
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update two-factor authentication");
    }
  };

  const handleAuthenticatorToggle = async () => {
    try {
      setAuthenticatorEnabled(!authenticatorEnabled);
      toast.success(
        authenticatorEnabled
          ? "Authenticator app disabled"
          : "Authenticator app enabled"
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update authenticator app");
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions((prev) =>
      prev.filter((session) => session.id !== sessionId)
    );
    toast.success("Session revoked successfully");
  };

  const handleSignOutAllSessions = () => {
    setActiveSessions((prev) => prev.filter((session) => session.current));
    toast.success("All other sessions have been signed out");
  };

  const passwordRequirements = validatePassword(passwordForm.newPassword);
  const isPasswordValid = passwordRequirements.every((req) => req.test);
  const passwordsMatch =
    passwordForm.newPassword === passwordForm.confirmPassword;
  const canSubmit =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    isPasswordValid &&
    passwordsMatch &&
    Object.keys(passwordErrors).length === 0;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <TabletSmartphone className="h-4 w-4" />;
      case "tablet":
        return <TabletSmartphone className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter your current password"
                  className={
                    passwordErrors.currentPassword ? "border-red-500" : ""
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("newPassword", e.target.value)
                  }
                  placeholder="Enter your new password"
                  className={passwordErrors.newPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">
                  {passwordErrors.newPassword}
                </p>
              )}

              {/* Password Requirements */}
              {passwordForm.newPassword && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">Password Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {req.test ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={
                            req.test ? "text-green-600" : "text-red-600"
                          }
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your new password"
                  className={
                    passwordErrors.confirmPassword ? "border-red-500" : ""
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {passwordErrors.confirmPassword}
                </p>
              )}

              {passwordForm.confirmPassword && passwordForm.newPassword && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    passwordsMatch ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordsMatch ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canSubmit || updateProfileMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateProfileMutation.isPending
                ? "Updating..."
                : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">SMS Authentication</h3>
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Receive verification codes via SMS to{" "}
                  {userProfile.phone || "your phone"}
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={!userProfile.phone}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Authenticator App</h3>
                  <Badge
                    variant={authenticatorEnabled ? "default" : "secondary"}
                  >
                    {authenticatorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
              </div>
              <Switch
                checked={authenticatorEnabled}
                onCheckedChange={handleAuthenticatorToggle}
              />
            </div>

            {!userProfile.phone && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Add a phone number to your profile to enable SMS
                  authentication.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to
                your account. We recommend enabling at least one method.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {userProfile.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Account Verified</p>
                <p className="text-sm text-gray-600">
                  {userProfile.verified
                    ? "Your account is verified"
                    : "Account not verified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {userProfile.phone ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Phone Added</p>
                <p className="text-sm text-gray-600">
                  {userProfile.phone
                    ? "Phone number is added"
                    : "No phone number"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {twoFactorEnabled || authenticatorEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled || authenticatorEnabled
                    ? "2FA is enabled"
                    : "2FA is recommended"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Account Active</p>
                <p className="text-sm text-gray-600">
                  {userProfile.isActive
                    ? "Your account is active"
                    : "Account is inactive"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {activity.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {activity.location} • {activity.device}
                      </p>
                      <p className="text-xs">IP: {activity.ipAddress}</p>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            View All Activity
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.device)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.browser}</p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{session.location}</p>
                      <p className="text-xs">
                        IP: {session.ipAddress} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleSignOutAllSessions}
            disabled={activeSessions.filter((s) => !s.current).length === 0}
          >
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
