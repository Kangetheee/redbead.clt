import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Headphones,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function ContactInfo() {
  return (
    <div className="lg:col-span-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Contact Information
      </h2>

      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
            <p className="text-gray-600">
              123 Business Park Road
              <br />
              Westlands, Nairobi
              <br />
              Kenya
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
            <p className="text-gray-600">
              +254 700 123 456
              <br />
              +254 20 123 4567
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600">
              hello@redbead.co.ke
              <br />
              quotes@redbead.co.ke
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
            <p className="text-gray-600">
              Mon - Fri: 8:00 AM - 6:00 PM
              <br />
              Sat: 9:00 AM - 4:00 PM
              <br />
              Sun: Closed
            </p>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="mt-8 space-y-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <Headphones className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">24/7 Support</p>
              <p className="text-sm text-gray-600">
                We&apos;re always here to help
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Quick Response</p>
              <p className="text-sm text-gray-600">
                Usually reply within 2 hours
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
