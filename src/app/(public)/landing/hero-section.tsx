import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "./action-buttons";
import { SessionProps } from "@/lib/session/session.types";

export function HeroSection({ session }: SessionProps) {
  const isLoggedIn = !!session?.user;

  return (
    <section className="relative bg-gradient-to-br from-green-50 via-background to-red-50 dark:from-green-950/20 dark:via-background dark:to-red-950/20 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70">
            🎉 Kenya&apos;s Leading Custom Print Solutions
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <>
              Custom Print Solutions
              <span className="block text-green-600 dark:text-green-400">
                Made in Kenya
              </span>
            </>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isLoggedIn
              ? "Continue exploring our premium collection or check your order status."
              : "From corporate lanyards to custom wristbands, we deliver high-quality branded products that make your business stand out."}
          </p>

          <ActionButtons
            primaryHref={isLoggedIn ? "/dashboard" : "/products"}
            primaryText={isLoggedIn ? "View Dashboard" : "Explore Products"}
            secondaryHref={isLoggedIn ? "/products" : "/quote"}
            secondaryText={isLoggedIn ? "Browse Products" : "Get Custom Quote"}
          />
        </div>
      </div>
    </section>
  );
}
