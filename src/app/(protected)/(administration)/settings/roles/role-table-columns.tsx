import { ColumnDef } from "@tanstack/react-table";
import { Shield, Star } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleResponse } from "@/lib/roles/types/roles.types";

export const RoleTableColumns: ColumnDef<RoleResponse>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row: { original } }) => (
      <span className="flex items-center gap-2 font-medium">
        {original.isSystem ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Shield className="size-4 text-green-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>System Role</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Star className="size-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Custom Role</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <span className="uppercase">{original.name}</span>
      </span>
    ),
  },
  { header: "Permission Count", accessorKey: "permissionCount" },
  { header: "Description", accessorKey: "description" },
];
