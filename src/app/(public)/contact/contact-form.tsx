"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createInquiryAction } from "@/lib/enquiries/enquiries.action";
import {
  CreateInquiryDto,
  ContactPreferenceEnum,
} from "@/lib/enquiries/types/enquiries.types";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<CreateInquiryDto>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactPreference: ContactPreferenceEnum.EMAIL,
    bulkOrders: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a clean payload, removing empty optional fields
    const payload: CreateInquiryDto = {
      name: formData.name,
      subject: formData.subject,
      message: formData.message,
      ...(formData.email && { email: formData.email }),
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.contactPreference && {
        contactPreference: formData.contactPreference,
      }),
      ...(formData.bulkOrders !== undefined && {
        bulkOrders: formData.bulkOrders,
      }),
    };

    try {
      setIsSubmitting(true);
      const result = await createInquiryAction(payload);

      if (result.success) {
        // Show success toast
        toast.success("Message sent successfully!", {
          description: "We'll get back to you as soon as possible.",
        });

        // Reset the form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          contactPreference: ContactPreferenceEnum.EMAIL,
          bulkOrders: false,
        });

        // Show the success UI
        setIsSubmitted(true);
      } else {
        // Show error toast
        toast.error("Failed to send message", {
          description: result.error || "Please try again later.",
        });
      }
    } catch (error) {
      // Show error toast for unexpected errors
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
      console.error("Error submitting enquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateInquiryDto,
    value: string | ContactPreferenceEnum | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="lg:col-span-2">
      <Card className="p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Send Us a Message
          </CardTitle>
          <p className="text-gray-600">
            Fill out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                Thanks for contacting us. We will get back to you shortly.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 123 456"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPreference">
                    Preferred Contact Method
                  </Label>
                  <Select
                    value={formData.contactPreference}
                    onValueChange={(value: ContactPreferenceEnum) =>
                      handleInputChange("contactPreference", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ContactPreferenceEnum.EMAIL}>
                        Email
                      </SelectItem>
                      <SelectItem value={ContactPreferenceEnum.CALL}>
                        Phone Call
                      </SelectItem>
                      <SelectItem value={ContactPreferenceEnum.SMS}>
                        SMS
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your project requirements, quantities, timeline, etc."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulkOrders"
                  checked={formData.bulkOrders || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("bulkOrders", checked as boolean)
                  }
                />
                <Label htmlFor="bulkOrders" className="text-sm font-normal">
                  I&apos;m interested in bulk orders (50+ items)
                </Label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
