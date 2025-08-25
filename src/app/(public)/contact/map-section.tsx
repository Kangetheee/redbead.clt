import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MapSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Visit Our Office
          </h2>
          <p className="text-lg text-muted-foreground">
            Located in the heart of Westlands, Nairobi
          </p>
        </div>

        <div className="rounded-lg overflow-hidden shadow-lg border border-border">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8199421324405!2d36.81006881475394!3d-1.2920659990588744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0x82001c23e7c43c4d!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1690123456789!5m2!1sen!2ske"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Red Bead Office Location - Westlands, Nairobi"
            className="dark:hue-rotate-180 dark:invert"
          />
        </div>

        {/* Location Details Card */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Our Address
                  </h3>
                  <p className="text-muted-foreground">
                    123 Business Park Road
                    <br />
                    Westlands, Nairobi
                    <br />
                    Kenya
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Directions
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Easy access from Waiyaki Way and Ring Road. Parking
                    available on-site.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://www.google.com/maps/dir//Westlands,+Nairobi/@-1.2920659,36.8100688,17z"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Directions
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
