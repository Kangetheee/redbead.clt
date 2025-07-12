import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/lib/activity/types/activity.types";
import { cn } from "@/lib/utils";

export const ActivityLogsTableColumns: ColumnDef<ActivityLog>[] = [
  {
    header: "User",
    accessorKey: "user",
    cell: ({ row: { original } }) => (
      <div className="flex gap-1 items-center">
        <span className="font-medium text-primary">
          {original.user || "System"}
        </span>
      </div>
    ),
  },
  {
    header: "Action",
    accessorKey: "actionType",
    cell: ({ row: { original } }) => {
      // Define colors for different action types
      const colorMap: Record<string, string> = {
        Viewed: "bg-blue-100 text-blue-800",
        Created: "bg-green-100 text-green-800",
        Updated: "bg-yellow-100 text-yellow-800",
        Deleted: "bg-red-100 text-red-800",
      };

      const bgColor =
        colorMap[original.actionType] || "bg-gray-100 text-gray-800";

      return (
        <Badge className={cn("text-xs font-medium", bgColor)}>
          {original.actionType}
        </Badge>
      );
    },
  },
  {
    header: "Resource",
    accessorKey: "resource",
    cell: ({ row: { original } }) => (
      <div className="flex flex-col">
        <span className="font-medium capitalize">{original.resource}</span>
        {original.resourceId && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            ID: {original.resourceId}
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Description",
    accessorKey: "readableDescription",
    cell: ({ row: { original } }) => (
      <span className="whitespace-normal text-sm">
        {original.readableDescription}
      </span>
    ),
  },
  {
    header: "Device",
    accessorKey: "device",
    cell: ({ row: { original } }) => (
      <div className="flex items-center gap-1">
        {getDeviceIcon(original.device)}
        <span className="text-sm">{original.device || "Unknown"}</span>
      </div>
    ),
  },
  {
    header: "IP Address",
    accessorKey: "ipAddress",
    cell: ({ row: { original } }) => (
      <span className="text-sm font-mono">{original.ipAddress || "N/A"}</span>
    ),
  },
  {
    header: "Date & Time",
    accessorKey: "timestamp",
    cell: ({ row: { original } }) => {
      const date = new Date(original.timestamp);
      return (
        <div className="flex flex-col gap-1">
          <p className="text-xs">
            <span className="font-medium text-primary">
              {format(date, "PPP")}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{format(date, "p")}</p>
        </div>
      );
    },
  },
];

// Helper function to get icon based on device type
function getDeviceIcon(device: string | null) {
  if (!device) return <span className="text-lg">❓</span>;

  switch (device.toLowerCase()) {
    case "mobile device":
      return <span className="text-lg">📱</span>;
    case "tablet":
      return <span className="text-lg">📲</span>;
    case "desktop computer":
      return <span className="text-lg">💻</span>;
    case "api client":
      return <span className="text-lg">🤖</span>;
    default:
      return <span className="text-lg">🖥️</span>;
  }
}
