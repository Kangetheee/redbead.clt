import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Award, Clock } from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We use only the finest materials and latest printing technology to ensure your products meet the highest standards.",
    features: ["ISO Certified", "Quality Guarantee", "Premium Materials"],
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description:
      "Need it urgently? Our streamlined production process ensures quick delivery without compromising quality.",
    features: ["Express Options", "Rush Orders", "Real-time Tracking"],
  },
  {
    icon: Users,
    title: "Expert Support",
    description:
      "Our experienced team guides you through every step, from design consultation to final delivery.",
    features: ["Design Support", "Bulk Discounts", "Account Management"],
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose Red Bead?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to delivering exceptional quality and service
            that helps your brand make a lasting impression.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card
                key={index}
                className="text-center p-8 hover:shadow-lg transition-shadow border-border bg-card"
              >
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <IconComponent className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-center text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
