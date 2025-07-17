/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import { useUserProfile } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Settings, Shield, Palette, Edit } from "lucide-react";
import PersonalInfo from "./personal-info";
import SecuritySettings from "./security-settings";
import Preferences from "./preferences";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const { data: userProfile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-300 rounded-lg"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Failed to load profile. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={userProfile.avatar || undefined}
                  alt={userProfile.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile.name}
                  </h1>
                  <Badge
                    variant={userProfile.isActive ? "default" : "secondary"}
                  >
                    {userProfile.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {userProfile.verified && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>{" "}
                    {userProfile.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>{" "}
                    {userProfile.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Role:</span>
                    <Badge variant="outline">
                      {userProfile.roles_users_roleIdToroles.name}
                    </Badge>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Member since:</span>
                    {new Date(userProfile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="md:self-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6">
            <PersonalInfo userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Preferences userProfile={userProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
