import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <AlertCircle className="w-20 h-20 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Template Not Found
            </h1>
            <p className="text-muted-foreground">
              The design template you&apos;re looking for doesn&apos;t exist or
              has been moved.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/templates">
              <Search className="w-4 h-4 mr-2" />
              Browse All Templates
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            If you believe this is an error, please{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
