import Link from "next/link";
import { redirect } from "next/navigation";

import { Power, Settings, User } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";

import { signOutFormAction } from "@/lib/auth/auth.actions";
import { getSession } from "@/lib/session/session";
import { cn, getInitials } from "@/lib/utils";

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

export default async function AccountDropdown() {
  const session = await getSession();

  const user = {
    role: session?.user.role,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Avatar>
            <AvatarImage src="User" alt="User" />
            <AvatarFallback>{getInitials(user.role ?? "User")}</AvatarFallback>
          </Avatar>

          <div className="ml-2 hidden flex-col capitalize md:flex">
            <p className="text-sm">{user?.role}</p>
            {/* <p className="text-xs">{user?.phone}</p> */}
          </div>
          <FiChevronDown className="hidden h-5 w-5 md:block" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48 space-y-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
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

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
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
            <Settings className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <form
          action={async () => {
            "use server";
            await signOutFormAction();
            redirect("/sign-in");
          }}
        >
          <DropdownMenuItem asChild>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full cursor-pointer justify-start text-muted-foreground"
            >
              <Power className="mr-2 size-4" />
              Logout
            </Button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
