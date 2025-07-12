import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserResponse } from "@/lib/users/types/users.types";
import { getInitials } from "@/lib/utils";

export const UserTableColumns: ColumnDef<UserResponse>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({
      row: {
        original: { name, avatar, isActive },
      },
    }) => (
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-9">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          {/* Active status dot */}
          <span
            className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background ${
              isActive ? "bg-success" : "bg-muted-foreground"
            }`}
          />
        </div>

        <span>{name}</span>
      </div>
    ),
  },

  { header: "Username", accessorKey: "username" },
  {
    header: "Contacts",
    accessorKey: "email",
    cell: ({ row: { original } }) => (
      <div className="flex flex-col gap-1">
        <span>{original.email}</span>
        <span>{original.phone}</span>
      </div>
    ),
  },
  {
    header: "Role",
    accessorKey: "role.name",
    cell: ({
      row: {
        original: { role },
      },
    }) => (
      <Badge variant="secondary" className="w-fit uppercase">
        {role.name}
      </Badge>
    ),
  },

  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row: { original } }) => format(original.createdAt, "PP"),
  },
];
