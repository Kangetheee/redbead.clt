import { Badge } from "@/components/ui/badge";

export function getUrgencyBadge(urgencyLevel?: string) {
  if (!urgencyLevel || urgencyLevel === "NORMAL") return null;

  const urgencyColors = {
    EXPEDITED: "bg-yellow-100 text-yellow-800",
    RUSH: "bg-orange-100 text-orange-800",
    EMERGENCY: "bg-red-100 text-red-800",
  };

  return (
    <Badge
      className={
        urgencyColors[urgencyLevel as keyof typeof urgencyColors] || ""
      }
    >
      {urgencyLevel}
    </Badge>
  );
}
