import { Users, Award, Clock, Headphones } from "lucide-react";

const indicators = [
  {
    icon: Users,
    value: "500+",
    label: "Happy Clients",
  },
  {
    icon: Award,
    value: "5 Years",
    label: "Experience",
  },
  {
    icon: Clock,
    value: "48Hr",
    label: "Quick Delivery",
  },
  {
    icon: Headphones,
    value: "24/7",
    label: "Support",
  },
];

export function TrustIndicators() {
  return (
    <section className="py-12 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {indicators.map((indicator, index) => {
            const IconComponent = indicator.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {indicator.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {indicator.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
