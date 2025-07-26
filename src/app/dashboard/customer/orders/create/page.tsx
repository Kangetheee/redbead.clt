"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Package, Zap, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomerQuickOrderForm from "./quick-order-form";

export default function CustomerCreateOrderPage() {
  const handleOrderSuccess = (orderId: string) => {
    // Redirect to order details or show success message
    console.log("Order created successfully:", orderId);
  };

  const handleCancel = () => {
    // Handle cancellation
    window.history.back();
  };

  const orderTypes = [
    {
      title: "Custom Printing",
      description: "Business cards, flyers, banners, and custom designs",
      features: ["Custom Design", "High Quality Print", "Multiple Formats"],
      popular: true,
    },
    {
      title: "Promotional Items",
      description: "Branded merchandise, giveaways, and marketing materials",
      features: ["Brand Customization", "Bulk Pricing", "Quick Turnaround"],
      popular: false,
    },
    {
      title: "Event Materials",
      description: "Conference materials, signage, and event collateral",
      features: [
        "Event Planning Support",
        "Rush Orders Available",
        "Large Format",
      ],
      popular: false,
    },
  ];

  const urgencyOptions = [
    {
      level: "NORMAL",
      title: "Standard",
      description: "5-7 business days",
      icon: Clock,
      color: "text-green-600 bg-green-50",
    },
    {
      level: "EXPEDITED",
      title: "Expedited",
      description: "3-4 business days",
      icon: Zap,
      color: "text-orange-600 bg-orange-50",
    },
    {
      level: "RUSH",
      title: "Rush",
      description: "1-2 business days",
      icon: Zap,
      color: "text-red-600 bg-red-50",
    },
    {
      level: "EMERGENCY",
      title: "Emergency",
      description: "Same day/next day",
      icon: Zap,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Order
            </h1>
            <p className="text-muted-foreground">
              Design and place your custom printing order
            </p>
          </div>
        </div>
      </div>

      {/* Helpful Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            <strong>Need help?</strong> Our design team can assist with your
            project.
            <Button variant="link" size="sm" className="ml-2 p-0 h-auto">
              Contact Support
            </Button>
          </AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Rush orders available.</strong> Need it faster? We offer
            same-day delivery for urgent projects.
          </AlertDescription>
        </Alert>

        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Bulk discounts.</strong> Save more when you order larger
            quantities.
          </AlertDescription>
        </Alert>
      </div>

      {/* Order Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Project Type</CardTitle>
          <CardDescription>
            Select the type of printing project you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {orderTypes.map((type, index) => (
              <div
                key={index}
                className={`relative p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  type.popular ? "border-primary bg-primary/5" : ""
                }`}
              >
                {type.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    Popular
                  </Badge>
                )}

                <h3 className="font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {type.description}
                </p>

                <div className="space-y-1">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Urgency Options */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
          <CardDescription>
            Choose your preferred delivery speed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {urgencyOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${option.color} border-current`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{option.title}</span>
                  </div>
                  <p className="text-sm">{option.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Order Form */}
      <CustomerQuickOrderForm
        onSuccess={handleOrderSuccess}
        onCancel={handleCancel}
      />

      {/* Additional Help */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help Getting Started?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Common Questions</h4>
              <div className="space-y-2 text-sm">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto"
                >
                  What file formats do you accept?
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto"
                >
                  How do I prepare my design files?
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto"
                >
                  What are your rush order policies?
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto"
                >
                  How does design approval work?
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Get Support</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Contact Design Team
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  View Pricing Guide
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
