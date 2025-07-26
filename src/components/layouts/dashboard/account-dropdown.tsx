/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Power, User, Loader2 } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";

import { cn, getInitials } from "@/lib/utils";
import { useUserProfile } from "@/hooks/use-users";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button, buttonVariants } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { signOutFormAction } from "@/lib/auth/auth.actions";
import ThemeToggle from "./theme-toggle";

export default function AccountDropdown() {
  const router = useRouter();
  const { data: userProfile, isLoading, error } = useUserProfile();

  // Handle sign out function
  const handleSignOut = async () => {
    try {
      await signOutFormAction();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        className="flex items-center gap-2 rounded-lg"
        disabled
      >
        <Avatar>
          <AvatarFallback>
            <Loader2 className="h-4 w-4 animate-spin" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-2 hidden flex-col capitalize md:flex">
          <p className="text-sm">Loading...</p>
        </div>
        <FiChevronDown className="hidden h-5 w-5 md:block" />
      </Button>
    );
  }

  // Handle error state - redirect to sign in if unauthorized
  if (error) {
    if (
      error.message?.includes("401") ||
      error.message?.includes("unauthorized")
    ) {
      router.push("/sign-in");
      return null;
    }
  }

  const userName = userProfile?.name || "User";
  const userRole = userProfile?.roles_users_roleIdToroles?.name || "User";
  const userAvatar = userProfile?.avatar;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Avatar>
            <AvatarImage src={userAvatar || "User"} alt={userName} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>

          <div className="ml-2 hidden flex-col capitalize md:flex">
            <p className="text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
          <FiChevronDown className="hidden h-5 w-5 md:block" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48 space-y-2">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/customer/profile"
            className={cn(
              "w-full text-start",
              buttonVariants({
                variant: "ghost",
                size: "sm",
                className:
                  "w-full cursor-pointer justify-start text-muted-foreground",
              })
            )}
          >
            <User className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <div className="px-2 py-1.5">
            <ThemeToggle />
            Appearance
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full cursor-pointer justify-start text-muted-foreground"
          >
            <Power className="mr-2 size-4" />
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
