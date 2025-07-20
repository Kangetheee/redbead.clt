/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-customers";
import { GetCustomersDto } from "@/lib/customers/dto/customers.dto";

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchParams, setSearchParams] = useState<GetCustomersDto>({
    page: 1,
    limit: 10,
  });

  const { data: customersData, isLoading, error } = useCustomers(searchParams);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const customers = customersData?.data || [];
  const meta = customersData?.meta;

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => ({
        ...prev,
        search: searchInput || undefined,
        page: 1,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading customers: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/admin/customers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            View and manage all customers in your database.
            {meta && (
              <span className="block mt-1">
                Showing {customers.length} of {meta.totalItems} customers
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="w-full pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">
                        Loading customers...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : customers.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar || ""} />
                            <AvatarFallback>
                              {customer.name ? getInitials(customer.name) : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            <Link
                              href={`/dashboard/admin/customers/${customer.id}`}
                              className="hover:underline"
                            >
                              {customer.name || "Unnamed Customer"}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              ID: {customer.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-muted-foreground text-sm">
                              No contact info
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.company || "—"}</TableCell>
                      <TableCell>
                        {customer.notes ? (
                          <div
                            className="max-w-xs truncate"
                            title={customer.notes}
                          >
                            {customer.notes}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                href={`/dashboard/admin/customers/${customer.id}`}
                                className="flex items-center"
                              >
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/dashboard/admin/customers/${customer.id}/edit`}
                                className="flex items-center"
                              >
                                Edit customer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/dashboard/admin/customers/${customer.id}/orders`}
                                className="flex items-center"
                              >
                                View orders
                              </Link>
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <a href={`mailto:${customer.email}`}>
                                  Send email
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Create order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchInput
                          ? "No customers found matching your search"
                          : "No customers found"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination */}
          {meta && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing page {meta.currentPage} of {meta.totalPages}(
                {meta.totalItems} total customers)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage === 1}
                  onClick={() => handlePageChange(meta.currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    {meta.currentPage} / {meta.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage === meta.totalPages}
                  onClick={() => handlePageChange(meta.currentPage + 1)}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage === meta.totalPages}
                  onClick={() => handlePageChange(meta.totalPages)}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
