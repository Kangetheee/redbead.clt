/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Tag,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";

// Types based on API specification
interface CustomerTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  customerCount?: number;
}

interface TagStats {
  totalTags: number;
  totalTaggedCustomers: number;
  mostUsedTag: {
    name: string;
    count: number;
  } | null;
  recentlyCreated: number;
}

const getTagStyle = (color?: string) => {
  if (!color) {
    return "bg-gray-100 text-gray-800 border-gray-200";
  }

  // Convert hex color to appropriate text color
  const brightness =
    parseInt(color.slice(1, 3), 16) * 0.299 +
    parseInt(color.slice(3, 5), 16) * 0.587 +
    parseInt(color.slice(5, 7), 16) * 0.114;

  const textColor = brightness > 128 ? "#000000" : "#FFFFFF";

  return {
    backgroundColor: color,
    color: textColor,
    borderColor: color,
  };
};

export default function CustomerTagsPage() {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        const mockTags: CustomerTag[] = [
          {
            id: "tag-001",
            name: "VIP Customer",
            color: "#FFD700",
            createdAt: "2024-01-10T09:00:00.000Z",
            customerCount: 15,
          },
          {
            id: "tag-002",
            name: "High Volume",
            color: "#FF6B35",
            createdAt: "2024-01-12T14:30:00.000Z",
            customerCount: 8,
          },
          {
            id: "tag-003",
            name: "Frequent Buyer",
            color: "#2E8B57",
            createdAt: "2024-01-08T11:15:00.000Z",
            customerCount: 23,
          },
          {
            id: "tag-004",
            name: "New Customer",
            color: "#4169E1",
            createdAt: "2024-01-15T16:45:00.000Z",
            customerCount: 12,
          },
          {
            id: "tag-005",
            name: "Corporate Client",
            color: "#8B4513",
            createdAt: "2024-01-05T08:20:00.000Z",
            customerCount: 6,
          },
          {
            id: "tag-006",
            name: "Requires Follow-up",
            color: "#DC143C",
            createdAt: "2024-01-14T13:10:00.000Z",
            customerCount: 4,
          },
        ];

        const mockStats: TagStats = {
          totalTags: mockTags.length,
          totalTaggedCustomers: mockTags.reduce(
            (sum, tag) => sum + (tag.customerCount || 0),
            0
          ),
          mostUsedTag: {
            name: "Frequent Buyer",
            count: 23,
          },
          recentlyCreated: 2,
        };

        setTags(mockTags);
        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching customer tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTag = async (tagId: string) => {
    try {
      // API call to delete tag
      console.log("Deleting tag:", tagId);
      setTags(tags.filter((tag) => tag.id !== tagId));
      setDeletingTagId(null);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Tags</h1>
          <p className="text-gray-600 mt-1">
            Organize and categorize your customers with custom tags
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/customer-tags/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Tag
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalTags}</p>
                  <p className="text-sm text-gray-600">Total Tags</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalTaggedCustomers}
                  </p>
                  <p className="text-sm text-gray-600">Tagged Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Badge className="w-5 h-5 text-purple-600" />
                <div>
                  {stats.mostUsedTag ? (
                    <>
                      <p className="text-2xl font-bold">
                        {stats.mostUsedTag.count}
                      </p>
                      <p className="text-sm text-gray-600">
                        Most Used: {stats.mostUsedTag.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-sm text-gray-600">No usage data</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.recentlyCreated}</p>
                  <p className="text-sm text-gray-600">Created This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tags by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Tags</CardTitle>
          <CardDescription>
            {filteredTags.length} of {tags.length} tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className="font-medium px-3 py-1"
                        style={
                          typeof getTagStyle(tag.color) === "object"
                            ? getTagStyle(tag.color)
                            : {}
                        }
                      >
                        {tag.name}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    {tag.color ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: tag.color }}
                        />
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {tag.color}
                        </code>
                      </div>
                    ) : (
                      <span className="text-gray-400">No color</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {tag.customerCount || 0}
                      </span>
                      <span className="text-gray-600">customers</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {format(new Date(tag.createdAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(tag.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customer-tags/${tag.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customer-tags/${tag.id}/edit`}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Tag
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeletingTagId(tag.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTags.length === 0 && (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No tags found matching your search."
                  : "No customer tags created yet."}
              </p>
              {!searchTerm && (
                <Button asChild className="mt-4">
                  <Link href="/admin/customer-tags/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Tag
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTagId}
        onOpenChange={() => setDeletingTagId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This action cannot be
              undone and will remove the tag from all customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTagId && handleDeleteTag(deletingTagId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
