"use client";

import { useState } from "react";
import { useUpdateProfile } from "@/hooks/use-users";
import { UserProfile } from "@/lib/users/types/users.types";
import { UpdateUserDto, updateUserSchema } from "@/lib/users/dto/users.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Upload,
  User,
  Mail,
  Phone,
  Camera,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";

interface PersonalInfoProps {
  userProfile: UserProfile;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export default function PersonalInfo({ userProfile }: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto>({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    avatar: userProfile.avatar || undefined,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();

  const validateField = (field: keyof UpdateUserDto, value: string) => {
    try {
      // Create a partial object with just the field we want to validate
      const testData = { [field]: value } as Partial<UpdateUserDto>;
      updateUserSchema.partial().parse(testData);
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const fieldError = error.errors?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => err.path?.[0] === field
      );
      const errorMessage = fieldError?.message || "Invalid value";
      setFormErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }
  };

  const handleInputChange = (field: keyof UpdateUserDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate field on change
    if (value) {
      validateField(field, value);
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    try {
      updateUserSchema.partial().parse(formData);
      setFormErrors({});
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errors: FormErrors = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          errors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsEditing(false);
      setAvatarPreview(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      avatar: userProfile.avatar || undefined,
    });
    setFormErrors({});
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const hasChanges =
    JSON.stringify(formData) !==
    JSON.stringify({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      avatar: userProfile.avatar || undefined,
    });

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={avatarPreview || formData.avatar}
                  alt={formData.name || "Profile"}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.name || "U")}
                </AvatarFallback>
              </Avatar>
              {avatarPreview && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <Upload className="h-4 w-4" />
                Upload New Photo
              </Button>
              <p className="text-sm text-gray-600">
                JPG, PNG or GIF. Max size 2MB.
              </p>
              {formErrors.avatar && (
                <p className="text-sm text-red-600">{formErrors.avatar}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                size="sm"
                disabled={updateProfileMutation.isPending || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    {userProfile.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="p-3 bg-gray-50 rounded-md">
                      {userProfile.email}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-600">{formErrors.phone}</p>
                    )}
                    {formData.phone && isValidPhoneNumber(formData.phone) && (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Valid phone number
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="p-3 bg-gray-50 rounded-md">
                      {userProfile.phone || "Not provided"}
                    </div>
                  </div>
                )}
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Type
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Badge variant="outline">{userProfile.type}</Badge>
                </div>
              </div>
            </div>

            {/* Account Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Badge
                    variant={userProfile.isActive ? "default" : "secondary"}
                    className={
                      userProfile.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {userProfile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Verification Status</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Badge
                    variant="outline"
                    className={
                      userProfile.verified
                        ? "bg-green-100 text-green-800 border-green-600"
                        : "bg-yellow-100 text-yellow-800 border-yellow-600"
                    }
                  >
                    {userProfile.verified ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Badge variant="outline">
                    {userProfile.role?.name || "No role"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Member Since
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {userProfile.lastLogin && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Last Login
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {new Date(userProfile.lastLogin).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These actions are permanent and cannot be undone. Please proceed
                with caution.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                disabled={!userProfile.isActive}
              >
                {userProfile.isActive
                  ? "Deactivate Account"
                  : "Account Deactivated"}
              </Button>
              <Button variant="destructive">Request Account Deletion</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
