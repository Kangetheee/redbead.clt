"use client";

import { useState } from "react";
import { useUserProfile } from "@/hooks/use-users";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Settings,
  Shield,
  Edit,
  Camera,
  AlertCircle,
  Home,
  LayoutDashboard,
  CheckCircle,
  Clock,
  UserCheck,
  Phone,
  Mail,
} from "lucide-react";
import PersonalInfo from "@/components/profile/personal-info";
import SecuritySettings from "@/components/profile/security-settings";
import Preferences from "@/components/profile/preferences";

export default function ProfilePageClient() {
  const [activeTab, setActiveTab] = useState("personal");
  const { data: userProfile, isLoading, error, refetch } = useUserProfile();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Header Skeleton */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard"
                    className="flex items-center gap-1"
                  >
                    <Home className="h-3 w-3" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              Failed to load profile. Please try again.
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const getStatusBadges = () => {
    const badges = [];

    // Account Status
    badges.push(
      <Badge
        key="status"
        variant={userProfile.isActive ? "default" : "secondary"}
        className={
          userProfile.isActive
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {userProfile.isActive ? "Active" : "Inactive"}
      </Badge>
    );

    // Verification Status
    if (userProfile.verified) {
      badges.push(
        <Badge
          key="verified"
          variant="outline"
          className="text-green-600 border-green-600"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      badges.push(
        <Badge
          key="unverified"
          variant="outline"
          className="text-yellow-600 border-yellow-600"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }

    // User Type
    badges.push(
      <Badge key="type" variant="outline">
        <UserCheck className="h-3 w-3 mr-1" />
        {userProfile.type}
      </Badge>
    );

    return badges;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="flex items-center gap-1"
                >
                  <LayoutDashboard className="h-3 w-3" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={userProfile.avatar || undefined}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => setActiveTab("personal")}
                  title="Edit profile picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {userProfile.name}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      {userProfile.role?.name || "No role assigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadges()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="font-medium shrink-0">Email:</span>
                      <span className="break-all text-right flex-1 min-w-0">
                        {userProfile.email}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Phone:</span>
                      <span className="flex-1">
                        {userProfile.phone || "Not provided"}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Member since:</span>
                      <span className="flex-1">
                        {new Date(userProfile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </p>
                    {userProfile.lastLogin && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Last login:</span>
                        <span className="flex-1">
                          {new Date(userProfile.lastLogin).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:self-start">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("personal")}
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Info</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Personal Information</h2>
                <p className="text-muted-foreground">
                  Manage your personal details and account information
                </p>
              </div>
            </div>
            <PersonalInfo userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Security Settings</h2>
                <p className="text-muted-foreground">
                  Manage your password, two-factor authentication, and security
                  preferences
                </p>
              </div>
            </div>
            <SecuritySettings userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Preferences</h2>
                <p className="text-muted-foreground">
                  Customize your notifications, display settings, and privacy
                  preferences
                </p>
              </div>
            </div>
            <Preferences userProfile={userProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
