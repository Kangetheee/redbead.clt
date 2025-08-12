/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { getSession } from "@/lib/session/session";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { CustomerNavbar } from "@/components/layouts/customer-nav";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OrderCreationClient from "./order-creation-client";

export default async function CreateOrdersPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <CustomerNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Orders
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                Create Order
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section>
          <OrderCreationClient />
        </section>
      </div>
    </div>
  );
}
