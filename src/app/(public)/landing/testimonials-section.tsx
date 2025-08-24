import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mwangi",
    company: "Tech Startup Kenya",
    review:
      "Red Bead delivered exactly what we needed for our conference. The lanyards were perfect quality and arrived on time!",
    rating: 5,
  },
  {
    name: "John Kiprotich",
    company: "NGO Director",
    review:
      "Outstanding service and quality. Our custom wristbands were a huge hit at our charity event. Highly recommended!",
    rating: 5,
  },
  {
    name: "Grace Wanjiku",
    company: "Corporate Events",
    review:
      "Professional, reliable, and great value for money. Red Bead has become our go-to partner for all corporate merchandise.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don&apos;t just take our word for it - hear from our satisfied
            clients
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  &quot;{testimonial.review}&quot;
                </p>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
