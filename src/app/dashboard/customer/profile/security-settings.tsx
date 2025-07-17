"use client";

import { useState } from "react";
import { useUpdateProfile } from "@/hooks/use-users";
import { UserProfile } from "@/lib/users/types/users.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";

interface SecuritySettingsProps {
  userProfile: UserProfile;
}

export default function SecuritySettings({
  userProfile,
}: SecuritySettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        password: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled"
    );
  };

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

  const passwordRequirements = validatePassword(passwordForm.newPassword);
  const isPasswordValid = passwordRequirements.every((req) => req.test);

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
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
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
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your new password"
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
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
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

              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    Passwords do not match
                  </div>
                )}

              {passwordForm.confirmPassword &&
                passwordForm.newPassword === passwordForm.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Passwords match
                  </div>
                )}
            </div>

            <Button
              type="submit"
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword ||
                !isPasswordValid ||
                passwordForm.newPassword !== passwordForm.confirmPassword ||
                updateProfileMutation.isPending
              }
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
                  Receive verification codes via SMS to {userProfile.phone}
                </p>
              </div>
              <Button
                variant={twoFactorEnabled ? "destructive" : "default"}
                onClick={handleTwoFactorToggle}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Authenticator App</h3>
                  <Badge variant="secondary">Not Configured</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
              </div>
              <Button variant="outline">Set Up</Button>
            </div>

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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-sm text-gray-600">
                    Your email is verified
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
                  <p className="font-medium">Phone Verified</p>
                  <p className="text-sm text-gray-600">
                    {userProfile.phone
                      ? "Your phone is verified"
                      : "Phone not verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {twoFactorEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">
                    {twoFactorEnabled ? "2FA is enabled" : "2FA is recommended"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Strong Password</p>
                  <p className="text-sm text-gray-600">
                    Password meets requirements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: "Password changed",
                date: "2 hours ago",
                location: "New York, NY",
                success: true,
              },
              {
                action: "Login attempt",
                date: "1 day ago",
                location: "San Francisco, CA",
                success: true,
              },
              {
                action: "Failed login attempt",
                date: "3 days ago",
                location: "Unknown location",
                success: false,
              },
            ].map((activity, index) => (
              <div
                key={index}
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
                    <p className="text-sm text-gray-600">{activity.location}</p>
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

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                device: "Chrome on Windows",
                location: "New York, NY",
                lastActive: "Active now",
                current: true,
              },
              {
                device: "Safari on iPhone",
                location: "New York, NY",
                lastActive: "2 hours ago",
                current: false,
              },
            ].map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.device}</p>
                    {session.current && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.location}</p>
                  <p className="text-sm text-gray-500">{session.lastActive}</p>
                </div>
                {!session.current && (
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
