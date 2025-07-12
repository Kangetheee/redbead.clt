"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  BarChart4,
  FileEdit,
  FileText,
  MessageSquarePlus,
  Search,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

// Comment: Quick-Action Shortcuts for common tasks
// ➤ Create New Client
// ➤ Start Manual Conversation
// ➤ Add/Edit Plan or Underwriter
// ➤ Review Pending Feedback
// ➤ Audit Log Search

const actionCards = [
  {
    title: "Create New Client",
    description: "Register a new insurance client",
    icon: UserPlus,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    action: "client-form",
  },
  {
    title: "Start Conversation",
    description: "Begin a manual client conversation",
    icon: MessageSquarePlus,
    color: "text-green-500",
    bgColor: "bg-green-50",
    action: "conversation-form",
  },
  {
    title: "Manage Plans",
    description: "Add or edit plans and underwriters",
    icon: FileEdit,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    action: "plan-form",
  },
  {
    title: "Review Feedback",
    description: "Check client reviews and ratings",
    icon: ThumbsUp,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    action: "feedback-list",
  },
  {
    title: "Audit Log Search",
    description: "Search system activity records",
    icon: Search,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    action: "audit-search",
  },
  {
    title: "Generate Reports",
    description: "Create custom analytics reports",
    icon: BarChart4,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    action: "reports",
  },
  {
    title: "Manage Bot Questions",
    description: "Edit or create bot question flows",
    icon: FileText,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    action: "question-editor",
  },
  {
    title: "System Health",
    description: "Monitor platform performance",
    icon: Activity,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    action: "system-health",
  },
];

export default function QuickActions() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Shortcuts to common tasks and operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {actionCards.map((action, index) => (
            <Dialog
              key={index}
              open={activeDialog === action.action}
              onOpenChange={(open) =>
                setActiveDialog(open ? action.action : null)
              }
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`flex flex-col items-center justify-center h-full w-full p-4 gap-2 hover:${
                    action.bgColor
                  } border-2 hover:border-${action.color.replace("text-", "")}`}
                >
                  <div className={`p-2 rounded-full ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-sm whitespace-normal">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-normal">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="whitespace-normal">
                    {action.title}
                  </DialogTitle>
                  <DialogDescription className="whitespace-normal">
                    {action.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className={`p-4 rounded-full ${action.bgColor}`}>
                      <action.icon className={`h-8 w-8 ${action.color}`} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Feature coming soon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This functionality will be implemented in the next phase
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
